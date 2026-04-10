import type { WorkflowNodeData } from '../types/workflow-catalog.types';

export const WORKFLOW_CATALOG: Record<string, WorkflowNodeData> = {
  // ── Layer 0: Sequencing Hub ────────────────────────────────────────────────
  bssh: {
    label: 'BSSH',
    version: 'v2.5.0',
    engine: 'BASESPACE',
    description:
      'BaseSpace Sequence Hub — Illumina cloud service that receives raw sequencing data from the instrument and stages it for downstream BCL conversion.',
    groupIds: ['SEQUENCING', 'WGS', 'WTS', 'CTDNA'],
    inputEvents: [
      {
        name: 'orcabus.instrumentrun.succeeded',
        topic: 'orcabus.instrumentrun',
        payload: {
          instrumentRunId: '231116_A01052_0172_BHVLM5DSX7',
          instrumentType: 'NovaSeq X Plus',
          status: 'SUCCEEDED',
          outputUri: 'bssh://runs/231116_A01052_0172_BHVLM5DSX7',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.bssh.fastqlistrows_event_showered',
        topic: 'orcabus.bssh',
        payload: {
          instrumentRunId: '231116_A01052_0172_BHVLM5DSX7',
          bsshProjectId: 'prj-12345',
          bsshOutputUri: 'bssh://runs/231116_A01052_0172_BHVLM5DSX7/output',
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '2h', computeQueue: 'basespace-default' },
  },

  // ── Layer 1: BCL Conversion ────────────────────────────────────────────────
  'bcl-convert': {
    label: 'BCL Convert',
    version: 'v4.2.7',
    engine: 'ICA',
    description:
      'Illumina BCL to FASTQ conversion pipeline on ICA (DRAGEN Cloud). Demultiplexes sequencing runs into per-sample FASTQ files for all downstream analysis workflows.',
    groupIds: ['SEQUENCING', 'WGS', 'WTS', 'CTDNA'],
    inputEvents: [
      {
        name: 'orcabus.bssh.fastqlistrows_event_showered',
        topic: 'orcabus.bssh',
        payload: {
          instrumentRunId: '231116_A01052_0172_BHVLM5DSX7',
          bsshProjectId: 'prj-12345',
          bsshOutputUri: 'bssh://runs/231116_A01052_0172_BHVLM5DSX7/output',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.bclconvert.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef01', // pragma: allowlist secret
          instrumentRunId: '231116_A01052_0172_BHVLM5DSX7',
          outputUri:
            'gds://production/primary_data/231116_A01052_0172_BHVLM5DSX7/20231116abcdef01/',
          fastqListRowsIds: ['fqlr-001', 'fqlr-002', 'fqlr-003'],
          sampleIds: ['L2301368', 'L2301369', 'L2301370'],
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '8h', computeQueue: 'ica-prod-bcl-convert' },
  },

  // ── Layer 2: Alignment & QC ────────────────────────────────────────────────
  'tso-ctdna-tumor-only': {
    label: 'TSO ctDNA Tumor Only',
    version: 'v2.6.1',
    engine: 'ICA',
    description:
      'TruSight Oncology ctDNA pipeline for circulating tumor DNA analysis. Runs tumor-only variant calling on liquid biopsy samples to detect somatic mutations from cell-free DNA.',
    groupIds: ['CTDNA'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.bclconvert.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: "$.libraryType == 'ctDNA'",
        payload: {
          portalRunId: '20231116abcdef01', // pragma: allowlist secret
          fastqListRowId: 'fqlr-001',
          sampleId: 'L2301368',
          libraryType: 'ctDNA',
          fastqUri: 'gds://production/primary_data/231116_A01052/L2301368/',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.tso_ctdna_tumor_only.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef02', // pragma: allowlist secret
          sampleId: 'L2301368',
          resultsUri: 'gds://production/analysis/ctdna/L2301368/',
          variantCalls:
            'gds://production/analysis/ctdna/L2301368/Results/L2301368_MergedSmallVariants.genome.vcf',
          copyNumberVariants:
            'gds://production/analysis/ctdna/L2301368/Results/L2301368_CopyNumberVariants.vcf',
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '12h', computeQueue: 'ica-prod-tso-ctdna' },
  },

  'wgs-alignment-qc': {
    label: 'WGS Alignment QC',
    version: 'v4.2.4',
    engine: 'ICA',
    description:
      'Whole-genome sequencing alignment and quality control on DRAGEN. Aligns FASTQ reads to hg38 reference, produces BAM/CRAM files, and generates QC metrics including coverage, insert size, and contamination estimates.',
    groupIds: ['WGS', 'QC'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.bclconvert.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: "$.libraryType == 'WGS'",
        payload: {
          portalRunId: '20231116abcdef01', // pragma: allowlist secret
          fastqListRowId: 'fqlr-002',
          sampleId: 'L2301369',
          libraryType: 'WGS',
          fastqUri: 'gds://production/primary_data/231116_A01052/L2301369/',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.wgs_alignment_qc.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef03', // pragma: allowlist secret
          sampleId: 'L2301369',
          bamUri: 'gds://production/analysis/wgs_alignment_qc/L2301369/L2301369.bam',
          coverageMetrics: { meanCoverage: 38.2, pctTargetBases20x: 95.1, contamination: 0.001 },
          qcStatus: 'PASS',
        },
      },
    ],
    tags: { maxRetries: '3', timeout: '24h', computeQueue: 'ica-prod-wgs-qc' },
  },

  'wts-alignment-qc': {
    label: 'WTS Alignment QC',
    version: 'v4.2.4',
    engine: 'ICA',
    description:
      'Whole-transcriptome sequencing alignment and QC on DRAGEN. Aligns RNA-seq FASTQ reads using splice-aware alignment, quantifies gene expression, and generates QC metrics.',
    groupIds: ['WTS', 'QC'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.bclconvert.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: "$.libraryType == 'WTS'",
        payload: {
          portalRunId: '20231116abcdef01', // pragma: allowlist secret
          fastqListRowId: 'fqlr-003',
          sampleId: 'L2301370',
          libraryType: 'WTS',
          fastqUri: 'gds://production/primary_data/231116_A01052/L2301370/',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.wts_alignment_qc.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef04', // pragma: allowlist secret
          sampleId: 'L2301370',
          bamUri: 'gds://production/analysis/wts_alignment_qc/L2301370/L2301370.bam',
          expressionMetrics: {
            totalReads: 85_000_000,
            uniquelyMapped: 72_000_000,
            exonicRate: 0.68,
          },
          qcStatus: 'PASS',
        },
      },
    ],
    tags: { maxRetries: '3', timeout: '18h', computeQueue: 'ica-prod-wts-qc' },
  },

  // ── Layer 3: Secondary Analysis ────────────────────────────────────────────
  'pierian-dx': {
    label: 'Pierian DX',
    version: 'v5.4.0',
    engine: 'PIERIAN',
    description:
      'Clinical genomics interpretation platform for case accession automation. Ingests ctDNA variant calls and automatically creates clinical cases with annotated variants, therapy matches, and clinical trial recommendations.',
    groupIds: ['CTDNA'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.tso_ctdna_tumor_only.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef02', // pragma: allowlist secret
          sampleId: 'L2301368',
          resultsUri: 'gds://production/analysis/ctdna/L2301368/',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.pierian_dx.case_created',
        topic: 'orcabus.workflowmanager',
        payload: {
          caseId: 'CASE-2023-00456',
          sampleId: 'L2301368',
          caseAccessionNumber: 'CGW-231116-001',
          reportUri: 'https://app.pieriandx.com/case/CASE-2023-00456',
        },
      },
    ],
    tags: { maxRetries: '1', timeout: '4h', computeQueue: 'pierian-prod' },
  },

  holmes: {
    label: 'Holmes',
    version: 'v1.8.2',
    engine: 'AWS_BATCH',
    description:
      'BAM fingerprint extraction service. Extracts SNP fingerprints from aligned BAM files to enable sample identity verification, swap detection, and relatedness checks across the biobank.',
    groupIds: ['QC'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.wgs_alignment_qc.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef03', // pragma: allowlist secret
          sampleId: 'L2301369',
          bamUri: 'gds://production/analysis/wgs_alignment_qc/L2301369/L2301369.bam',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.holmes.fingerprint_extracted',
        topic: 'orcabus.workflowmanager',
        payload: {
          sampleId: 'L2301369',
          fingerprintUri: 's3://umccr-fingerprint-data/L2301369/L2301369.somalier',
          matchResults: { selfMatch: true, relatedSamples: [], swapDetected: false },
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '2h', computeQueue: 'aws-prod-fingerprint' },
  },

  'wgs-tumor-normal': {
    label: 'WGS Tumor Normal',
    version: 'v4.2.4',
    engine: 'ICA',
    description:
      'DRAGEN-based WGS tumor-normal somatic variant calling. Takes matched tumor-normal BAM pairs and FASTQ inputs to call SNVs, indels, SVs, and CNVs with high sensitivity.',
    groupIds: ['WGS'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.wgs_alignment_qc.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: "$.qcStatus == 'PASS'",
        payload: {
          portalRunId: '20231116abcdef03', // pragma: allowlist secret
          sampleId: 'L2301369',
          tumorSampleId: 'L2301369',
          normalSampleId: 'L2301360',
          bamUri: 'gds://production/analysis/wgs_alignment_qc/L2301369/L2301369.bam',
        },
      },
      {
        name: 'orcabus.workflowmanager.bclconvert.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: 'FASTQs as input',
        payload: {
          tumorFastqUri: 'gds://production/primary_data/231116_A01052/L2301369/',
          normalFastqUri: 'gds://production/primary_data/231116_A01052/L2301360/',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.wgs_tumor_normal.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef05', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          tumorSampleId: 'L2301369',
          normalSampleId: 'L2301360',
          somaticVcf: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_somatic.vcf.gz',
          svVcf: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_sv.vcf.gz',
          cnvVcf: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_cnv.vcf.gz',
          tumorBam: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_tumor.bam',
          normalBam: 'gds://production/analysis/tumor_normal/SBJ00910/L2301360_normal.bam',
        },
      },
    ],
    tags: { maxRetries: '3', timeout: '48h', computeQueue: 'ica-prod-tn' },
  },

  'wts-tumor-only': {
    label: 'WTS Tumor Only',
    version: 'v4.2.4',
    engine: 'ICA',
    description:
      'DRAGEN-based whole-transcriptome tumor-only analysis. Quantifies gene expression, detects gene fusions, and identifies RNA-level variants from tumor RNA-seq data without matched normal.',
    groupIds: ['WTS'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.wts_alignment_qc.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: "$.qcStatus == 'PASS'",
        payload: {
          portalRunId: '20231116abcdef04', // pragma: allowlist secret
          sampleId: 'L2301370',
          bamUri: 'gds://production/analysis/wts_alignment_qc/L2301370/L2301370.bam',
        },
      },
      {
        name: 'orcabus.workflowmanager.bclconvert.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: 'FASTQs as input',
        payload: {
          fastqUri: 'gds://production/primary_data/231116_A01052/L2301370/',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.wts_tumor_only.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef06', // pragma: allowlist secret
          sampleId: 'L2301370',
          subjectId: 'SBJ00910',
          fusionCandidates: 'gds://production/analysis/wts_tumor_only/L2301370/fusions.tsv',
          expressionCounts: 'gds://production/analysis/wts_tumor_only/L2301370/gene_counts.tsv',
          transcriptomeBam: 'gds://production/analysis/wts_tumor_only/L2301370/L2301370_RNA.bam',
        },
      },
    ],
    tags: { maxRetries: '3', timeout: '24h', computeQueue: 'ica-prod-wts' },
  },

  gpl: {
    label: 'GPL',
    version: 'v0.4.1',
    engine: 'AWS_BATCH',
    description:
      'Genome-Phenome Lookup service. Matches WGS tumor-normal variant data against known phenotype associations, pharmacogenomics panels, and clinical annotations for comprehensive genomic profiling.',
    groupIds: ['QC', 'WGS'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.wgs_tumor_normal.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: 'T/N as input',
        payload: {
          portalRunId: '20231116abcdef05', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          somaticVcf: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_somatic.vcf.gz',
          normalBam: 'gds://production/analysis/tumor_normal/SBJ00910/L2301360_normal.bam',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.gpl.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          subjectId: 'SBJ00910',
          pharmacogenomicsReport: 's3://umccr-analysis/gpl/SBJ00910/pgx_report.html',
          phenotypeMatches: 's3://umccr-analysis/gpl/SBJ00910/phenotype_matches.json',
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '4h', computeQueue: 'aws-prod-gpl' },
  },

  'star-alignment': {
    label: 'STAR Alignment',
    version: 'v2.7.10b',
    engine: 'SEQERA',
    description:
      'STAR splice-aware RNA-seq aligner for producing transcriptome BAM files. Performs two-pass alignment of WTS FASTQ reads to the reference genome for fusion detection and expression quantification.',
    groupIds: ['WTS'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.bclconvert.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: "$.libraryType == 'WTS' && FASTQs as input",
        payload: {
          sampleId: 'L2301370',
          fastqUri: 'gds://production/primary_data/231116_A01052/L2301370/',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.star_alignment.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef07', // pragma: allowlist secret
          sampleId: 'L2301370',
          transcriptomeBam: 's3://umccr-analysis/star/L2301370/L2301370_Aligned.sortedByCoord.bam',
          chimericJunctions: 's3://umccr-analysis/star/L2301370/L2301370_Chimeric.out.junction',
          alignmentStats: {
            uniquelyMapped: 72_000_000,
            multiMapped: 8_000_000,
            unmapped: 5_000_000,
          },
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '12h', computeQueue: 'seqera-prod-star' },
  },

  // ── Layer 4: Tertiary Analysis ─────────────────────────────────────────────
  umccrise: {
    label: 'UMCCRISE',
    version: 'v2.3.1',
    engine: 'AWS_BATCH',
    description:
      'UMCCR cancer report generation pipeline. Takes WGS tumor-normal results and produces a comprehensive cancer report including mutational signatures, driver mutations, HRD score, and TMB.',
    groupIds: ['WGS'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.wgs_tumor_normal.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef05', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          somaticVcf: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_somatic.vcf.gz',
          svVcf: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_sv.vcf.gz',
          tumorBam: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_tumor.bam',
          normalBam: 'gds://production/analysis/tumor_normal/SBJ00910/L2301360_normal.bam',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.umccrise.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef08', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          cancerReport: 's3://umccr-analysis/umccrise/SBJ00910/cancer_report.html',
          purplePurity: 0.68,
          tmb: 8.4,
          hrdScore: 42,
          signaturesUri: 's3://umccr-analysis/umccrise/SBJ00910/sigs/',
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '36h', computeQueue: 'aws-prod-umccrise' },
  },

  'oncoanalyser-wgs': {
    label: 'OncoAnalyser WGS',
    version: 'v0.5.2',
    engine: 'SEQERA',
    description:
      'Hartwig Medical Foundation OncoAnalyser for WGS data. Runs PURPLE (purity/ploidy), LINX (structural variant interpretation), SAGE (somatic calling), and GRIPSS (SV filtering) on WGS tumor-normal pairs.',
    groupIds: ['WGS', 'INTEGRATED'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.wts_tumor_only.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef06', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          tumorSampleId: 'L2301369',
          normalSampleId: 'L2301360',
          tumorBam: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_tumor.bam',
          normalBam: 'gds://production/analysis/tumor_normal/SBJ00910/L2301360_normal.bam',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.oncoanalyser_wgs.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef09', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          purpleUri: 's3://umccr-analysis/oncoanalyser_wgs/SBJ00910/purple/',
          linxUri: 's3://umccr-analysis/oncoanalyser_wgs/SBJ00910/linx/',
          sageVcf:
            's3://umccr-analysis/oncoanalyser_wgs/SBJ00910/sage/SBJ00910.sage.somatic.vcf.gz',
          gripssVcf:
            's3://umccr-analysis/oncoanalyser_wgs/SBJ00910/gripss/SBJ00910.gripss.filtered.vcf.gz',
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '48h', computeQueue: 'seqera-prod-oncoanalyser' },
  },

  'oncoanalyser-wts': {
    label: 'OncoAnalyser WTS',
    version: 'v0.5.2',
    engine: 'SEQERA',
    description:
      'OncoAnalyser for WTS data. Runs Isofox for gene expression analysis, fusion detection, and novel splice junction identification from RNA-seq BAM files.',
    groupIds: ['WTS', 'INTEGRATED'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.star_alignment.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef07', // pragma: allowlist secret
          sampleId: 'L2301370',
          transcriptomeBam: 's3://umccr-analysis/star/L2301370/L2301370_Aligned.sortedByCoord.bam',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.oncoanalyser_wts.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef10', // pragma: allowlist secret
          sampleId: 'L2301370',
          subjectId: 'SBJ00910',
          isofoxGeneData:
            's3://umccr-analysis/oncoanalyser_wts/L2301370/isofox/L2301370.isf.gene_data.csv',
          isofoxFusions:
            's3://umccr-analysis/oncoanalyser_wts/L2301370/isofox/L2301370.isf.fusions.csv',
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '24h', computeQueue: 'seqera-prod-oncoanalyser' },
  },

  // ── Layer 5: Reporting & Integration ───────────────────────────────────────
  pancan: {
    label: 'PANCAN',
    version: 'v1.2.0',
    engine: 'AWS_BATCH',
    description:
      'Pan-cancer cohort analysis. Compares individual tumor profiles against the UMCCR pan-cancer cohort to identify relative ranking of mutational burden, signatures, and driver gene alterations.',
    groupIds: ['WGS'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.umccrise.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef08', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          cancerReport: 's3://umccr-analysis/umccrise/SBJ00910/cancer_report.html',
          signaturesUri: 's3://umccr-analysis/umccrise/SBJ00910/sigs/',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.pancan.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef11', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          cohortRanking: 's3://umccr-analysis/pancan/SBJ00910/cohort_ranking.json',
          tmbPercentile: 72,
          signatureComparison: 's3://umccr-analysis/pancan/SBJ00910/sig_comparison.html',
        },
      },
    ],
    tags: { maxRetries: '1', timeout: '6h', computeQueue: 'aws-prod-pancan' },
  },

  sash: {
    label: 'SASH',
    version: 'v1.1.0',
    engine: 'AWS_BATCH',
    description:
      'Somatic Annotation and Summary of HMF pipeline results. Combines OncoAnalyser WGS output with WGS tumor-normal data to generate an integrated somatic variant report with clinical annotations.',
    groupIds: ['WGS', 'INTEGRATED'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.oncoanalyser_wgs.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef09', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          purpleUri: 's3://umccr-analysis/oncoanalyser_wgs/SBJ00910/purple/',
          linxUri: 's3://umccr-analysis/oncoanalyser_wgs/SBJ00910/linx/',
        },
      },
      {
        name: 'orcabus.workflowmanager.wgs_tumor_normal.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: 'T/N as input',
        payload: {
          subjectId: 'SBJ00910',
          somaticVcf: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_somatic.vcf.gz',
          tumorBam: 'gds://production/analysis/tumor_normal/SBJ00910/L2301369_tumor.bam',
          normalBam: 'gds://production/analysis/tumor_normal/SBJ00910/L2301360_normal.bam',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.sash.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef12', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          sashReport: 's3://umccr-analysis/sash/SBJ00910/sash_report.html',
          annotatedVcf: 's3://umccr-analysis/sash/SBJ00910/SBJ00910.sash.vcf.gz',
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '12h', computeQueue: 'aws-prod-sash' },
  },

  'oncoanalyser-wgts-existing-both': {
    label: 'OncoAnalyser WGTS',
    version: 'v0.5.2',
    engine: 'SEQERA',
    description:
      'Integrated WGS + WTS OncoAnalyser pipeline. Runs when both WGS and WTS data exist for a subject, combining genomic and transcriptomic evidence for comprehensive tumor characterization.',
    groupIds: ['INTEGRATED'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.oncoanalyser_wts.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef10', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          isofoxGeneData:
            's3://umccr-analysis/oncoanalyser_wts/L2301370/isofox/L2301370.isf.gene_data.csv',
        },
      },
      {
        name: 'orcabus.workflowmanager.sash.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef12', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          sashReport: 's3://umccr-analysis/sash/SBJ00910/sash_report.html',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.oncoanalyser_wgts.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef13', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          combinedReport: 's3://umccr-analysis/oncoanalyser_wgts/SBJ00910/combined_report.html',
          cuppaResult: 's3://umccr-analysis/oncoanalyser_wgts/SBJ00910/cuppa/SBJ00910.cup.data.csv',
          integratedLinx:
            's3://umccr-analysis/oncoanalyser_wgts/SBJ00910/linx/SBJ00910.linx.vis_data.tsv',
        },
      },
    ],
    tags: { maxRetries: '2', timeout: '48h', computeQueue: 'seqera-prod-oncoanalyser' },
  },

  // ── Layer 6: Final Reporting ───────────────────────────────────────────────
  rnasum: {
    label: 'RNAsum',
    version: 'v1.0.0',
    engine: 'AWS_BATCH',
    description:
      'RNA expression summary and reporting. Integrates WGS cancer report from PANCAN with transcriptome BAM data to generate a combined DNA + RNA clinical report with expression outlier analysis.',
    groupIds: ['WTS', 'WGS'],
    inputEvents: [
      {
        name: 'orcabus.workflowmanager.pancan.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef11', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          cohortRanking: 's3://umccr-analysis/pancan/SBJ00910/cohort_ranking.json',
        },
      },
      {
        name: 'orcabus.workflowmanager.star_alignment.succeeded',
        topic: 'orcabus.workflowmanager',
        condition: 'transcriptome BAM as input',
        payload: {
          sampleId: 'L2301370',
          transcriptomeBam: 's3://umccr-analysis/star/L2301370/L2301370_Aligned.sortedByCoord.bam',
        },
      },
    ],
    outputEvents: [
      {
        name: 'orcabus.workflowmanager.rnasum.succeeded',
        topic: 'orcabus.workflowmanager',
        payload: {
          portalRunId: '20231116abcdef14', // pragma: allowlist secret
          subjectId: 'SBJ00910',
          rnasumReport: 's3://umccr-analysis/rnasum/SBJ00910/RNAsum_report.html',
          expressionOutliers: 's3://umccr-analysis/rnasum/SBJ00910/expression_outliers.tsv',
          fusionSummary: 's3://umccr-analysis/rnasum/SBJ00910/fusion_summary.tsv',
        },
      },
    ],
    tags: { maxRetries: '1', timeout: '8h', computeQueue: 'aws-prod-rnasum' },
  },
};
