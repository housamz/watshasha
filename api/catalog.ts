import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCatalogConfig } from '../src/config/catalogues.js';
import { isArabicContent } from '../src/filters/arabic.js';
import { mapMovieToCatalogItem, mapTvToCatalogItem } from '../src/mappers/stremio.js';
import { TmdbService } from '../src/services/tmdb.js';
import type { StremioCatalogItem, StremioCatalogResponse } from '../src/types/stremio.js';
import { setCacheHeaders, setCorsHeaders } from '../src/utils/cache.js';
import { isValidCatalogType, isValidExtra, parseExtras } from '../src/utils/validation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    setCorsHeaders(res);
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ metas: [] });
  }

  setCacheHeaders(res, 'catalog');

  try {
    const rawId = (req.query.id as string) || '';
    const catalogId = rawId.replace(/\.json$/, '');
    const extra = req.query.extra as string | undefined;

    if (!isValidCatalogType(req.query.type) || !isValidExtra(extra)) {
      return res.status(400).json({ metas: [] });
    }

    const config = getCatalogConfig(catalogId);
    if (!config || config.type !== req.query.type) {
      const emptyResponse: StremioCatalogResponse = { metas: [] };
      return res.status(404).json(emptyResponse);
    }

    const { tmdbPage } = parseExtras(extra);
    const tmdb = new TmdbService();
    let metas: StremioCatalogItem[] = [];

    if (config.type === 'movie') {
      const response = await tmdb.getArabicMovies(tmdbPage, config.language, config.sort);
      const items = response.results.filter((item) => isArabicContent(item));
      const imdbIds = await Promise.allSettled(items.map((item) => tmdb.getImdbId('movie', item.id)));
      metas = items.map((item, index) => mapMovieToCatalogItem(
        item,
        imdbIds[index].status === 'fulfilled' ? imdbIds[index].value : null,
      ));
    } else if (config.type === 'series') {
      const response = await tmdb.getArabicTvSeries(tmdbPage, config.language, config.sort);
      const items = response.results.filter((item) => isArabicContent(item));
      const imdbIds = await Promise.allSettled(items.map((item) => tmdb.getImdbId('series', item.id)));
      metas = items.map((item, index) => mapTvToCatalogItem(
        item,
        imdbIds[index].status === 'fulfilled' ? imdbIds[index].value : null,
      ));
    }

    const catalogResponse: StremioCatalogResponse = { metas };
    return res.status(200).json(catalogResponse);
  } catch (error) {
    console.error('Error handling catalog request:', error);
    const fallbackResponse: StremioCatalogResponse = { metas: [] };
    return res.status(200).json(fallbackResponse);
  }
}
