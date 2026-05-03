import React from 'react';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      <h2 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>Loading VoteGuide AI...</h2>
      <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Preparing your civic roadmap.</p>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
