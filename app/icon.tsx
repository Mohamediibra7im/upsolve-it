import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
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
          position: 'relative',
        }}
      >
        {/* Corner Reticles */}
        <div style={{ position: 'absolute', top: 2, left: 2, width: 8, height: 2, background: '#007F5F', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 2, left: 2, width: 2, height: 8, background: '#007F5F', display: 'flex' }} />
        
        <div style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 2, background: '#007F5F', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 2, right: 2, width: 2, height: 8, background: '#007F5F', display: 'flex' }} />

        <div style={{ position: 'absolute', bottom: 2, left: 2, width: 8, height: 2, background: '#007F5F', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 2, left: 2, width: 2, height: 8, background: '#007F5F', display: 'flex' }} />

        <div style={{ position: 'absolute', bottom: 2, right: 2, width: 8, height: 2, background: '#007F5F', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 2, right: 2, width: 2, height: 8, background: '#007F5F', display: 'flex' }} />

        {/* Central Core U */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: 'white',
            fontFamily: 'sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateY(-1px)',
          }}
        >
          U
        </div>

        {/* Status Pulse Dot */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: 8, 
            right: 8, 
            width: 4, 
            height: 4, 
            borderRadius: '50%', 
            background: '#007F5F',
            display: 'flex'
          }} 
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
