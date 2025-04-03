import React from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import { FlexCol, FlexRow } from '../utils.jsx';
import Navigation from './Navigation.jsx';

/**
 * PageLayout component
 * @component
 * @preferred-size 600x400
 */
export const PageLayout = ({ children, title = 'Welcome', style }) => {
  return (
    <FlexCol
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        padding: '20px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        alignItems: 'flex-start',
        ...style
      }}
    >
      <FlexRow style={{ 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 0 20px 0',
        flexWrap: 'wrap',
        gap: '20px',
        width: '100%'
      }}>
        <FlexCol style={{ alignItems: 'flex-start' }}>
          <h1 style={{ fontSize: '2.5rem', padding: '0 0 10px 0' }}>My Portfolio</h1>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Web Developer & Designer</p>
        </FlexCol>
        
        <Avatar.Root style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          overflow: 'hidden',
          userSelect: 'none',
          width: 100,
          height: 100,
          borderRadius: '100%',
          backgroundColor: 'black'
        }}>
          <Avatar.Fallback style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgb(43, 108, 176)',
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            MP
          </Avatar.Fallback>
        </Avatar.Root>
      </FlexRow>
      
      <div style={{ height: '1px', backgroundColor: '#e0e0e0', margin: '0 0 20px 0', width: '100%' }} />
      
      <Navigation style={{ width: '100%', alignItems: 'flex-start' }} />
      
      {title && <h2 style={{ fontSize: '1.8rem', padding: '20px 0', textAlign: 'left' }}>{title}</h2>}
      
      <div style={{ width: '100%', alignItems: 'flex-start', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </FlexCol>
  );
}; 