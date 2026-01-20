import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Nyxus - Creators of Night'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #312e81)', // Slate-950 to Indigo-900
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e2e8f0', 
          fontFamily: 'serif', 
        }}
      >

        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 20,
            fontSize: 100
        }}>
          🌙
        </div>

        <div style={{ fontSize: 80, fontWeight: 'bold', letterSpacing: '-0.05em', color: '#fff' }}>
          NYXUS
        </div>
        
        <div style={{ 
            fontSize: 32, 
            marginTop: 20, 
            color: '#a5b4fc', // Indigo-300
            textTransform: 'uppercase',
            letterSpacing: '0.2em'
        }}>
          Creators of Night
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}