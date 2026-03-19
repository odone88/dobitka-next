'use client';

import { useEffect, useRef, useState } from 'react';

// Lazy load — renderuje children dopiero gdy sekcja wejdzie w viewport
// Zmniejsza liczbe poczatkowych API calls
export function LazySection({ children, className, fallback }: {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' } // Zacznij ladowac 200px przed widocznoscia
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {visible ? children : (fallback ?? null)}
    </div>
  );
}
