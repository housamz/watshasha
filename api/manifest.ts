import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { StremioManifest } from '../src/types/stremio.js';
import { setCacheHeaders, setCorsHeaders } from '../src/utils/cache.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    setCorsHeaders(res);
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCacheHeaders(res, 'manifest');

  const manifest: StremioManifest = {
    id: 'app.vercel.watshasha',
    version: '0.5.2',
    name: 'Watshasha',
    description: 'Discover curated Arabic films and television series',
    resources: ['catalog', 'meta'],
    types: ['movie', 'series'],
    catalogs: [
      {
        type: 'movie',
        id: 'arabic-movies',
        name: 'Watshasha',
        extra: [{ name: 'skip', isRequired: false }],
      },
      {
        type: 'series',
        id: 'arabic-series',
        name: 'Watshasha',
        extra: [{ name: 'skip', isRequired: false }],
      },
    ],
  };

  return res.status(200).json(manifest);
}
