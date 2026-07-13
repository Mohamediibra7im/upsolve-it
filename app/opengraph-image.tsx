import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'Upsolve.it - The ultimate command center for competitive programmers';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  const montserratBold = readFileSync(
    join(process.cwd(), 'app/fonts/Montserrat-Bold.ttf')
  );

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
          backgroundColor: '#040604',
          position: 'relative',
          fontFamily: 'Montserrat',
        }}
      >
        {/* Background Grid Lines Overlay */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 50% 50%, #10b98108 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Corner Telemetry: Top Left */}
        <div style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 900, letterSpacing: '0.25em' }}>{"// SYS_PROTOCOL"}</span>
          <span style={{ color: 'white', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>UPSOLVE_COMMAND_CENTER_V2.0</span>
        </div>

        {/* Corner Telemetry: Top Right */}
        <div style={{ position: 'absolute', top: '40px', right: '40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 900, letterSpacing: '0.25em' }}>{"// SECTOR"}</span>
          <span style={{ color: 'white', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>ONLINE_MATRIX_GLOBAL</span>
        </div>

        {/* Corner Telemetry: Bottom Left */}
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 900, letterSpacing: '0.25em' }}>{"// COMPILER_OPERATOR"}</span>
          <span style={{ color: 'white', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>MOHAMMED IBRAHIM</span>
        </div>

        {/* Corner Telemetry: Bottom Right */}
        <div style={{ position: 'absolute', bottom: '40px', right: '40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 900, letterSpacing: '0.25em' }}>{"// AUTHORIZED"}</span>
          <span style={{ color: 'white', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>HNU_ICPC_COMMUNITY_2026</span>
        </div>

        {/* Side Level Terminal Meters */}
        <div style={{ position: 'absolute', left: '40px', top: '150px', bottom: '150px', width: '2px', backgroundColor: '#10b98115', display: 'flex' }}>
          <div style={{ height: '75%', width: '100%', backgroundColor: '#10b981', display: 'flex' }} />
        </div>
        <div style={{ position: 'absolute', right: '40px', top: '150px', bottom: '150px', width: '2px', backgroundColor: '#10b98115', display: 'flex' }}>
          <div style={{ height: '50%', width: '100%', backgroundColor: '#10b981', display: 'flex' }} />
        </div>

        {/* Center Branding Area */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          {/* Top Row: Brackets + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '160px', color: '#10b981', fontWeight: 100, display: 'flex', lineHeight: 1 }}>[</div>
            
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                lineHeight: 1,
                transform: 'translateY(10px)'
              }}
            >
              <span style={{ fontSize: '105px', color: 'white', letterSpacing: '0.05em', fontWeight: 900 }}>UPSOLVE</span>
              <span style={{ fontSize: '105px', color: '#10b981', letterSpacing: '0.05em', fontWeight: 900, marginLeft: '5px' }}>.it</span>
            </div>

            <div style={{ fontSize: '160px', color: '#10b981', fontWeight: 100, display: 'flex', lineHeight: 1 }}>]</div>
          </div>
          
          {/* Bottom Row: Protocol Executable Badge */}
          <div 
            style={{ 
              display: 'flex', 
              backgroundColor: '#10b98108',
              padding: '8px 30px',
              border: '1px solid #10b98125',
              borderRadius: '2px'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              [ SYSTEM_MASTERY_ACTIVE.EXE ]
            </span>
          </div>
        </div>

        {/* System Dashboard Telemetry Bar */}
        <div 
          style={{
            position: 'absolute',
            bottom: '110px',
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            backgroundColor: '#060a08',
            padding: '8px 24px',
            borderRadius: '2px',
            border: '1px solid #10b98115'
          }}
        >
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#10b981', display: 'flex' }} />
            <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em' }}>SYS: ONLINE</span>
          </div>
          <div style={{ width: '1px', height: '8px', backgroundColor: '#10b98115', display: 'flex' }} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#10b98180', fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em' }}>DB_SYNC: 100%</span>
          </div>
          <div style={{ width: '1px', height: '8px', backgroundColor: '#10b98115', display: 'flex' }} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em' }}>INTEGRITY: SECURE</span>
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
