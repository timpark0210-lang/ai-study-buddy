export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontFamily: 'system-ui',
        backgroundColor: '#0a0a0a',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', margin: '0' }}>404</h1>
          <p style={{ opacity: 0.8 }}>Page Not Found | Kia Ora Tutor</p>
          <a href="/" style={{ 
            color: '#3b82f6', 
            textDecoration: 'none', 
            marginTop: '1rem', 
            display: 'inline-block',
            padding: '0.5rem 1rem',
            border: '1px solid #3b82f6',
            borderRadius: '0.5rem'
          }}>
            Return Home
          </a>
        </div>
      </body>
    </html>
  );
}
