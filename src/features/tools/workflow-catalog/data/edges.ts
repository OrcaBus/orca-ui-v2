import type { EdgeDef } from '../types/workflow-catalog.types';

/**
 * Logical connections between workflow nodes.
 *
 * Edge types (matching the pipeline diagram legend):
 *  - trigger:          Solid arrow  →  trigger only
 *  - trigger_input:    Dashed arrow --→ trigger + input dependency
 *  - input_dependency: Dashed diamond --◆→ input dependency only
 */
export const CATALOG_EDGES: EdgeDef[] = [
  // ── Trigger only (solid) ───────────────────────────────────────────────────
  {
    id: 'e-bssh-bcl',
    source: 'bssh',
    target: 'bcl-convert',
    edgeType: 'trigger',
  },

  // ── Trigger + Input (dashed with arrowhead) ────────────────────────────────
  {
    id: 'e-bcl-tso',
    source: 'bcl-convert',
    target: 'tso-ctdna-tumor-only',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-bcl-wgs-qc',
    source: 'bcl-convert',
    target: 'wgs-alignment-qc',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-bcl-wts-qc',
    source: 'bcl-convert',
    target: 'wts-alignment-qc',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-tso-pierian',
    source: 'tso-ctdna-tumor-only',
    target: 'pierian-dx',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-wgs-qc-holmes',
    source: 'wgs-alignment-qc',
    target: 'holmes',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-wgs-qc-tn',
    source: 'wgs-alignment-qc',
    target: 'wgs-tumor-normal',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-wts-qc-to',
    source: 'wts-alignment-qc',
    target: 'wts-tumor-only',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-tn-umccrise',
    source: 'wgs-tumor-normal',
    target: 'umccrise',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-umccrise-pancan',
    source: 'umccrise',
    target: 'pancan',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-pancan-rnasum',
    source: 'pancan',
    target: 'rnasum',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-wts-to-onco-wgs',
    source: 'wts-tumor-only',
    target: 'oncoanalyser-wgs',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-onco-wgs-sash',
    source: 'oncoanalyser-wgs',
    target: 'sash',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-star-onco-wts',
    source: 'star-alignment',
    target: 'oncoanalyser-wts',
    edgeType: 'trigger_input',
  },
  {
    id: 'e-onco-wts-wgts',
    source: 'oncoanalyser-wts',
    target: 'oncoanalyser-wgts-existing-both',
    edgeType: 'trigger_input',
  },

  // ── Input dependency only (dashed with diamond) ────────────────────────────
  {
    id: 'e-bcl-tn-fastq',
    source: 'bcl-convert',
    target: 'wgs-tumor-normal',
    edgeType: 'input_dependency',
    label: 'use FASTQs as input',
  },
  {
    id: 'e-bcl-wts-fastq',
    source: 'bcl-convert',
    target: 'wts-tumor-only',
    edgeType: 'input_dependency',
    label: 'use FASTQs as input',
  },
  {
    id: 'e-bcl-star-fastq',
    source: 'bcl-convert',
    target: 'star-alignment',
    edgeType: 'input_dependency',
    label: 'use FASTQs as input',
  },
  {
    id: 'e-tn-gpl',
    source: 'wgs-tumor-normal',
    target: 'gpl',
    edgeType: 'input_dependency',
    label: 'use T/N as input',
  },
  {
    id: 'e-tn-sash',
    source: 'wgs-tumor-normal',
    target: 'sash',
    edgeType: 'input_dependency',
    label: 'use T/N as input',
  },
  {
    id: 'e-star-rnasum',
    source: 'star-alignment',
    target: 'rnasum',
    edgeType: 'input_dependency',
    label: 'use transcriptome bam as input',
  },
];
