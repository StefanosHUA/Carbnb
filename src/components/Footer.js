import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="footer-content">
        &copy; {new Date().getFullYear()} Carbnb. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer; 