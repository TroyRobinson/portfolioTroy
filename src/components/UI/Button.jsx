import React from 'react';

export const Button = ({ children, onClick, style }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '120px',
        height: '40px',
        backgroundColor: '#2b6cb0',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        ...style
      }}
    >
      {children}
    </button>
  );
};
