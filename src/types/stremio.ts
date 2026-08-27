export interface CatalogExtra {
  name: string;
  isRequired?: boolean;
  options?: string[];
}

export interface ManifestCatalog {
  type: "movie" | "series";
  id: string;
  name: string;
  extra?: CatalogExtra[];
}

export interface StremioManifest {
  id: string;
  version: string;
  name: string;
  description: string;
  logo?: string;
  background?: string;
  resources: ("catalog" | "meta")[];
  types: ("movie" | "series")[];
  catalogs: ManifestCatalog[];
}

export interface StremioVideo {
  id: string;
  title: string;
  released: string;
  season: number;
  episode: number;
  overview?: string;
  thumbnail?: string;
}

export interface StremioCatalogItem {
  id: string;
  type: "movie" | "series";
  name: string;
  poster?: string;
  background?: string;
  description?: string;
  releaseInfo?: string;
  imdbRating?: string;
  genres?: string[];
}

export interface StremioCatalogResponse {
  metas: StremioCatalogItem[];
}

export interface StremioMetaDetail extends StremioCatalogItem {
  year?: string;
  releaseDate?: string;
  runtime?: string;
  director?: string[];
  cast?: string[];
  country?: string;
  genres?: string[];
  videos?: StremioVideo[];
}

export interface StremioMetaResponse {
  meta: StremioMetaDetail | null;
}
