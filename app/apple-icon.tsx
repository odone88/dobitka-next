import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
        <span style={{ color: '#22c55e', fontSize: '90px', fontWeight: 900, fontFamily: 'sans-serif' }}>
          D
        </span>
      </div>
    ),
    { ...size },
  );
}
