// EMERGENCY TEST - Build: 2026-02-14T08:30:00Z
// If you see RED background, the deploy is working

export default function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#FF0000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</h1>
        <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#FF0000' }}>
          NEUE VERSION DEPLOYED!
        </h2>
        <p style={{ fontSize: '18px', color: '#333' }}>
          Wenn du diesen ROTEN Hintergrund siehst,<br/>
          funktioniert das Deployment!<br/><br/>
          <strong>Build:</strong> v2.2-EMERGENCY<br/>
          <strong>Zeit:</strong> 08:30 CET
        </p>
      </div>
    </div>
  );
}
