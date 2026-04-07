'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('dobitka-theme');
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setDark(false);
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dobitka-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dobitka-theme', 'light');
    }
  }

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
      title={dark ? 'Tryb jasny' : 'Tryb ciemny'}
      aria-label={dark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
    >
      {dark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
    </button>
  );
}
