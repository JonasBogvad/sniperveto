import { ImageResponse } from 'next/og';

export const alt = 'SniperVeto – Community Stream Sniper Database';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
        }}
      >
        <span style={{ color: '#dc2626', fontSize: 96, fontWeight: 700 }}>
          SniperVeto
        </span>
        <span style={{ color: '#94a3b8', fontSize: 36, marginTop: 24 }}>
          Community stream sniper database
        </span>
      </div>
    ),
    { ...size }
  );
}
