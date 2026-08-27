export interface ParsedExtras {
  skip: number;
  tmdbPage: number;
}

export type CatalogType = 'movie' | 'series';

const ITEMS_PER_PAGE = 20;
const MAX_SKIP = 1000;

export function parseSkip(extraParam?: string): number {
  if (!extraParam) return 0;

  // Clean trailing .json if present from Vercel rewrite
  const cleanExtra = extraParam.replace(/\.json$/, '');

  // Look for skip=N in key-value string (e.g., skip=20 or skip=20&genre=Comedy)
  const match = /skip=(\d+)/.exec(cleanExtra);
  if (match) {
    const parsed = parseInt(match[1], 10);
    if (isNaN(parsed) || parsed < 0) return 0;
    return Math.min(parsed, MAX_SKIP);
  }

  return 0;
}

export function isValidCatalogType(value: unknown): value is CatalogType {
  return value === 'movie' || value === 'series';
}

export function isValidExtra(extraParam?: string): boolean {
  if (!extraParam) return true;
  const cleanExtra = extraParam.replace(/\.json$/, '');
  const match = /^skip=(\d+)$/.exec(cleanExtra);
  return Boolean(match && Number(match[1]) <= MAX_SKIP);
}

export function skipToTmdbPage(skip: number): number {
  const page = Math.floor(skip / ITEMS_PER_PAGE) + 1;
  return Math.max(1, page);
}

export function parseExtras(extraParam?: string): ParsedExtras {
  const skip = parseSkip(extraParam);
  const tmdbPage = skipToTmdbPage(skip);
  return { skip, tmdbPage };
}
