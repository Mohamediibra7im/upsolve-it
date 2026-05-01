import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Upsolve.it - CP Training Tracker';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const montserratBold = await fetch(
    new URL('./fonts/Montserrat-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

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
          position: 'relative',
        }}
      >
        {/* Background Radial Glow */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 50% 50%, #007F5F10 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Corner Telemetry: Top Left */}
        <div style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: '#007F5F', fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em' }}>PLATFORM</span>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>UPSOLVE.IT // V2.0</span>
        </div>

        {/* Corner Telemetry: Top Right */}
        <div style={{ position: 'absolute', top: '40px', right: '40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ color: '#007F5F', fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em' }}>STATION</span>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>CAIRO, EGYPT</span>
        </div>

        {/* Corner Telemetry: Bottom Left */}
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: '#007F5F', fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em' }}>LEAD OPERATOR</span>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>MOHAMMED IBRAHIM</span>
        </div>

        {/* Corner Telemetry: Bottom Right */}
        <div style={{ position: 'absolute', bottom: '40px', right: '40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ color: '#007F5F', fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em' }}>ESTABLISHED</span>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>HNU - ICPC COMMUNITY // 2026</span>
        </div>

        {/* Side Level Bars */}
        <div style={{ position: 'absolute', left: '40px', top: '150px', bottom: '150px', width: '2px', backgroundColor: '#007F5F20', display: 'flex' }}>
          <div style={{ height: '70%', width: '100%', backgroundColor: '#007F5F', display: 'flex' }} />
        </div>
        <div style={{ position: 'absolute', right: '40px', top: '150px', bottom: '150px', width: '2px', backgroundColor: '#007F5F20', display: 'flex' }}>
          <div style={{ height: '40%', width: '100%', backgroundColor: '#007F5F', display: 'flex' }} />
        </div>

        {/* Center Branding Area */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '20px'
          }}
        >
          {/* Top Row: Brackets + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div style={{ fontSize: '180px', color: '#007F5F', fontWeight: 200, display: 'flex', lineHeight: 1 }}>[</div>
            
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontFamily: 'Montserrat',
                lineHeight: 1,
                transform: 'translateY(15px)'
              }}
            >
              <span style={{ fontSize: '120px', color: 'white', letterSpacing: '-0.06em' }}>UPSOLVE</span>
              <span style={{ fontSize: '120px', color: '#007F5F', letterSpacing: '-0.06em', marginLeft: '10px' }}>.it</span>
            </div>

            <div style={{ fontSize: '180px', color: '#007F5F', fontWeight: 200, display: 'flex', lineHeight: 1 }}>]</div>
          </div>
          
          {/* Bottom Row: Protocol Badge */}
          <div 
            style={{ 
              display: 'flex', 
              backgroundColor: '#007F5F10',
              padding: '10px 40px',
              border: '1px solid #007F5F30',
              borderRadius: '4px'
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#007F5F', textTransform: 'uppercase', letterSpacing: '0.6em' }}>
              Practice Redefined
            </span>
          </div>
        </div>

        {/* System Dashboard Bar */}
        <div 
          style={{
            position: 'absolute',
            bottom: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            backgroundColor: '#080808',
            padding: '8px 30px',
            borderRadius: '100px',
            border: '1px solid #ffffff05'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#007F5F', display: 'flex' }} />
            <span style={{ color: '#888', fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em' }}>ENGINE: ACTIVE</span>
          </div>
          <div style={{ width: '1px', height: '10px', backgroundColor: '#333', display: 'flex' }} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#888', fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em' }}>SYNC: 100%</span>
          </div>
          <div style={{ width: '1px', height: '10px', backgroundColor: '#333', display: 'flex' }} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#007F5F', fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em' }}>CONNECTION: SECURE</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Montserrat',
          data: montserratBold,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
}
