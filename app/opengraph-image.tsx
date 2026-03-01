import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'SniperVeto – Community Stream Sniper Database';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadInter(weight: 400 | 700): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css?family=Inter:${weight}`,
    { headers: { 'User-Agent': 'Mozilla/4.0' } },
  ).then((r) => r.text());
  const url = css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"]+/)?.[0];
  if (!url) throw new Error(`Inter ${weight} URL not found`);
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const [fontBold, fontRegular, faceData, logoData] = await Promise.all([
    loadInter(700),
    loadInter(400),
    readFile(join(process.cwd(), 'public/face.png')),
    readFile(join(process.cwd(), 'public/logo.png')),
  ]);

  const faceSrc = `data:image/png;base64,${faceData.toString('base64')}`;
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          background: '#0f172a',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Inter',
        }}
      >
        {/* Faded troll face — right side decoration */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faceSrc}
          alt=""
          width={480}
          height={480}
          style={{
            position: 'absolute',
            right: -40,
            top: '50%',
            transform: 'translateY(-50%)',
            objectFit: 'contain',
            opacity: 0.07,
          }}
        />

        {/* Accent glow — top right */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -60,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Logo — top left */}
        <div
          style={{
            position: 'absolute',
            top: 72,
            left: 80,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="SniperVeto" height={52} style={{ objectFit: 'contain' }} />
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
            marginBottom: 28,
            maxWidth: 720,
          }}
        >
          <span style={{ color: '#f1f5f9' }}>The stream sniper</span>
          <span style={{ color: '#dc2626' }}>community blocklist.</span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: '#64748b',
            lineHeight: 1.5,
            maxWidth: 620,
            display: 'flex',
          }}
        >
          Report, upvote, and block known stream snipers across games and platforms.
        </div>

        {/* Bottom pills */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            display: 'flex',
            gap: 14,
          }}
        >
          {['Community-driven', 'Steam ID verified', 'Free'].map((label) => (
            <div
              key={label}
              style={{
                padding: '12px 26px',
                borderRadius: 999,
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.25)',
                color: '#dc2626',
                fontSize: 20,
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
        { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
      ],
    },
  );
}
