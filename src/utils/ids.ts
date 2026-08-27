export type MediaType = 'movie' | 'series';

export interface ParsedId {
  type: MediaType;
  tmdbId: number;
}

export function isImdbId(id: string): boolean {
  return /^tt\d{7,}$/.test(id) && !/^tt0+$/.test(id);
}

export function createWatshashaId(type: MediaType, tmdbId: number | string): string {
  if (!/^[1-9]\d*$/.test(String(tmdbId))) {
    throw new Error('TMDB ID must be a positive integer');
  }
  return `watshasha:${type}:tmdb:${tmdbId}`;
}

export function parseWatshashaId(id: string): ParsedId | null {
  if (!id) return null;

  // Accept the current namespace and legacy Watshasha IDs cached by existing clients.
  const match = /^(?:watshasha):(movie|series):tmdb:(\d+)$/.exec(id);
  if (match) {
    return {
      type: match[1] as MediaType,
      tmdbId: parseInt(match[2], 10),
    };
  }

  return null;
}
