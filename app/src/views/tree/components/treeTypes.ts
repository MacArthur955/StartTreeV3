export type BookmarkConfig = { n: string; u: string };
export type CategoryConfig = { cn: string; b: BookmarkConfig[] };
export type TreeConfig = {
  v?: string;
  bmc: CategoryConfig[][];
  s: { n?: string; u?: string };
  t: { nr?: number };
};
