/** Polish URL slug -> football-data.org league code */
export const SLUG_TO_CODE: Record<string, string> = {
  'ekstraklasa': 'PPL',
  'premier-league': 'PL',
  'la-liga': 'PD',
  'bundesliga': 'BL1',
  'serie-a': 'SA',
  'ligue-1': 'FL1',
  'liga-mistrzow': 'CL',
};

/** Reverse: league code -> slug */
export const CODE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_CODE).map(([slug, code]) => [code, slug])
);

export function getCodeFromSlug(slug: string): string | undefined {
  return SLUG_TO_CODE[slug];
}

export function getSlugFromCode(code: string): string | undefined {
  return CODE_TO_SLUG[code];
}
