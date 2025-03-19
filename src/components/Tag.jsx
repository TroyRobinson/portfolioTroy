import React from 'react';

export const Tag = ({ children }) => {
  return (
    <span
      style={{
        backgroundColor: '#f0f0f0',
        color: '#333',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        marginRight: '8px',
        marginBottom: '8px',
        display: 'inline-block'
      }}
    >
      {children}
    </span>
  );
}; 