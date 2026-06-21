import { ImageResponse } from 'next/og';

// App icon (512×512) for the PWA manifest + JSON-LD logo. next/og, stable URL.
export const runtime = 'edge';

const NAVY = '#0b1f3a';
const ORANGE = '#f1561e';
const SIZE = 512;

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: NAVY,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '78%',
            height: '78%',
            borderRadius: 96,
            background: ORANGE,
            color: '#fff',
            fontSize: 300,
            fontWeight: 800,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          H
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}
