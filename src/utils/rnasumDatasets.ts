/**
 * TCGA dataset options available for RNAsum
 * Ref: https://github.com/umccr/RNAsum/blob/master/TCGA_projects_summary.md
 */
export interface RNASUMDataset {
  project: string;
  name: string;
  tissueCode: string;
  samplesNo: string;
}

export const PRIMARY_DATASETS: RNASUMDataset[] = [
  { project: 'BRCA', name: 'Breast Invasive Carcinoma', tissueCode: '1', samplesNo: '300' },
  { project: 'THCA', name: 'Thyroid Carcinoma', tissueCode: '1', samplesNo: '300' },
  {
    project: 'HNSC',
    name: 'Head and Neck Squamous Cell Carcinoma',
    tissueCode: '1',
    samplesNo: '300',
  },
  { project: 'LGG', name: 'Brain Lower Grade Glioma', tissueCode: '1', samplesNo: '300' },
  {
    project: 'KIRC',
    name: 'Kidney Renal Clear Cell Carcinoma',
    tissueCode: '1',
    samplesNo: '300',
  },
  { project: 'LUSC', name: 'Lung Squamous Cell Carcinoma', tissueCode: '1', samplesNo: '300' },
  { project: 'LUAD', name: 'Lung Adenocarcinoma', tissueCode: '1', samplesNo: '300' },
  { project: 'PRAD', name: 'Prostate Adenocarcinoma', tissueCode: '1', samplesNo: '300' },
  { project: 'STAD', name: 'Stomach Adenocarcinoma', tissueCode: '1', samplesNo: '300' },
  {
    project: 'LIHC',
    name: 'Liver Hepatocellular Carcinoma',
    tissueCode: '1',
    samplesNo: '300',
  },
  { project: 'COAD', name: 'Colon Adenocarcinoma', tissueCode: '1', samplesNo: '257' },
  {
    project: 'KIRP',
    name: 'Kidney Renal Papillary Cell Carcinoma',
    tissueCode: '1',
    samplesNo: '252',
  },
  {
    project: 'BLCA',
    name: 'Bladder Urothelial Carcinoma',
    tissueCode: '1',
    samplesNo: '246',
  },
  {
    project: 'OV',
    name: 'Ovarian Serous Cystadenocarcinoma',
    tissueCode: '1',
    samplesNo: '220',
  },
  { project: 'SARC', name: 'Sarcoma', tissueCode: '1', samplesNo: '214' },
  {
    project: 'PCPG',
    name: 'Pheochromocytoma and Paraganglioma',
    tissueCode: '1',
    samplesNo: '177',
  },
  {
    project: 'CESC',
    name: 'Cervical Squamous Cell Carcinoma and Endocervical Adenocarcinoma',
    tissueCode: '1',
    samplesNo: '171',
  },
  {
    project: 'UCEC',
    name: 'Uterine Corpus Endometrial Carcinoma',
    tissueCode: '1',
    samplesNo: '168',
  },
  { project: 'PAAD', name: 'Pancreatic Adenocarcinoma', tissueCode: '1', samplesNo: '150' },
  {
    project: 'TGCT',
    name: 'Testicular Germ Cell Tumours',
    tissueCode: '1',
    samplesNo: '149',
  },
  {
    project: 'LAML',
    name: 'Acute Myeloid Leukaemia',
    tissueCode: '3',
    samplesNo: '145',
  },
  { project: 'ESCA', name: 'Esophageal Carcinoma', tissueCode: '1', samplesNo: '142' },
  { project: 'GBM', name: 'Glioblastoma Multiforme', tissueCode: '1', samplesNo: '141' },
  { project: 'THYM', name: 'Thymoma', tissueCode: '1', samplesNo: '118' },
  { project: 'SKCM', name: 'Skin Cutaneous Melanoma', tissueCode: '1', samplesNo: '100' },
  { project: 'READ', name: 'Rectum Adenocarcinoma', tissueCode: '1', samplesNo: '87' },
  { project: 'UVM', name: 'Uveal Melanoma', tissueCode: '1', samplesNo: '80' },
  { project: 'ACC', name: 'Adrenocortical Carcinoma', tissueCode: '1', samplesNo: '78' },
  { project: 'MESO', name: 'Mesothelioma', tissueCode: '1', samplesNo: '77' },
  { project: 'KICH', name: 'Kidney Chromophobe', tissueCode: '1', samplesNo: '59' },
  { project: 'UCS', name: 'Uterine Carcinosarcoma', tissueCode: '1', samplesNo: '56' },
  {
    project: 'DLBC',
    name: 'Lymphoid Neoplasm Diffuse Large B-cell Lymphoma',
    tissueCode: '1',
    samplesNo: '47',
  },
  { project: 'CHOL', name: 'Cholangiocarcinoma', tissueCode: '1', samplesNo: '34' },
];

export const EXTENDED_DATASETS: RNASUMDataset[] = [
  {
    project: 'LUAD-LCNEC',
    name: 'Lung Adenocarcinoma dataset including large-cell neuroendocrine carcinoma (LCNEC, n=14)',
    tissueCode: '1',
    samplesNo: '314',
  },
  {
    project: 'BLCA-NET',
    name: 'Bladder Urothelial Carcinoma dataset including neuroendocrine tumours (NETs, n=2)',
    tissueCode: '1',
    samplesNo: '248',
  },
  {
    project: 'PAAD-IPMN',
    name: 'Pancreatic Adenocarcinoma dataset including intraductal papillary mucinous neoplasm (IPMNs, n=2)',
    tissueCode: '1',
    samplesNo: '152',
  },
  {
    project: 'PAAD-NET',
    name: 'Pancreatic Adenocarcinoma dataset including neuroendocrine tumours (NETs, n=8)',
    tissueCode: '1',
    samplesNo: '158',
  },
  {
    project: 'PAAD-ACC',
    name: 'Pancreatic Adenocarcinoma dataset including acinar cell carcinoma (ACCs, n=1)',
    tissueCode: '1',
    samplesNo: '151',
  },
];

export const PAN_CANCER_DATASETS: RNASUMDataset[] = [
  {
    project: 'PANCAN',
    name: 'Samples from all 33 cancer types, 10 samples from each',
    tissueCode: '1 and 3 (LAML samples only)',
    samplesNo: '330',
  },
];

export const ALL_RNASUM_DATASETS: RNASUMDataset[] = [
  ...PRIMARY_DATASETS,
  ...EXTENDED_DATASETS,
  ...PAN_CANCER_DATASETS,
];
