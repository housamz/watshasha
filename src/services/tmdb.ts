import type {
  TmdbDiscoverResponse,
  TmdbMovieItem,
  TmdbTvItem,
  TmdbMovieDetails,
  TmdbTvDetails,
  TmdbExternalIds,
  TmdbFindResponse,
  TmdbSeasonDetails,
} from '../types/tmdb.js';
import { isImdbId, type MediaType } from '../utils/ids.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT_MS = 2_500;

export interface TmdbServiceConfig {
  apiKey?: string;
  accessToken?: string;
  fetchFn?: typeof fetch;
}

export class TmdbService {
  private apiKey?: string;
  private accessToken?: string;
  private fetchFn: typeof fetch;

  constructor(config: TmdbServiceConfig = {}) {
    this.apiKey = config.apiKey || process.env.TMDB_API_KEY;
    this.accessToken = config.accessToken || process.env.TMDB_ACCESS_TOKEN;
    this.fetchFn = config.fetchFn || globalThis.fetch;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json;charset=utf-8',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  private buildUrl(path: string, params: Record<string, string | number> = {}): string {
    const url = new URL(`${TMDB_BASE_URL}${path}`);
    if (this.apiKey && !this.accessToken) {
      url.searchParams.set('api_key', this.apiKey);
    }
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  private async request<T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> {
    const res = await this.fetchFn(this.buildUrl(path, params), {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`TMDB request failed with status ${res.status}`);
    const data: unknown = await res.json();
    if (!data || typeof data !== 'object') throw new Error('TMDB returned an invalid response');
    return data as T;
  }

  public async getArabicMovies(
    page: number = 1,
    language: string = 'ar',
    sort: string = 'popularity.desc',
  ): Promise<TmdbDiscoverResponse<TmdbMovieItem>> {
    if (!this.apiKey && !this.accessToken) {
      console.warn('TMDB API credentials missing. Returning empty catalog.');
      return { page, results: [], total_pages: 0, total_results: 0 };
    }

    const result = await this.request<TmdbDiscoverResponse<TmdbMovieItem>>('/discover/movie', {
      with_original_language: language,
      sort_by: sort,
      page,
    });

    if (!result || !Array.isArray(result.results)) throw new Error('TMDB returned an invalid discover response');
    return result;
  }

  public async getArabicTvSeries(
    page: number = 1,
    language: string = 'ar',
    sort: string = 'popularity.desc',
  ): Promise<TmdbDiscoverResponse<TmdbTvItem>> {
    if (!this.apiKey && !this.accessToken) {
      console.warn('TMDB API credentials missing. Returning empty catalog.');
      return { page, results: [], total_pages: 0, total_results: 0 };
    }

    const result = await this.request<TmdbDiscoverResponse<TmdbTvItem>>('/discover/tv', {
      with_original_language: language,
      sort_by: sort,
      page,
    });

    if (!result || !Array.isArray(result.results)) throw new Error('TMDB returned an invalid discover response');
    return result;
  }

  public async getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails | null> {
    if (!this.apiKey && !this.accessToken) {
      console.warn('TMDB API credentials missing.');
      return null;
    }

    return this.request<TmdbMovieDetails>(`/movie/${tmdbId}`, {
      append_to_response: 'credits,alternative_titles,external_ids',
    });

  }

  public async getTvDetails(tmdbId: number): Promise<TmdbTvDetails | null> {
    if (!this.apiKey && !this.accessToken) {
      console.warn('TMDB API credentials missing.');
      return null;
    }

    return this.request<TmdbTvDetails>(`/tv/${tmdbId}`, {
      append_to_response: 'credits,alternative_titles,external_ids',
    });

  }

  public async getImdbId(type: MediaType, tmdbId: number): Promise<string | null> {
    if (!this.apiKey && !this.accessToken) return null;
    const resource = type === 'movie' ? 'movie' : 'tv';
    const result = await this.request<TmdbExternalIds>(`/${resource}/${tmdbId}/external_ids`);
    const imdbId = result?.imdb_id;
    return imdbId && isImdbId(imdbId) ? imdbId : null;
  }

  public async findTmdbIdByImdbId(type: MediaType, imdbId: string): Promise<number | null> {
    if (!this.apiKey && !this.accessToken) return null;
    const result = await this.request<TmdbFindResponse>(`/find/${encodeURIComponent(imdbId)}`, {
      external_source: 'imdb_id',
    });
    const match = type === 'movie' ? result?.movie_results?.[0] : result?.tv_results?.[0];
    return match?.id && Number.isInteger(match.id) ? match.id : null;
  }

  public async getTvSeasonDetails(tmdbId: number, seasonNumber: number): Promise<TmdbSeasonDetails | null> {
    if (!this.apiKey && !this.accessToken) return null;
    return this.request<TmdbSeasonDetails>(`/tv/${tmdbId}/season/${seasonNumber}`);
  }
}
