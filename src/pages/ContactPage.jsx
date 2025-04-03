import React from 'react'
import { FlexCol, FlexRow } from '../utils.jsx'
import { PageLayout } from '../components/PageLayout.jsx'

/**
 * Contact form and information page
 */
const ContactPage = ({ style }) => {
  // Common styles
  const styles = {
    contactInfo: {
      gap: '15px', 
      padding: '0 0 20px 0'
    },
    infoRow: {
      alignItems: 'center', 
      gap: '10px'
    },
    infoLabel: {
      fontWeight: 'bold',
      minWidth: '80px'
    },
    link: {
      color: '#2b6cb0'
    },
    formContainer: {
      backgroundColor: '#f9f9f9',
      borderRadius: '4px',
      padding: '15px',
      marginTop: '15px'
    },
    formTitle: {
      marginTop: 0,
      marginBottom: '15px',
      fontWeight: 500,
      fontStyle: 'normal'
    },
    formField: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    halfWidth: {
      width: '50%'
    },
    fieldLabel: {
      fontWeight: 500,
      fontStyle: 'normal'
    },
    input: {
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px'
    },
    button: {
      alignSelf: 'flex-start',
      backgroundColor: '#2b6cb0',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  };

  return (
    <PageLayout title='Contact Me' style={{ ...style }}>
      <FlexCol
        style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <FlexCol style={styles.contactInfo}>
          <FlexRow style={styles.infoRow}>
            <span style={styles.infoLabel}>Email:</span>
            <a href='mailto:contact@example.com' style={styles.link}>
              contact@example.com
            </a>
          </FlexRow>
          <FlexRow style={styles.infoRow}>
            <span style={styles.infoLabel}>LinkedIn:</span>
            <a
              href='https://linkedin.com/in/example'
              target='_blank'
              rel='noopener noreferrer'
              style={styles.link}
            >
              linkedin.com/in/example
            </a>
          </FlexRow>
          <FlexRow style={styles.infoRow}>
            <span style={styles.infoLabel}>GitHub:</span>
            <a
              href='https://github.com/example'
              target='_blank'
              rel='noopener noreferrer'
              style={styles.link}
            >
              github.com/example
            </a>
          </FlexRow>
        </FlexCol>

        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Send me a message</h2>
          <form>
            <FlexCol style={{ gap: '15px' }}>
              <FlexRow style={{ gap: '15px' }}>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  width: '50%'
                }}>
                  <span style={styles.fieldLabel}>Name</span>
                  <input type='text' style={styles.input} />
                </label>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  width: '50%'
                }}>
                  <span style={styles.fieldLabel}>Email</span>
                  <input type='email' style={styles.input} />
                </label>
              </FlexRow>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}>
                <span style={styles.fieldLabel}>Subject</span>
                <input type='text' style={styles.input} />
              </label>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}>
                <span style={styles.fieldLabel}>Message</span>
                <textarea
                  rows={4}
                  style={{...styles.input, resize: 'vertical'}}
                />
              </label>
              <button type='button' style={styles.button}>
                Send Message
              </button>
            </FlexCol>
          </form>
        </div>
      </FlexCol>
    </PageLayout>
  )
}

export default ContactPage
