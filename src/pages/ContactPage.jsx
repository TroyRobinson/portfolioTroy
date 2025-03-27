import React from 'react';
import { FlexCol, FlexRow } from '../utils.jsx';
import PageLayout from '../components/PageLayout.jsx';

const ContactPage = () => {
  const [showForm, setShowForm] = React.useState(false);

  return (
    <PageLayout title="Contact Me">
      <FlexCol style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <FlexCol style={{ gap: '15px', padding: '0 0 20px 0' }}>
          <FlexRow style={{ alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', minWidth: '80px' }}>Email:</span>
            <a href="mailto:contact@example.com" style={{ color: '#2b6cb0' }}>contact@example.com</a>
          </FlexRow>
          
          <FlexRow style={{ alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', minWidth: '80px' }}>LinkedIn:</span>
            <a href="https://linkedin.com/in/example" target="_blank" rel="noopener noreferrer" style={{ color: '#2b6cb0' }}>linkedin.com/in/example</a>
          </FlexRow>
          
          <FlexRow style={{ alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', minWidth: '80px' }}>GitHub:</span>
            <a href="https://github.com/example" target="_blank" rel="noopener noreferrer" style={{ color: '#2b6cb0' }}>github.com/example</a>
          </FlexRow>
        </FlexCol>
        
        <div style={{
          backgroundColor: '#f3f4f6',
          border: 'none',
          padding: '15px',
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          marginBottom: showForm ? '15px' : '0',
          boxSizing: 'border-box'
        }} onClick={() => setShowForm(!showForm)}>
          <span>Send me a message</span>
          <span style={{ fontSize: '1.2rem' }}>{showForm ? '-' : '+'}</span>
        </div>
        
        {showForm && (
          <div style={{
            overflow: 'hidden',
            backgroundColor: '#f9f9f9',
            borderRadius: '0 0 4px 4px',
            padding: '15px'
          }}>
            <form>
              <FlexCol style={{ gap: '15px' }}>
                <FlexRow style={{ gap: '15px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%' }}>
                    <span>Name</span>
                    <input type="text" style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }} />
                  </label>
                  
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%' }}>
                    <span>Email</span>
                    <input type="email" style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }} />
                  </label>
                </FlexRow>
                
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span>Subject</span>
                  <input type="text" style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }} />
                </label>
                
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span>Message</span>
                  <textarea rows={4} style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }} />
                </label>
                
                <button type="button" style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#2b6cb0',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  Send Message
                </button>
              </FlexCol>
            </form>
          </div>
        )}
      </FlexCol>
    </PageLayout>
  );
};

export default ContactPage; 