import React from 'react';
import { FlexRow } from '../utils.jsx';
import { Link, useLocation } from '../Router.jsx';

const Navigation = ({ style }) => {
  const [location] = useLocation();
  
  return (
    <FlexRow style={{ 
      padding: '0 0 20px 0',
      gap: '10px',
      ...style
    }}>
      <Link
        href="/"
        style={{
          padding: '10px 20px',
          textDecoration: 'none',
          fontWeight: 'bold',
          color: location === '/' ? '#2b6cb0' : '#666',
          borderBottom: location === '/' ? '2px solid #2b6cb0' : '2px solid transparent'
        }}
      >
        About Me
      </Link>
      
      <Link
        href="/portfolio"
        style={{
          padding: '10px 20px',
          textDecoration: 'none',
          fontWeight: 'bold',
          color: location === '/portfolio' ? '#2b6cb0' : '#666',
          borderBottom: location === '/portfolio' ? '2px solid #2b6cb0' : '2px solid transparent'
        }}
      >
        Case Studies
      </Link>
      
      <Link
        href="/contact"
        style={{
          padding: '10px 20px',
          textDecoration: 'none',
          fontWeight: 'bold',
          color: location === '/contact' ? '#2b6cb0' : '#666',
          borderBottom: location === '/contact' ? '2px solid #2b6cb0' : '2px solid transparent'
        }}
      >
        Contact
      </Link>
    </FlexRow>
  );
};

export default Navigation; 