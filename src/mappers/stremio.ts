import type { StremioCatalogItem, StremioMetaDetail, StremioVideo } from '../types/stremio.js';
import type { TmdbMovieItem, TmdbTvItem, TmdbMovieDetails, TmdbTvDetails, TmdbSeasonDetails } from '../types/tmdb.js';
import { createWatshashaId, isImdbId } from '../utils/ids.js';

const TMDB_IMAGE_BASE_POSTER = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_BACKDROP = 'https://image.tmdb.org/t/p/w1280';
const TMDB_IMAGE_BASE_STILL = 'https://image.tmdb.org/t/p/w500';

export function getImageUrl(path: string | null | undefined, size: 'poster' | 'backdrop'): string | undefined {
  if (!path) return undefined;
  const base = size === 'poster' ? TMDB_IMAGE_BASE_POSTER : TMDB_IMAGE_BASE_BACKDROP;
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

export function getPreferredTitle(
  item: {
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    original_language?: string;
  }
): string {
  if (item.original_language?.toLowerCase() === 'ar') {
    return item.original_title || item.original_name || item.title || item.name || 'Untitled';
  }
  return item.title || item.name || item.original_title || item.original_name || 'Untitled';
}

export function mapMovieToCatalogItem(movie: TmdbMovieItem, imdbId?: string | null): StremioCatalogItem {
  const year = movie.release_date ? movie.release_date.split('-')[0] : undefined;
  return {
    id: imdbId || createWatshashaId('movie', movie.id),
    type: 'movie',
    name: getPreferredTitle(movie),
    poster: getImageUrl(movie.poster_path, 'poster'),
    background: getImageUrl(movie.backdrop_path, 'backdrop'),
    description: movie.overview || undefined,
    releaseInfo: year,
    imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : undefined,
  };
}

export function mapTvToCatalogItem(tv: TmdbTvItem, imdbId?: string | null): StremioCatalogItem {
  const year = tv.first_air_date ? tv.first_air_date.split('-')[0] : undefined;
  return {
    id: imdbId || createWatshashaId('series', tv.id),
    type: 'series',
    name: getPreferredTitle(tv),
    poster: getImageUrl(tv.poster_path, 'poster'),
    background: getImageUrl(tv.backdrop_path, 'backdrop'),
    description: tv.overview || undefined,
    releaseInfo: year,
    imdbRating: tv.vote_average ? tv.vote_average.toFixed(1) : undefined,
  };
}

export function mapMovieDetailsToMeta(movie: TmdbMovieDetails, preferredId?: string): StremioMetaDetail {
  const catalogItem = mapMovieToCatalogItem(movie, preferredId || movie.imdb_id);
  const year = movie.release_date ? movie.release_date.split('-')[0] : undefined;

  const genres = movie.genres ? movie.genres.map((g) => g.name) : undefined;
  const cast = movie.credits?.cast
    ? movie.credits.cast.slice(0, 10).map((c) => c.name)
    : undefined;
  const directors = movie.credits?.crew
    ? movie.credits.crew.filter((c) => c.job === 'Director').map((c) => c.name)
    : undefined;
  const country = movie.production_countries && movie.production_countries.length > 0
    ? movie.production_countries.map((c) => c.name).join(', ')
    : undefined;
  const runtime = movie.runtime ? `${movie.runtime} min` : undefined;

  return {
    ...catalogItem,
    year,
    releaseDate: movie.release_date || undefined,
    runtime,
    director: directors && directors.length > 0 ? directors : undefined,
    cast: cast && cast.length > 0 ? cast : undefined,
    country,
    genres: genres && genres.length > 0 ? genres : undefined,
  };
}

export function mapTvEpisodesToVideos(imdbId: string, seasons: TmdbSeasonDetails[]): StremioVideo[] {
  return seasons.flatMap((season) => season.episodes || [])
    .filter((episode) => Boolean(episode.air_date))
    .map((episode) => ({
    id: `${imdbId}:${episode.season_number}:${episode.episode_number}`,
    title: episode.name || `Episode ${episode.episode_number}`,
    released: `${episode.air_date}T00:00:00.000Z`,
    season: episode.season_number,
    episode: episode.episode_number,
    overview: episode.overview || undefined,
    thumbnail: episode.still_path ? `${TMDB_IMAGE_BASE_STILL}${episode.still_path}` : undefined,
    }));
}

export function mapTvDetailsToMeta(
  tv: TmdbTvDetails,
  preferredId?: string,
  seasons: TmdbSeasonDetails[] = [],
): StremioMetaDetail {
  const episodeImdbId = tv.external_ids?.imdb_id || (preferredId && isImdbId(preferredId) ? preferredId : undefined);
  const catalogItem = mapTvToCatalogItem(tv, preferredId || episodeImdbId);
  const year = tv.first_air_date ? tv.first_air_date.split('-')[0] : undefined;

  const genres = tv.genres ? tv.genres.map((g) => g.name) : undefined;
  const cast = tv.credits?.cast
    ? tv.credits.cast.slice(0, 10).map((c) => c.name)
    : undefined;
  const creators = tv.created_by
    ? tv.created_by.map((c) => c.name)
    : undefined;
  const country = tv.production_countries && tv.production_countries.length > 0
    ? tv.production_countries.map((c) => c.name).join(', ')
    : undefined;
  const avgRuntime = tv.episode_run_time && tv.episode_run_time.length > 0
    ? `${tv.episode_run_time[0]} min`
    : undefined;

  return {
    ...catalogItem,
    year,
    releaseDate: tv.first_air_date || undefined,
    runtime: avgRuntime,
    director: creators && creators.length > 0 ? creators : undefined,
    cast: cast && cast.length > 0 ? cast : undefined,
    country,
    genres: genres && genres.length > 0 ? genres : undefined,
    videos: episodeImdbId && seasons.length > 0 ? mapTvEpisodesToVideos(episodeImdbId, seasons) : undefined,
  };
}
