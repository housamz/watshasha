import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mapMovieDetailsToMeta, mapTvDetailsToMeta } from '../src/mappers/stremio.js';
import { TmdbService } from '../src/services/tmdb.js';
import type { StremioMetaResponse } from '../src/types/stremio.js';
import { setCacheHeaders, setCorsHeaders } from '../src/utils/cache.js';
import { isImdbId, parseWatshashaId } from '../src/utils/ids.js';
import { isValidCatalogType } from '../src/utils/validation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    setCorsHeaders(res);
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ meta: null });
  }

  setCacheHeaders(res, 'meta');

  try {
    const rawId = (req.query.id as string) || '';
    const cleanId = rawId.replace(/\.json$/, '');
    if (!isValidCatalogType(req.query.type)) {
      return res.status(400).json({ meta: null });
    }

    const tmdb = new TmdbService();
    const requestedType = req.query.type;
    const parsedId = parseWatshashaId(cleanId);
    let tmdbId: number | null = null;

    if (isImdbId(cleanId)) {
      tmdbId = await tmdb.findTmdbIdByImdbId(requestedType, cleanId);
    } else if (parsedId && parsedId.type === requestedType) {
      tmdbId = parsedId.tmdbId;
    } else {
      return res.status(400).json({ meta: null });
    }

    if (!tmdbId) return res.status(404).json({ meta: null });

    if (requestedType === 'movie') {
      const details = await tmdb.getMovieDetails(tmdbId);
      if (!details) {
        return res.status(404).json({ meta: null });
      }
      const meta = mapMovieDetailsToMeta(details, cleanId);
      const response: StremioMetaResponse = { meta };
      return res.status(200).json(response);
    } else if (requestedType === 'series') {
      const details = await tmdb.getTvDetails(tmdbId);
      if (!details) {
        return res.status(404).json({ meta: null });
      }
      const imdbId = isImdbId(cleanId) ? cleanId : details.external_ids?.imdb_id || undefined;
      const seasonNumbers = (details.seasons || [])
        .map((season) => season.season_number)
        .filter((seasonNumber) => seasonNumber > 0)
        .slice(0, 30);
      const seasonResults = imdbId
        ? await Promise.allSettled(seasonNumbers.map((season) => tmdb.getTvSeasonDetails(tmdbId!, season)))
        : [];
      const seasons = seasonResults.flatMap((result) =>
        result.status === 'fulfilled' && result.value ? [result.value] : []
      );
      const meta = mapTvDetailsToMeta(details, cleanId, seasons);
      const response: StremioMetaResponse = { meta };
      return res.status(200).json(response);
    }

    return res.status(404).json({ meta: null });
  } catch (error) {
    console.error('Error handling meta request:', error);
    return res.status(200).json({ meta: null });
  }
}
