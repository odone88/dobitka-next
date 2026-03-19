'use client';

import { useEffect, useRef } from 'react';

// Hook: dodaje klase 'visible' do elementow z klasa 'reveal'
// gdy wchodza w viewport (staggered fade-in on scroll)
export function useReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = containerRef.current.querySelectorAll('.reveal');
    elements.forEach((el, i) => {
      // Staggered delay
      (el as HTMLElement).style.transitionDelay = `${i * 60}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
