export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  order?: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
}

export interface TmdbCredits {
  cast?: TmdbCastMember[];
  crew?: TmdbCrewMember[];
}

export interface TmdbProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbAlternativeTitle {
  iso_3166_1: string;
  title?: string;
  name?: string;
}

export interface TmdbAlternativeTitles {
  titles?: TmdbAlternativeTitle[];
  results?: TmdbAlternativeTitle[];
}

export interface TmdbMovieItem {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
}

export interface TmdbExternalIds {
  imdb_id?: string | null;
}

export interface TmdbTvItem {
  id: number;
  name: string;
  original_name: string;
  original_language: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
}

export interface TmdbDiscoverResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieDetails extends TmdbMovieItem {
  imdb_id?: string | null;
  genres?: TmdbGenre[];
  runtime?: number | null;
  production_countries?: TmdbProductionCountry[];
  credits?: TmdbCredits;
  alternative_titles?: TmdbAlternativeTitles;
}

export interface TmdbCreatedBy {
  id: number;
  name: string;
}

export interface TmdbTvDetails extends TmdbTvItem {
  genres?: TmdbGenre[];
  episode_run_time?: number[];
  production_countries?: TmdbProductionCountry[];
  created_by?: TmdbCreatedBy[];
  credits?: TmdbCredits;
  alternative_titles?: TmdbAlternativeTitles;
  external_ids?: TmdbExternalIds;
  seasons?: TmdbSeasonSummary[];
}

export interface TmdbSeasonSummary {
  id: number;
  season_number: number;
  episode_count: number;
  air_date?: string | null;
  name?: string;
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview?: string;
  air_date?: string | null;
  episode_number: number;
  season_number: number;
  still_path?: string | null;
}

export interface TmdbSeasonDetails {
  id: number;
  season_number: number;
  episodes: TmdbEpisode[];
}

export interface TmdbFindResponse {
  movie_results: TmdbMovieItem[];
  tv_results: TmdbTvItem[];
}
