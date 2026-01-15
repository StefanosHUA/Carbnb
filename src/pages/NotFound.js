import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found-page" style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div className="not-found-content" style={{
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '120px',
          fontWeight: '700',
          color: '#ff385c',
          margin: '0',
          lineHeight: '1',
          marginBottom: '20px'
        }}>404</h1>
        
        <h2 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#222222',
          margin: '0 0 16px 0'
        }}>Sorry, page not found</h2>
        
        <p style={{
          fontSize: '18px',
          color: '#717171',
          margin: '0 0 32px 0',
          lineHeight: '1.6'
        }}>
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            to="/" 
            className="back-home-btn"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              backgroundColor: '#ff385c',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e31c5f';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ff385c';
            }}
          >
            Go to Home
          </Link>
          
          <Link 
            to="/cars" 
            className="browse-cars-btn"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              backgroundColor: 'white',
              color: '#222222',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              border: '1px solid #dddddd',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#ff385c';
              e.target.style.color = '#ff385c';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#dddddd';
              e.target.style.color = '#222222';
            }}
          >
            Browse Cars
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

