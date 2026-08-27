import { describe, expect, it } from "vitest";
import { isArabicContent } from "../src/filters/arabic.js";
import {
  getImageUrl,
  getPreferredTitle,
  mapMovieToCatalogItem,
  mapMovieDetailsToMeta,
  mapTvDetailsToMeta,
  mapTvEpisodesToVideos,
  mapTvToCatalogItem,
} from "../src/mappers/stremio.js";
import {
  createWatshashaId,
  isImdbId,
  parseWatshashaId,
} from "../src/utils/ids.js";
import {
  isValidCatalogType,
  isValidExtra,
  parseExtras,
  parseSkip,
  skipToTmdbPage,
} from "../src/utils/validation.js";
import { arabicMovie, arabicSeries } from "./fixtures.js";

describe("Arabic filtering", () => {
  it("accepts only Arabic original-language content", () => {
    expect(isArabicContent(arabicMovie)).toBe(true);
    expect(isArabicContent({ original_language: "AR" })).toBe(true);
    expect(isArabicContent({ original_language: "en" })).toBe(false);
    expect(isArabicContent({})).toBe(false);
  });
});

describe("Watshasha IDs", () => {
  it("creates and parses namespaced IDs", () => {
    const id = createWatshashaId("series", 456);
    expect(id).toBe("watshasha:series:tmdb:456");
    expect(parseWatshashaId(id)).toEqual({ type: "series", tmdbId: 456 });
  });

  it("rejects ambiguous and malformed IDs", () => {
    expect(parseWatshashaId("tmdb:456")).toBeNull();
    expect(parseWatshashaId("456")).toBeNull();
    expect(parseWatshashaId("watshasha:movie:tmdb:-1")).toBeNull();
    expect(() => createWatshashaId("movie", 0)).toThrow();
  });

  it("recognizes valid IMDb IDs", () => {
    expect(isImdbId("tt1234567")).toBe(true);
    expect(isImdbId("tt0123456")).toBe(true);
    expect(isImdbId("tt0000000")).toBe(false);
    expect(isImdbId("nm1234567")).toBe(false);
  });
});

describe("pagination and route validation", () => {
  it("maps skip values to TMDB pages and caps abusive values", () => {
    expect(parseExtras()).toEqual({ skip: 0, tmdbPage: 1 });
    expect(parseExtras("skip=20.json")).toEqual({ skip: 20, tmdbPage: 2 });
    expect(parseSkip("skip=99999")).toBe(1000);
    expect(skipToTmdbPage(1000)).toBe(51);
  });

  it("rejects unsupported route values", () => {
    expect(isValidCatalogType("movie")).toBe(true);
    expect(isValidCatalogType("book")).toBe(false);
    expect(isValidExtra("skip=40")).toBe(true);
    expect(isValidExtra("skip=-1")).toBe(false);
    expect(isValidExtra("skip=1001")).toBe(false);
    expect(isValidExtra("genre=horror")).toBe(false);
  });
});

describe("TMDB to Stremio mapping", () => {
  it("maps a movie with stable IDs, images and release information", () => {
    expect(mapMovieToCatalogItem(arabicMovie)).toEqual({
      id: "watshasha:movie:tmdb:123",
      type: "movie",
      name: "الفيل الأزرق",
      poster: "https://image.tmdb.org/t/p/w500/poster.jpg",
      background: "https://image.tmdb.org/t/p/w1280/backdrop.jpg",
      description: "طبيب نفسي يعود إلى العمل.",
      releaseInfo: "2014",
      imdbRating: "7.1",
    });
  });

  it("maps a series and safely omits unavailable images", () => {
    const result = mapTvToCatalogItem(arabicSeries);
    expect(result.id).toBe("watshasha:series:tmdb:456");
    expect(result.releaseInfo).toBe("2020");
    expect(result.poster).toBeUndefined();
  });

  it("uses IMDb IDs when available for cross-addon interoperability", () => {
    expect(mapMovieToCatalogItem(arabicMovie, "tt1234567").id).toBe(
      "tt1234567",
    );
    expect(mapTvToCatalogItem(arabicSeries, "tt7654321").id).toBe("tt7654321");
  });

  it("keeps the requested fallback ID stable in full metadata", () => {
    const movieMeta = mapMovieDetailsToMeta(
      { ...arabicMovie, imdb_id: "tt1234567" },
      "watshasha:movie:tmdb:123",
    );
    const seriesMeta = mapTvDetailsToMeta(
      { ...arabicSeries, external_ids: { imdb_id: "tt7654321" } },
      "watshasha:series:tmdb:456",
    );
    expect(movieMeta.id).toBe("watshasha:movie:tmdb:123");
    expect(seriesMeta.id).toBe("watshasha:series:tmdb:456");
  });

  it("maps TV episodes to standard Stremio video IDs", () => {
    const videos = mapTvEpisodesToVideos("tt7654321", [
      {
        id: 1,
        season_number: 1,
        episodes: [
          {
            id: 2,
            name: "الحلقة الأولى",
            air_date: "2020-04-24",
            episode_number: 1,
            season_number: 1,
            still_path: "/episode.jpg",
          },
        ],
      },
    ]);
    expect(videos[0]).toMatchObject({
      id: "tt7654321:1:1",
      season: 1,
      episode: 1,
      released: "2020-04-24T00:00:00.000Z",
    });
  });

  it("selects reliable titles and normalizes image paths", () => {
    expect(getPreferredTitle({ original_name: "Original" })).toBe("Original");
    expect(getPreferredTitle({})).toBe("Untitled");
    expect(getImageUrl("image.jpg", "poster")).toContain("/image.jpg");
  });
});
