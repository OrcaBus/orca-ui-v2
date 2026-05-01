import { useState, useCallback } from 'react';
import { mockFiles } from '@/data/mockData';
import { mockFilesFromApi } from '@/data/mockFileData';
import type { File } from '@/data/mockData';

const ALL_FILES: File[] = [...mockFiles, ...mockFilesFromApi];

function buildS3KeyRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(escaped, 'i');
}

export interface SearchParams {
  generalSearch: string;
  portalRunId: string;
  bucketName: string;
  s3KeyPattern: string;
}

export interface UseFilesSearchReturn {
  /** Committed general search value (matches across portal run ID, bucket, and S3 key). */
  generalSearch: string;
  /** Committed advanced filter values. */
  portalRunId: string;
  bucketName: string;
  s3KeyPattern: string;
  hasSearched: boolean;
  searchResults: File[];
  searchError: string | null;
  canSearch: boolean;
  /**
   * Execute a search with explicit parameter values.
   * Avoids async state issues — pass the full desired state directly.
   */
  executeSearch: (params: SearchParams) => void;
  handleClear: () => void;
}

/**
 * At least one of generalSearch, Portal Run ID, Bucket Name, or S3 Key Pattern must be set.
 */
export function useFilesSearch(): UseFilesSearchReturn {
  const [generalSearch, setGeneralSearch] = useState('');
  const [portalRunId, setPortalRunId] = useState('');
  const [bucketName, setBucketName] = useState('');
  const [s3KeyPattern, setS3KeyPattern] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<File[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const canSearch =
    generalSearch.trim() !== '' ||
    portalRunId.trim() !== '' ||
    bucketName.trim() !== '' ||
    s3KeyPattern.trim() !== '';

  const executeSearch = useCallback((params: SearchParams) => {
    const { generalSearch: gs, portalRunId: pr, bucketName: bn, s3KeyPattern: sk } = params;

    setGeneralSearch(gs);
    setPortalRunId(pr);
    setBucketName(bn);
    setS3KeyPattern(sk);
    setSearchError(null);

    const anySet = gs.trim() || pr.trim() || bn.trim() || sk.trim();
    if (!anySet) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const results = ALL_FILES.filter((file) => {
      // General search: OR match across portal run ID, bucket, and S3 key
      const matchesGeneral =
        !gs.trim() ||
        (file.portalRunId?.toLowerCase().includes(gs.toLowerCase()) ?? false) ||
        file.bucket.toLowerCase().includes(gs.toLowerCase()) ||
        file.s3Key.toLowerCase().includes(gs.toLowerCase());

      // Advanced filters: AND constraints
      const matchesPortalRun =
        !pr.trim() ||
        (file.portalRunId && file.portalRunId.toLowerCase().includes(pr.toLowerCase()));

      const matchesBucket = !bn.trim() || file.bucket.toLowerCase().includes(bn.toLowerCase());

      let matchesS3Key = true;
      if (sk.trim()) {
        const regex = buildS3KeyRegex(sk);
        matchesS3Key = regex.test(file.s3Key);
      }

      return matchesGeneral && matchesBucket && matchesPortalRun && matchesS3Key;
    });

    setSearchResults(results);
    setHasSearched(true);
  }, []);

  const handleClear = useCallback(() => {
    setGeneralSearch('');
    setPortalRunId('');
    setBucketName('');
    setS3KeyPattern('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchError(null);
  }, []);

  return {
    generalSearch,
    portalRunId,
    bucketName,
    s3KeyPattern,
    hasSearched,
    searchResults,
    searchError,
    canSearch,
    executeSearch,
    handleClear,
  };
}
