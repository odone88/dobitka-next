import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          borderRadius: '32px',
        }}
      >
        <span style={{ color: '#22c55e', fontSize: '96px', fontWeight: 900, fontFamily: 'sans-serif' }}>
          D
        </span>
      </div>
    ),
    { ...size },
  );
}
