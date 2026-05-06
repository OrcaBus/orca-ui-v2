import { MultiSelect } from '@/components/ui/MultiSelect';

const BUCKET_OPTIONS = [
  'org.umccr.data.oncoanalyser',
  'archive-prod-analysis-503977275616-ap-southeast-2',
  'archive-prod-fastq-503977275616-ap-southeast-2',
  'ntsm-fingerprints-472057503814-ap-southeast-2',
  'fastq-manager-sequali-outputs-472057503814-ap-southeast-2',
  'data-sharing-artifacts-472057503814-ap-southeast-2',
  'pipeline-montauk-977251586657-ap-southeast-2',
  'research-data-550435500918-ap-southeast-2',
  'project-data-889522050439-ap-southeast-2',
  'project-data-491085415398-ap-southeast-2',
  'project-data-071784445872-ap-southeast-2',
  'project-data-980504796380-ap-southeast-2',
  'pipeline-prod-cache-503977275616-ap-southeast-2',
  'test-data-503977275616-ap-southeast-2',
].map((b) => ({ value: b, label: b }));

interface FilesBucketSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export function FilesBucketSelect({ values, onChange, className }: FilesBucketSelectProps) {
  return (
    <MultiSelect
      values={values}
      onChange={onChange}
      options={BUCKET_OPTIONS}
      placeholder='Select buckets…'
      className={className}
    />
  );
}
