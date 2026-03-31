import { useState, useCallback, useMemo } from 'react';
import { mockFiles } from '@/data/mockData';
import { mockFilesFromApi } from '@/data/mockFileData';
import type { File } from '@/data/mockData';

const ALL_FILES: File[] = [...mockFiles, ...mockFilesFromApi];

function buildS3KeyRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(escaped, 'i');
}

export interface FilesSearchState {
  portalRunId: string;
  bucketName: string;
  s3KeyPattern: string;
}

export interface UseFilesSearchReturn {
  portalRunId: string;
  setPortalRunId: (v: string) => void;
  bucketName: string;
  setBucketName: (v: string) => void;
  s3KeyPattern: string;
  setS3KeyPattern: (v: string) => void;
  hasSearched: boolean;
  searchResults: File[];
  searchError: string | null;
  canSearch: boolean;
  handleSearch: () => void;
  handleClear: () => void;
}

/**
 * At least one of Portal Run ID, Bucket Name, or S3 Key Pattern must be set to run a search.
 */
export function useFilesSearch(): UseFilesSearchReturn {
  const [portalRunId, setPortalRunId] = useState('');
  const [bucketName, setBucketName] = useState('');
  const [s3KeyPattern, setS3KeyPattern] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<File[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const canSearch = useMemo(
    () => portalRunId.trim() !== '' || bucketName.trim() !== '' || s3KeyPattern.trim() !== '',
    [portalRunId, bucketName, s3KeyPattern]
  );

  const handleSearch = useCallback(() => {
    setSearchError(null);
    if (!canSearch) {
      setSearchError('Provide at least one of: Portal Run ID, Bucket Name, or S3 Key Pattern.');
      return;
    }

    const results = ALL_FILES.filter((file) => {
      const matchesPortalRun =
        !portalRunId.trim() ||
        (file.portalRunId && file.portalRunId.toLowerCase().includes(portalRunId.toLowerCase()));

      const matchesBucket =
        !bucketName.trim() || file.bucket.toLowerCase().includes(bucketName.toLowerCase());

      let matchesS3Key = true;
      if (s3KeyPattern.trim()) {
        const regex = buildS3KeyRegex(s3KeyPattern);
        matchesS3Key = regex.test(file.s3Key);
      }

      return matchesBucket && matchesPortalRun && matchesS3Key;
    });

    setSearchResults(results);
    setHasSearched(true);
  }, [canSearch, portalRunId, bucketName, s3KeyPattern]);

  const handleClear = useCallback(() => {
    setPortalRunId('');
    setBucketName('');
    setS3KeyPattern('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchError(null);
  }, []);

  return {
    portalRunId,
    setPortalRunId,
    bucketName,
    setBucketName,
    s3KeyPattern,
    setS3KeyPattern,
    hasSearched,
    searchResults,
    searchError,
    canSearch,
    handleSearch,
    handleClear,
  };
}
