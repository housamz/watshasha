# Watshasha

Watshasha is a lightweight Stremio addon for discovering Arabic movies and television series. It reads catalogue and metadata from TMDB and converts it to the Stremio Addon Protocol. It is a stateless, serverless TypeScript project designed for Vercel's CDN and function platform.

> Watshasha provides catalogue and metadata information and does not host or provide copyrighted video content.

It does not provide, scrape, proxy, host, or resolve streams or subtitles.

When TMDB supplies an IMDb ID, Watshasha uses that universal ID for movies and series. Series episodes use Stremio's standard `tt…:season:episode` format. This lets Stremio request compatible stream addons that a user has installed and configured separately; Watshasha does not contact those addons, handle debrid credentials, or supply their links.

## Architecture

Stremio requests the static manifest, a catalogue, or an item's metadata. Vercel serves cached responses when possible; on a cache miss, a narrowly scoped serverless function requests TMDB, applies the Arabic-language filter, maps the result, and returns JSON. No database, Redis instance, persistent process, or generic proxy is used.

## Requirements and TMDB setup

- Node.js 20 or newer
- npm
- A [TMDB](https://www.themoviedb.org/) account and either a v3 API key or v4 read access token
- Vercel CLI for local route testing and deployment (`npm install --global vercel`), or use `npx vercel`

Copy `.env.example` to `.env.local` and set one credential. The bearer token takes precedence when both are present:

```env
TMDB_ACCESS_TOKEN=your_tmdb_bearer_access_token_here
# or
TMDB_API_KEY=your_tmdb_api_key_here
```

Never commit `.env` files or credentials.

## Local development and testing

```bash
npm install
npx vercel dev
npm run build
npm run lint
npm test
```

`npx vercel dev` starts Vercel's local environment. The unit tests use mocked TMDB responses and make no live API calls.

## API routes

- `GET /manifest.json`
- `GET /catalog/movie/arabic-movies.json`
- `GET /catalog/movie/arabic-movies/skip=20.json`
- `GET /catalog/series/arabic-series.json`
- `GET /catalog/series/arabic-series/skip=20.json`
- `GET /meta/movie/watshasha:movie:tmdb:123.json`
- `GET /meta/series/watshasha:series:tmdb:456.json`

The catalogues query TMDB Discover with `original_language=ar` and return up to 20 items per page. Inputs are allow-listed; callers cannot forward arbitrary TMDB queries.

## Caching

Responses use CDN-oriented `Cache-Control` headers: catalogues are cached for six hours, metadata for seven days, and the manifest for one day, with stale-while-revalidate windows. Caching does not depend on server memory.

## Deploying to Vercel

1. Import the repository into Vercel or run `vercel` from the project directory.
2. Add `TMDB_ACCESS_TOKEN` (preferred) or `TMDB_API_KEY` under Project Settings → Environment Variables.
3. Deploy and confirm `https://watshasha.vercel.app/manifest.json` returns the manifest.
4. Test both catalogues and a metadata URL before sharing the addon.

## Installing in Stremio

Open Stremio's addon installation flow and enter the production manifest URL:

```text
https://watshasha.vercel.app/manifest.json
```

Watshasha will appear with “Watshasha - Movie” and “Watshasha - Series”.

## Project structure

```text
api/          Vercel request handlers
src/config/   configuration-driven catalogue definitions
src/filters/  Arabic-content rules
src/mappers/  TMDB-to-Stremio mapping
src/services/ constrained TMDB client
src/types/    API and protocol types
src/utils/    IDs, validation, CORS, and cache headers
tests/        unit tests and regression fixtures
```

## Finished steps

- Created a typed Node.js and TypeScript project for native Vercel Functions.
- Added a valid Stremio manifest for movie and series catalogues without advertising streams or subtitles.
- Added dynamically populated Arabic movie and series catalogues using TMDB Discover and the MVP rule `original_language=ar`.
- Added Arabic-first title selection, posters, backdrops, descriptions, ratings, release information, genres, cast, directors or creators, runtime, country, and release dates.
- Added full movie and series metadata routes.
- Added namespaced Watshasha fallback IDs with centralized generation and parsing.
- Added IMDb ID resolution and standard `tt…:season:episode` series video IDs, allowing Stremio to query compatible addons installed separately by the user.
- Added configuration-driven catalogue definitions so future catalogues do not need separate handlers.
- Added Stremio `skip` pagination with strict bounds and TMDB page conversion.
- Added CDN-focused cache policies for the manifest, catalogues, and metadata.
- Added CORS, HTTP method checks, route validation, request timeouts, safe error responses, and constrained TMDB requests.
- Added mocked TMDB tests and regression coverage for filtering, mapping, titles, IDs, pagination, validation, IMDb interoperability, and episodes.
- Added local development, Vercel deployment, environment-variable, installation, and contribution documentation.
- Documented and prepared the production addon for `https://watshasha.vercel.app`.

## Future work

- Add Arabic and English/transliterated search using TMDB Search.
- Add country and genre catalogues, including Egyptian, Syrian, Lebanese, Gulf, and Palestinian collections.
- Add classics, decade-based, Ramadan, comedy, drama, new-release, and award-winning collections.
- Add manually curated collections and metadata corrections only when there is a demonstrated need for persistent storage.
- Add a configuration page for preferred catalogues, title language, metadata language, countries, and genres.
- Add country-aware official watch-provider availability and external service links with the required attribution.
- Improve series episode metadata, artwork, and handling of specials and unusually large season lists.
- Add production smoke tests, monitoring, branding assets, accessibility checks, and broader Stremio client testing.
- Continue performance and cache tuning based on real Vercel usage.
- Prepare public catalogue publication and a stable `1.0.0` release.

Watshasha should remain simple, stateless, cacheable, typed, modular, and serverless. A database, Redis, background workers, and generic proxy endpoints should only be introduced if a future feature clearly requires them. Watshasha must not scrape, proxy, host, or resolve unauthorized video streams, and it must never handle credentials for independently installed stream or debrid addons.

## Contributing

Create a focused branch, add tests for behavioral changes, and run `npm run build`, `npm run lint`, and `npm test` before opening a pull request. Keep the addon stateless, narrowly scoped, and free of stream-provider functionality. Do not commit credentials.

TMDB data and images are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
