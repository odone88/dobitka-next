// Shared league zone definitions — used by LeagueTable, league pages, tabela pages

export const ZONES: Record<string, { ucl: number; ucl_q?: number; uel: number; uecl?: number; playoff?: number; rel: number }> = {
  PL:  { ucl: 4,              uel: 6,  uecl: 7,  rel: 18 },
  PD:  { ucl: 4,              uel: 6,  uecl: 7,  rel: 18 },
  SA:  { ucl: 4,              uel: 6,  uecl: 7,  rel: 18 },
  BL1: { ucl: 4,              uel: 5,  uecl: 6,  playoff: 16, rel: 17 },
  FL1: { ucl: 3, ucl_q: 4,   uel: 5,  uecl: 6,  playoff: 16, rel: 17 },
  CL:  { ucl: 8,              uel: 16, rel: 99 },
  PPL: { ucl: 1,              uel: 2,  uecl: 3,  playoff: 15, rel: 16 },
};

export type ZoneType = 'ucl' | 'ucl_q' | 'uel' | 'uecl' | 'playoff' | 'rel' | 'safe';

export function getZone(pos: number, code: string): ZoneType {
  const z = ZONES[code];
  if (!z) return 'safe';
  if (pos > z.rel) return 'rel';
  if (z.playoff && pos >= z.playoff) return 'playoff';
  if (pos <= z.ucl) return 'ucl';
  if (z.ucl_q && pos === z.ucl_q) return 'ucl_q';
  if (pos <= z.uel) return 'uel';
  if (z.uecl && pos <= z.uecl) return 'uecl';
  return 'safe';
}

export const ZONE_BORDER: Record<ZoneType, string> = {
  ucl:     'border-l-2 border-l-blue-500',
  ucl_q:   'border-l-2 border-l-blue-400',
  uel:     'border-l-2 border-l-orange-400',
  uecl:    'border-l-2 border-l-emerald-500',
  playoff: 'border-l-2 border-l-yellow-400',
  rel:     'border-l-2 border-l-red-500',
  safe:    'border-l-2 border-l-transparent',
};

export const ZONE_BORDER_THICK: Record<ZoneType, string> = {
  ucl:     'border-l-[3px] border-l-blue-500',
  ucl_q:   'border-l-[3px] border-l-blue-400',
  uel:     'border-l-[3px] border-l-orange-400',
  uecl:    'border-l-[3px] border-l-emerald-500',
  playoff: 'border-l-[3px] border-l-yellow-400',
  rel:     'border-l-[3px] border-l-red-500',
  safe:    'border-l-[3px] border-l-transparent',
};

export const LEGEND_ITEMS: { zone: ZoneType; label: string; color: string }[] = [
  { zone: 'ucl',     label: 'Liga Mistrzow',     color: 'bg-blue-500' },
  { zone: 'uel',     label: 'Liga Europy',        color: 'bg-orange-400' },
  { zone: 'uecl',    label: 'Liga Konferencji',   color: 'bg-emerald-500' },
  { zone: 'playoff', label: 'Baraze',             color: 'bg-yellow-400' },
  { zone: 'rel',     label: 'Spadek',             color: 'bg-red-500' },
];
