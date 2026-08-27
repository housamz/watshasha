import { describe, expect, it, vi } from 'vitest';
import { TmdbService } from '../src/services/tmdb.js';
import { arabicMovie } from './fixtures.js';

describe('TmdbService', () => {
  it('builds a constrained Arabic discover request', async () => {
    let requestedUrl = '';
    const fetchFn: typeof fetch = vi.fn(async (input) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({
      page: 2, results: [arabicMovie], total_pages: 2, total_results: 21,
      }), { status: 200 });
    });
    const service = new TmdbService({ apiKey: 'test-key', fetchFn });

    const response = await service.getArabicMovies(2);
    const url = new URL(requestedUrl);
    expect(url.pathname).toBe('/3/discover/movie');
    expect(url.searchParams.get('with_original_language')).toBe('ar');
    expect(url.searchParams.get('sort_by')).toBe('popularity.desc');
    expect(url.searchParams.get('page')).toBe('2');
    expect(response.results).toHaveLength(1);
  });

  it('uses bearer authentication without leaking it into the URL', async () => {
    let requestedUrl = '';
    let requestedHeaders: RequestInit['headers'];
    const fetchFn: typeof fetch = vi.fn(async (input, init) => {
      requestedUrl = String(input);
      requestedHeaders = init?.headers;
      return new Response(JSON.stringify({
        page: 1, results: [], total_pages: 0, total_results: 0,
      }), { status: 200 });
    });
    const service = new TmdbService({ accessToken: 'secret', fetchFn });
    await service.getArabicTvSeries();
    expect(requestedUrl).not.toContain('secret');
    expect((requestedHeaders as Record<string, string>).Authorization).toBe('Bearer secret');
  });

  it('returns empty results without credentials', async () => {
    const fetchFn: typeof fetch = vi.fn();
    const service = new TmdbService({ fetchFn });
    await expect(service.getArabicMovies()).resolves.toMatchObject({ results: [] });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('rejects malformed upstream responses', async () => {
    const fetchFn: typeof fetch = vi.fn(async () => new Response('{}', { status: 200 }));
    const service = new TmdbService({ apiKey: 'test-key', fetchFn });
    await expect(service.getArabicMovies()).rejects.toThrow('invalid discover response');
  });

  it('resolves IMDb IDs through TMDB external IDs', async () => {
    const fetchFn: typeof fetch = vi.fn(async () => new Response(
      JSON.stringify({ imdb_id: 'tt1234567' }),
      { status: 200 },
    ));
    const service = new TmdbService({ apiKey: 'test-key', fetchFn });
    await expect(service.getImdbId('movie', 123)).resolves.toBe('tt1234567');
    expect(String(vi.mocked(fetchFn).mock.calls[0][0])).toContain('/movie/123/external_ids');
  });

  it('finds a TMDB series from an IMDb ID', async () => {
    const fetchFn: typeof fetch = vi.fn(async () => new Response(JSON.stringify({
      movie_results: [],
      tv_results: [{ id: 456 }],
    }), { status: 200 }));
    const service = new TmdbService({ apiKey: 'test-key', fetchFn });
    await expect(service.findTmdbIdByImdbId('series', 'tt7654321')).resolves.toBe(456);
  });
});
