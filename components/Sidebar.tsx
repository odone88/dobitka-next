'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LEAGUES } from '@/config/leagues';
import { cn } from '@/lib/utils';

const SLUG_MAP: Record<string, string> = {
  PPL: 'ekstraklasa',
  PL: 'premier-league',
  PD: 'la-liga',
  SA: 'serie-a',
  BL1: 'bundesliga',
  FL1: 'ligue-1',
  CL: 'liga-mistrzow',
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-52 flex-shrink-0">
      <div className="sticky top-[72px] space-y-1">
        <span className="label-retro block mb-2 px-2">Ligi</span>
        {LEAGUES.map((league) => {
          const slug = SLUG_MAP[league.code];
          if (!slug) return null;
          const href = `/${slug}`;
          const active = pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={league.code}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                active
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
              )}
            >
              <span className="text-base leading-none">{league.flag}</span>
              <span className="truncate">{league.name}</span>
            </Link>
          );
        })}

        <div className="divider-retro my-3" />

        <Link
          href="/wyniki-na-zywo"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
            pathname === '/wyniki-na-zywo'
              ? 'bg-destructive/15 text-destructive border border-destructive/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
          </span>
          <span>Na zywo</span>
        </Link>

        <Link
          href="/typer"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
            pathname === '/typer'
              ? 'bg-primary/15 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
            <path d="m9 15 2 2 4-4"/>
          </svg>
          <span>Typer</span>
        </Link>

        <Link
          href="/predykcje"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
            pathname === '/predykcje'
              ? 'bg-primary/15 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M12 20V10"/>
            <path d="M18 20V4"/>
            <path d="M6 20v-4"/>
          </svg>
          <span>Predykcje</span>
        </Link>

        <Link
          href="/gdzie-ogladac"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
            pathname === '/gdzie-ogladac'
              ? 'bg-primary/15 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
            <polyline points="17 2 12 7 7 2"/>
          </svg>
          <span>Gdzie ogladac</span>
        </Link>

        <Link
          href="/archive"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
            pathname === '/archive'
              ? 'bg-primary/15 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <rect width="20" height="5" x="2" y="3" rx="1"/>
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
            <path d="M10 12h4"/>
          </svg>
          <span>Archiwum</span>
        </Link>
      </div>
    </aside>
  );
}
