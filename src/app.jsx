import React, { useEffect } from 'react';
import { Router, Route, Switch } from './Router.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import CaseStudyDetail from './pages/CaseStudyDetail.jsx';

// Main App component
export const App = () => {
  // Apply global styles to handle scrollbar consistency
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    
    // Add CSS to make scrollbars consistent
    style.textContent = `
      html {
        overflow-y: scroll;
        scrollbar-gutter: stable;
      }
      
      body {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: sans-serif;
        background-color: #f9f9f9;
        color: #333;
      }
      
      /* For Firefox */
      * {
        scrollbar-width: thin;
        scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
      }
      
      /* For Chrome/Safari/Edge */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      
      ::-webkit-scrollbar-thumb {
        background-color: rgba(155, 155, 155, 0.5);
        border-radius: 20px;
      }
    `;
    
    // Add the style to document head
    document.head.appendChild(style);
    
    // Clean up when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

// Separate component for the app content to use the router context
const AppContent = () => {
  return (
    <Switch>
      <Route path="/" component={AboutPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/portfolio/:slug">
        {params => <CaseStudyDetail slug={params.slug} />}
      </Route>
      <Route path="/contact" component={ContactPage} />
    </Switch>
  );
};

export default App;