import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { genomes } from './genomes';
import igvModule from 'igv';
import {
  canUseHtsGet,
  constructHtsGetUrl,
  constructIgvNameParameter,
  createIdxFileKey,
  createIgvFileTrack,
  type IgvTrackSourceType,
} from './utils';
import { useFilePresignedURLListModel, useFilePresignedURLModel } from '../../../api/files.api';
import { IgvDesktopButton } from '../../IgvDesktopButton';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { cn } from '@/utils/cn';

type IgvViewerProps = { s3ObjectId: string; bucket: string; s3Key: string; htsGetBaseUrl?: string };

const INITIAL_REFERENCE_GENOME = 'hg38';

type IgvBrowser = {
  loadGenome: (genome: string) => Promise<void>;
};

type IgvCreateOptions = {
  genome: string;
  genomeList: typeof genomes;
  loadDefaultGenomes: boolean;
  tracks: unknown[];
};

type IgvApi = {
  createBrowser: (container: HTMLElement, options: IgvCreateOptions) => Promise<IgvBrowser>;
  removeBrowser: (browser: IgvBrowser) => void;
};

const igv = igvModule as unknown as IgvApi;

const toError = (error: unknown, fallbackMessage: string): Error => {
  return error instanceof Error ? error : new Error(fallbackMessage);
};

const toOptionalError = (error: unknown, fallbackMessage: string): Error | null => {
  return error ? toError(error, fallbackMessage) : null;
};

