import React from 'react';
import { FlexRow } from '../utils.jsx';
import { Link, useLocation } from '../Router.jsx';

const Navigation = ({ style }) => {
  const [location] = useLocation();
  
  // Common link styles
  const linkStyle = {
    padding: '10px 20px',
    textDecoration: 'none',
    fontWeight: 'bold',
    color: '#666',
    borderBottom: '2px solid transparent'
  };
  
  // Active link style modifications
  const getActiveStyle = (path) => ({
    ...linkStyle,
    color: location === path ? '#2b6cb0' : '#666',
    borderBottom: location === path ? '2px solid #2b6cb0' : '2px solid transparent'
  });
  
  return (
    <FlexRow style={{ 
      padding: '0 0 20px 0',
      gap: '10px',
      ...style
    }}>
      <Link href="/" style={getActiveStyle('/')}>
        About Me
      </Link>
      
      <Link href="/portfolio" style={getActiveStyle('/portfolio')}>
        Case Studies
      </Link>
      
      <Link href="/contact" style={getActiveStyle('/contact')}>
        Contact
      </Link>
    </FlexRow>
  );
};

export default Navigation; 