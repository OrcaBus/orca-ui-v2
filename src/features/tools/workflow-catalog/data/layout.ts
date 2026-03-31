import type { NodePosition } from '../types/workflow-catalog.types';

/**
 * Left-to-right layout positions matching the UMCCR automated pipeline diagram.
 *
 * Layer 0: BSSH
 * Layer 1: BCL_CONVERT
 * Layer 2: TSO_CTDNA, WGS_QC, WTS_QC, STAR_ALIGNMENT
 * Layer 3: PIERIAN_DX, HOLMES, WGS_TN, WTS_TO, GPL, ONCO_WTS
 * Layer 4: UMCCRISE, ONCO_WGS
 * Layer 5: PANCAN, SASH, ONCO_WGTS
 * Layer 6: RNASUM
 */
export const NODE_POSITIONS: Record<string, NodePosition> = {
  // Layer 0
  bssh: { x: 0, y: 330 },

  // Layer 1
  'bcl-convert': { x: 280, y: 330 },

  // Layer 2
  'tso-ctdna-tumor-only': { x: 580, y: 80 },
  'wgs-alignment-qc': { x: 580, y: 280 },
  'wts-alignment-qc': { x: 580, y: 540 },
  'star-alignment': { x: 580, y: 860 },

  // Layer 3
  'pierian-dx': { x: 900, y: 0 },
  holmes: { x: 900, y: 180 },
  'wgs-tumor-normal': { x: 900, y: 400 },
  'wts-tumor-only': { x: 900, y: 580 },
  gpl: { x: 900, y: 740 },
  'oncoanalyser-wts': { x: 900, y: 860 },

  // Layer 4
  umccrise: { x: 1220, y: 400 },
  'oncoanalyser-wgs': { x: 1220, y: 660 },

  // Layer 5
  pancan: { x: 1520, y: 340 },
  sash: { x: 1520, y: 660 },
  'oncoanalyser-wgts-existing-both': { x: 1520, y: 860 },

  // Layer 6
  rnasum: { x: 1820, y: 340 },
};

/**
 * Engine/platform colors matching the pipeline diagram legend.
 */
export const ENGINE_COLORS: Record<string, string> = {
  ON_PREM: '#f97316',
  BASESPACE: '#38bdf8',
  ICA: '#06b6d4',
  AWS_BATCH: '#f59e0b',
  SEQERA: '#3b82f6',
  PIERIAN: '#a855f7',
};
