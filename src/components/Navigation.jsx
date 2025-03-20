import React from 'react';
import { FlexRow } from '../utils.jsx';
import { Link, useRouter } from '../Router.jsx';

const Navigation = () => {
  const { currentPath } = useRouter();
  
  return (
    <FlexRow style={{ 
      padding: '0 0 20px 0',
      gap: '10px'
    }}>
      <Link
        to="/"
        style={{
          padding: '10px 20px',
          textDecoration: 'none',
          fontWeight: 'bold',
          color: currentPath === '/' ? '#2b6cb0' : '#666',
          borderBottom: currentPath === '/' ? '2px solid #2b6cb0' : '2px solid transparent'
        }}
      >
        About Me
      </Link>
      
      <Link
        to="/portfolio"
        style={{
          padding: '10px 20px',
          textDecoration: 'none',
          fontWeight: 'bold',
          color: currentPath === '/portfolio' ? '#2b6cb0' : '#666',
          borderBottom: currentPath === '/portfolio' ? '2px solid #2b6cb0' : '2px solid transparent'
        }}
      >
        Case Studies
      </Link>
      
      <Link
        to="/contact"
        style={{
          padding: '10px 20px',
          textDecoration: 'none',
          fontWeight: 'bold',
          color: currentPath === '/contact' ? '#2b6cb0' : '#666',
          borderBottom: currentPath === '/contact' ? '2px solid #2b6cb0' : '2px solid transparent'
        }}
      >
        Contact
      </Link>
    </FlexRow>
  );
};

export default Navigation; 