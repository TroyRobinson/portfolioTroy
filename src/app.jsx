import React from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import { RouterProvider, Routes, Route } from './Router.jsx';
import { FlexCol, FlexRow } from './utils.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import Navigation from './components/Navigation.jsx';

// Main App component
export const App = () => {
  return (
    <RouterProvider>
      <FlexCol
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          height: '100%',
          padding: '20px',
          fontFamily: 'sans-serif',
          backgroundColor: '#f9f9f9',
          color: '#333',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        <FlexRow style={{ 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0 0 20px 0',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <FlexCol style={{}}>
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
        
        <div style={{ height: '1px', backgroundColor: '#e0e0e0', margin: '0 0 20px 0' }} />
        
        <Navigation />
        
        <Routes>
          <Route path="/" component={AboutPage} />
          <Route path="/portfolio" component={PortfolioPage} />
          <Route path="/contact" component={ContactPage} />
        </Routes>
      </FlexCol>
    </RouterProvider>
  );
};

export default App;