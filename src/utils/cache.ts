import type { ServerResponse } from 'http';

export type CacheType = 'manifest' | 'catalog' | 'meta' | 'static';

const CACHE_CONTROL_POLICIES: Record<CacheType, string> = {
  manifest: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
  catalog: 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400',
  meta: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
  static: 'public, max-age=31536000, immutable',
};

export function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
}

export function setCacheHeaders(res: ServerResponse, type: CacheType): void {
  setCorsHeaders(res);
  res.setHeader('Cache-Control', CACHE_CONTROL_POLICIES[type]);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}
