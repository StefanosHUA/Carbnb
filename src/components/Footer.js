import React from 'react';

function Footer() {
  return (
    <footer style={{ background: '#1976d2', color: 'white', padding: '1rem 0', marginTop: '2rem', textAlign: 'center' }}>
      &copy; {new Date().getFullYear()} Carbnb. All rights reserved.
    </footer>
  );
}

export default Footer; 