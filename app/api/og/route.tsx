import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const home = (searchParams.get('home') ?? 'Home').slice(0, 40);
  const away = (searchParams.get('away') ?? 'Away').slice(0, 40);
  const score = (searchParams.get('score') ?? '').slice(0, 10);
  const competition = (searchParams.get('comp') ?? '').slice(0, 40);
  const status = (searchParams.get('status') ?? '').slice(0, 20);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <span style={{ color: '#22c55e', fontSize: '28px', fontWeight: 900, letterSpacing: '0.05em' }}>
            DOBITKA
          </span>
          {competition && (
            <span style={{ color: '#888', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {competition}
            </span>
          )}
        </div>

        {/* Match */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
          }}
        >
          <span style={{ color: '#fff', fontSize: '36px', fontWeight: 700, textAlign: 'right', maxWidth: '300px' }}>
            {home}
          </span>

          {score ? (
            <span style={{
              color: status === 'LIVE' ? '#ef4444' : '#fff',
              fontSize: '64px',
              fontWeight: 900,
              fontVariantNumeric: 'tabular-nums',
              padding: '8px 24px',
              borderRadius: '16px',
              backgroundColor: status === 'LIVE' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
            }}>
              {score}
            </span>
          ) : (
            <span style={{ color: '#22c55e', fontSize: '48px', fontWeight: 900 }}>
              vs
            </span>
          )}

          <span style={{ color: '#fff', fontSize: '36px', fontWeight: 700, textAlign: 'left', maxWidth: '300px' }}>
            {away}
          </span>
        </div>

        {/* Status */}
        {status && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {status === 'LIVE' && (
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            )}
            <span style={{
              color: status === 'LIVE' ? '#ef4444' : status === 'FINISHED' ? '#888' : '#22c55e',
              fontSize: '18px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}>
              {status === 'FINISHED' ? 'Zakonczony' : status === 'LIVE' ? 'Na zywo' : status}
            </span>
          </div>
        )}

        {/* Footer */}
        <span style={{ position: 'absolute', bottom: '20px', color: '#555', fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          dobitka-next.vercel.app
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
