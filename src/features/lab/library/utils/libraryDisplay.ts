import type { PillTagVariant } from '@/components/ui/PillTag';

export function getQualityVariant(quality: string): PillTagVariant {
  const normalizedQuality = quality.toLowerCase();

  if (normalizedQuality === 'good') {
    return 'green';
  }

  if (normalizedQuality === 'borderline') {
    return 'amber';
  }

  if (normalizedQuality === 'poor' || normalizedQuality === 'very-poor') {
    return 'red';
  }

  return 'neutral';
}
