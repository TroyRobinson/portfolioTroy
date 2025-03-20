import React from 'react';
import { FlexCol, FlexRow } from '../utils.jsx';

const NewCaseStudyModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  onInputChange 
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
        maxWidth: '500px',
        padding: '20px',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '0 0 20px 0' }}>
          New Case Study
        </h3>
        
        <form onSubmit={onSubmit}>
          <FlexCol style={{ gap: '15px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>Project Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
            
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={3}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </label>
            
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>Technologies (comma separated)</span>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={onInputChange}
                required
                placeholder="React, Node.js, GraphQL"
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
            
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>Date</span>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onInputChange}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
            
            <FlexRow style={{ justifyContent: 'flex-end', gap: '10px', padding: '10px 0 0 0' }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button type="submit" style={{
                padding: '10px 15px',
                backgroundColor: '#2b6cb0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Add Case Study
              </button>
            </FlexRow>
          </FlexCol>
        </form>
      </div>
    </div>
  );
};

export default NewCaseStudyModal; 