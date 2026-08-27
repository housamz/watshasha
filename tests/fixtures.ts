import type { TmdbMovieItem, TmdbTvItem } from '../src/types/tmdb.js';

export const arabicMovie: TmdbMovieItem = {
  id: 123,
  title: 'الفيل الأزرق',
  original_title: 'الفيل الأزرق',
  original_language: 'ar',
  overview: 'طبيب نفسي يعود إلى العمل.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2014-07-28',
  popularity: 20,
  vote_average: 7.1,
  vote_count: 100,
};

export const arabicSeries: TmdbTvItem = {
  id: 456,
  name: 'الاختيار',
  original_name: 'الاختيار',
  original_language: 'ar',
  overview: 'مسلسل درامي.',
  poster_path: null,
  backdrop_path: null,
  first_air_date: '2020-04-24',
  popularity: 10,
  vote_average: 8,
  vote_count: 50,
};
