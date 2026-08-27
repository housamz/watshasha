export interface CatalogConfig {
  id: string;
  type: "movie" | "series";
  name: string;
  language: string;
  sort?: string;
}

export const CATALOG_CONFIGS: Record<string, CatalogConfig> = {
  "arabic-movies": {
    id: "arabic-movies",
    type: "movie",
    name: "Watshasha",
    language: "ar",
    sort: "popularity.desc",
  },
  "arabic-series": {
    id: "arabic-series",
    type: "series",
    name: "Watshasha",
    language: "ar",
    sort: "popularity.desc",
  },
};

export function getCatalogConfig(id: string): CatalogConfig | undefined {
  return CATALOG_CONFIGS[id];
}
