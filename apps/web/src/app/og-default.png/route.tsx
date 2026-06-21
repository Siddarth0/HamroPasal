import { ImageResponse } from 'next/og';

// Default social-share card (1200×630), rendered on the fly by next/og.
// Served at the stable URL `/og-default.png` referenced by metadata + JSON-LD.
export const runtime = 'edge';

const NAVY = '#0b1f3a';
const NAVY_2 = '#13294f';
const ORANGE = '#f1561e';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_2} 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              width: 96,
              height: 96,
              borderRadius: 24,
              background: ORANGE,
              color: '#fff',
              fontSize: 64,
              fontWeight: 800,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 28,
            }}
          >
            H
          </div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#fff' }}>
            Hamro<span style={{ color: ORANGE }}>Pasal</span>
          </div>
        </div>

        <div style={{ display: 'flex', marginTop: 44, fontSize: 52, fontWeight: 700, color: '#fff' }}>
          Nepal’s Online Marketplace
        </div>
        <div style={{ display: 'flex', marginTop: 20, fontSize: 30, color: '#c7d2e5', maxWidth: 900 }}>
          Shop thousands of products from local sellers — pay with eSewa, Khalti, card or COD.
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            paddingTop: 40,
            fontSize: 26,
            color: ORANGE,
            fontWeight: 600,
          }}
        >
          hamropasal.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
