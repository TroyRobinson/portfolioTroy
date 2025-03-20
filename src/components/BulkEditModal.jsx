import React from 'react';
import { FlexCol, FlexRow } from '../utils.jsx';

const BulkEditModal = ({ 
  isOpen, 
  onClose, 
  jsonValue, 
  onJsonChange, 
  onSave, 
  isClearing, 
  jsonError 
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
        width: '90%',
        maxWidth: '800px',
        padding: '20px',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '0 0 10px 0' }}>
          Edit Case Studies JSON
        </h3>
        
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
          Edit the JSON directly to add, remove, or modify case studies. Each case study requires at minimum a 'name' and 'technologies' field.
        </p>
        
        {jsonError && (
          <div style={{ 
            color: 'red', 
            backgroundColor: '#ffeeee', 
            padding: '10px', 
            border: '1px solid #ffcccc',
            borderRadius: '4px',
            marginBottom: '10px',
            fontSize: '0.9rem'
          }}>
            {jsonError}
          </div>
        )}
        
        <textarea
          value={jsonValue}
          onChange={(e) => onJsonChange(e.target.value)}
          style={{
            width: '100%',
            height: '400px',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            resize: 'vertical'
          }}
        />
        
        <FlexRow style={{ justifyContent: 'flex-end', gap: '10px', padding: '15px 0 0 0' }}>
          <button 
            onClick={onClose}
            disabled={isClearing}
            style={{
              padding: '10px 15px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '4px',
              cursor: isClearing ? 'not-allowed' : 'pointer',
              opacity: isClearing ? 0.7 : 1
            }}
          >
            Cancel
          </button>
          
          <button 
            onClick={onSave}
            disabled={isClearing}
            style={{
              padding: '10px 15px',
              backgroundColor: '#805ad5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isClearing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isClearing ? 0.7 : 1
            }}
          >
            {isClearing ? 'Syncing...' : 'Save & Sync Database'}
          </button>
        </FlexRow>
      </div>
    </div>
  );
};

export default BulkEditModal; 