export const IgvViewer = ({ s3ObjectId, bucket, s3Key, htsGetBaseUrl }: IgvViewerProps) => {
  const browserRef = useRef<IgvBrowser | null>(null);
  const igvContainerRef = useRef<HTMLDivElement | null>(null);
  const [refGenome, setRefGenome] = useState<string>(INITIAL_REFERENCE_GENOME);
  const [isBrowserLoading, setIsBrowserLoading] = useState(false);
  const [isGenomeLoading, setIsGenomeLoading] = useState(false);
  const [browserError, setBrowserError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const idxKeyResult = useMemo(() => {
    try {
      return { idxKey: createIdxFileKey(s3Key), error: null };
    } catch (error) {
      return {
        idxKey: null,
        error: toError(error, 'Unable to determine the IGV index file.'),
      };
    }
  }, [s3Key]);

  const sourceType: IgvTrackSourceType = htsGetBaseUrl && canUseHtsGet(s3Key) ? 'htsget' : 'file';
  const shouldUsePresignedFiles = sourceType === 'file';

  const baseFileUrlQuery = useFilePresignedURLModel({
    params: { path: { id: s3ObjectId } },
    reactQuery: { enabled: shouldUsePresignedFiles && !idxKeyResult.error },
  });

  const idxFileUrlQuery = useFilePresignedURLListModel({
    params: { query: { bucket, key: idxKeyResult.idxKey ?? '' } },
    reactQuery: { enabled: shouldUsePresignedFiles && !!idxKeyResult.idxKey },
  });

  const baseFileUrl =
    sourceType === 'htsget' && htsGetBaseUrl
      ? constructHtsGetUrl({ htsGetBaseUrl, bucket, s3Key })
      : baseFileUrlQuery.data;
  const idxFilePresignedUrl =
    shouldUsePresignedFiles && idxFileUrlQuery.data?.results.length === 1
      ? idxFileUrlQuery.data.results[0]
      : undefined;

  const missingIndexError =
    shouldUsePresignedFiles &&
    idxFileUrlQuery.isSuccess &&
    !idxFilePresignedUrl &&
    idxKeyResult.idxKey
      ? new Error(`No matching index file found for ${idxKeyResult.idxKey}.`)
      : null;

  const dataError =
    idxKeyResult.error ??
    toOptionalError(baseFileUrlQuery.error, 'Unable to create a presigned URL.') ??
    toOptionalError(idxFileUrlQuery.error, 'Unable to load the index presigned URL.') ??
    missingIndexError;

  const isPreparingTrack =
    shouldUsePresignedFiles &&
    (baseFileUrlQuery.isLoading ||
      baseFileUrlQuery.isFetching ||
      idxFileUrlQuery.isLoading ||
      idxFileUrlQuery.isFetching);

  const createTrack = useCallback(async (): Promise<unknown> => {
    if (!baseFileUrl) throw new Error('Unable to create IGV track URL.');
    if (sourceType === 'file' && !idxFilePresignedUrl) {
      throw new Error('Unable to create IGV track because the index file is unavailable.');
    }

    return createIgvFileTrack({
      igvName: constructIgvNameParameter({ key: s3Key }),
      sourceType,
      baseFileUrl,
      idxFilePresignedUrl,
    });
  }, [baseFileUrl, idxFilePresignedUrl, s3Key, sourceType]);

  useEffect(() => {
    const container = igvContainerRef.current;
    if (!container || dataError || !baseFileUrl || isPreparingTrack) return;
    if (sourceType === 'file' && !idxFilePresignedUrl) return;

    let isCancelled = false;

    const loadBrowser = async () => {
      setBrowserError(null);
      setIsBrowserLoading(true);

      if (browserRef.current) {
        igv.removeBrowser(browserRef.current);
        browserRef.current = null;
      }

      container.replaceChildren();

      try {
        const track = await createTrack();
        const options: IgvCreateOptions = {
          genomeList: genomes,
          loadDefaultGenomes: false,
          genome: INITIAL_REFERENCE_GENOME,
          tracks: [track],
        };
        const browser = await igv.createBrowser(container, options);

        if (isCancelled) {
          igv.removeBrowser(browser);
          return;
        }

        browserRef.current = browser;
        setRefGenome(INITIAL_REFERENCE_GENOME);
      } catch (error) {
        if (!isCancelled) {
          setBrowserError(toError(error, 'Unable to initialise IGV.'));
        }
      } finally {
        if (!isCancelled) {
          setIsBrowserLoading(false);
        }
      }
    };

    void loadBrowser();

    return () => {
      isCancelled = true;

      if (browserRef.current) {
        igv.removeBrowser(browserRef.current);
        browserRef.current = null;
      }

      container.replaceChildren();
    };
  }, [
    baseFileUrl,
    createTrack,
    dataError,
    idxFilePresignedUrl,
    isPreparingTrack,
    reloadKey,
    sourceType,
  ]);

  const handleReferenceGenomeSelect = (genomeId: string) => {
    if (genomeId === refGenome || isGenomeLoading) return;

    const browser = browserRef.current;
    if (!browser) return;

    setBrowserError(null);
    setIsGenomeLoading(true);

    void browser
      .loadGenome(genomeId)
      .then(() => {
        setRefGenome(genomeId);
      })
      .catch((error) => {
        setBrowserError(toError(error, 'Unable to load reference genome.'));
      })
      .finally(() => {
        setIsGenomeLoading(false);
      });
  };

  const handleRetry = () => {
    setBrowserError(null);
    setReloadKey((value) => value + 1);

    if (shouldUsePresignedFiles) {
      void baseFileUrlQuery.refetch();
      void idxFileUrlQuery.refetch();
    }
  };

  const selectedGenome = genomes.find((g) => g.id === refGenome) ?? genomes[0];
  const displayError = dataError ?? browserError;
  const showLoadingState = isPreparingTrack || isBrowserLoading;

  return (
    <div className='flex h-full w-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      <div className='flex w-full flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-[#2d3540] dark:bg-[#171b21]'>
        <IgvDesktopButton s3ObjectId={s3ObjectId} bucket={bucket} s3Key={s3Key} />

        {showLoadingState && (
          <div className='flex items-center gap-2 text-xs text-neutral-500 dark:text-[#9dabb9]'>
            <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
            <span>{isPreparingTrack ? 'Preparing IGV track' : 'Loading IGV web'}</span>
          </div>
        )}

        <div className='ml-auto flex items-center gap-2'>
          <span className='text-sm font-medium text-neutral-700 dark:text-[#9dabb9]'>
            Reference Genome
          </span>
          <Menu as='div' className='relative'>
            <MenuButton
              disabled={showLoadingState || !!displayError || isGenomeLoading}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-md border border-neutral-300 px-2 py-1',
                'text-xs leading-none font-medium whitespace-nowrap text-neutral-700 transition-colors hover:bg-neutral-50',
                'disabled:cursor-not-allowed disabled:opacity-60',
                'dark:border-[#2d3540] dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
              )}
              aria-label='Select reference genome'
            >
              <span className='text-sm font-medium text-neutral-700 dark:text-[#9dabb9]'>
                {selectedGenome?.id ?? refGenome}
              </span>
              {isGenomeLoading ? (
                <Loader2
                  className='h-4 w-4 animate-spin text-neutral-500 dark:text-[#9dabb9]'
                  aria-hidden='true'
                />
              ) : (
                <ChevronDown
                  className='h-5 w-5 text-neutral-500 dark:text-[#9dabb9]'
                  aria-hidden='true'
                />
              )}
            </MenuButton>

            <MenuItems
              anchor='bottom end'
              transition
              className='z-50 mt-1 w-64 origin-top-right overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg focus:outline-none dark:border-[#2d3540] dark:bg-[#111418] dark:shadow-black/40'
            >
              {genomes.map((genome) => {
                const isSelected = genome.id === refGenome;

                return (
                  <MenuItem key={genome.id}>
                    {({ active }) => (
                      <button
                        type='button'
                        onClick={() => handleReferenceGenomeSelect(genome.id)}
                        className={cn(
                          'flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700',
                          'data-focus:bg-neutral-100 dark:text-neutral-300 dark:data-focus:bg-[#1e252e]',
                          active && 'bg-neutral-100 dark:bg-[#1e252e]'
                        )}
                      >
                        <span className='flex-1 truncate'>{genome.name}</span>
                        {isSelected ? (
                          <Check className='h-4 w-4 text-blue-600 dark:text-[#137fec]' />
                        ) : null}
                      </button>
                    )}
                  </MenuItem>
                );
              })}
            </MenuItems>
          </Menu>
        </div>
      </div>

      <div className='relative min-h-140 flex-1 overflow-hidden bg-white dark:bg-[#111418]'>
        {displayError ? (
          <ApiErrorState
            title='Unable to load IGV viewer'
            error={displayError}
            onRetry={handleRetry}
            className='m-4'
          />
        ) : null}

        {showLoadingState && !displayError ? (
          <div className='absolute inset-0 z-10 bg-white/80 dark:bg-[#111418]/80'>
            <SpinnerWithText text='Loading IGV web ...' />
          </div>
        ) : null}

        <div
          ref={igvContainerRef}
          className={cn('h-full min-h-140 w-full', displayError && 'hidden')}
        />
      </div>
    </div>
  );
};
