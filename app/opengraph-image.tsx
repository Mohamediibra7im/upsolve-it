import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Upsolve.it - CP Training Tracker';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
          backgroundColor: '#050505',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #007F5F15 0%, transparent 70%)',
          position: 'relative',
        }}
      >
        {/* Background Grid */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(#ffffff03 1px, transparent 1px), linear-gradient(90deg, #ffffff03 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.5,
          }}
        />

        {/* Decorative Brackets Wrapper */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <span style={{ fontSize: '120px', color: '#007F5F', fontWeight: 200, transform: 'translateY(-10px)' }}>[</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span
                style={{
                  fontSize: '120px',
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                  color: 'white',
                  textTransform: 'uppercase',
                }}
              >
                UPSOLVE
              </span>
              <span
                style={{
                  fontSize: '120px',
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                  color: '#007F5F',
                  marginLeft: '8px',
                }}
              >
                .it
              </span>
            </div>
            
            <div 
              style={{ 
                marginTop: '10px',
                display: 'flex', 
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#007F5F10',
                padding: '8px 24px',
                borderRadius: '100px',
                border: '1px solid #007F5F30'
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#007F5F', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                Practice Redefined
              </span>
            </div>
          </div>

          <span style={{ fontSize: '120px', color: '#007F5F', fontWeight: 200, transform: 'translateY(-10px)' }}>]</span>
        </div>

        {/* Footer Metadata */}
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '30px',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#888',
            }}
          >
            <span style={{ color: '#007F5F' }}>Operator: Mohammed Ibrahim</span>
            <span>•</span>
            <span>Protocol: Practice Redefined</span>
            <span>•</span>
            <span>HNU - ICPC Community</span>
          </div>
        </div>

        {/* Top Accent Line */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #007F5F, transparent)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
