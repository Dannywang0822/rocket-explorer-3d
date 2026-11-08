export type Part = [number, number, string, string];

export type Photo = {
  id: string;
  n: string;
  title: string;
  c: string;
  img: string;
  file: string;
  credit: string;
  license: string;
  cap: string;
  parts: Part[];
  filePage: string;
  originalImage: string;
};

export type ModelLink = { title: string; href: string; site: string };

export type Model3 = {
  id: string;
  title: string;
  c: string;
  height: number;
  photo: string;
  anchor: string;
  note: string;
  learn: string;
  links: ModelLink[];
  profile: [number, number, number][];
  engines: number;
  boost?: {
    n: number;
    offset: number;
    height: number;
    r: number;
    lean?: number;
    engines: number;
    style: string;
  };
  fins?: { base: number; outer: number; y0: number; y1: number; y2: number };
  photoDetails?: Photo;
};

export type CatalogRecord = {
  id: string;
  n: string;
  f: string;
  c: string;
  d: string;
  code: string;
  orb: boolean;
  kind: string;
  note: string;
  chineseName: string;
  catalogFamily: string;
  historicalAttribution: string;
  firstResultText: string;
  orbitStatusText: string;
  sourceURL: string;
};

export type Supplement = { url: string; note: string; size?: string };

export type CatalogFile = {
  asOf: string;
  timezone: string;
  count: number;
  catalogGroupCount: number;
  mainCount: number;
  earlyCount: number;
  records: CatalogRecord[];
  groups: [string, string, string, string, string][];
  independentFullTextSupplements: Record<string, Supplement>;
};
