import React from 'react';

/**
 * A styled tag/badge component for displaying labels
 */
export const Tag = ({ children, style = {} }) => {
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
        display: 'inline-block',
        ...style
      }}
    >
      {children}
    </span>
  );
}; 