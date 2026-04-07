import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Football decoration */}
        <div className="text-6xl mb-6" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="w-20 h-20 mx-auto opacity-30"
            fill="currentColor"
          >
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
            <polygon
              points="50,20 62,35 58,50 42,50 38,35"
              fill="currentColor"
              opacity="0.6"
            />
            <polygon
              points="30,60 38,50 50,55 48,70 35,70"
              fill="currentColor"
              opacity="0.6"
            />
            <polygon
              points="70,60 62,50 50,55 52,70 65,70"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* 404 in score-display font */}
        <h1 className="font-mono font-bold text-8xl tracking-tight text-primary mb-4">
          404
        </h1>

        <p className="text-xl text-foreground mb-2">
          Nie znalezlismy tej strony
        </p>

        <p className="text-muted-foreground mb-8">
          Moze szukasz wynikow?
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium transition-colors hover:bg-primary/90"
          >
            Strona glowna
          </Link>
          <Link
            href="/wyniki-na-zywo"
            className="inline-flex items-center justify-center rounded-md border border-border text-foreground px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Wyniki na zywo
          </Link>
        </div>
      </div>
    </div>
  );
}
