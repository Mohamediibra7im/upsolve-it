import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
          border: '8px solid #007F5F',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#007F5F40', fontSize: 80, fontWeight: 200, transform: 'translateY(-6px)' }}>[</span>
          <span
            style={{
              fontSize: 90,
              fontWeight: 900,
              color: '#007F5F',
              fontFamily: 'sans-serif',
              letterSpacing: '-0.05em',
            }}
          >
            U
          </span>
          <span style={{ color: '#007F5F40', fontSize: 80, fontWeight: 200, transform: 'translateY(-6px)' }}>]</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
