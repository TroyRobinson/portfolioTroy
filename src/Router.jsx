import React, { useState, useEffect, createContext, useContext } from 'react';
import { FlexCol } from './utils.jsx';
import Header from './components/Header.jsx';

// Create a context to hold our routing state
const RouterContext = createContext({});

export function RouterProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Update the path when the user navigates
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Navigate to a new page
  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setCurrentPath(to);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
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
        <Header />
        {children}
      </FlexCol>
    </RouterContext.Provider>
  );
}

// Hook to use the router
export function useRouter() {
  return useContext(RouterContext);
}

// Link component
export function Link({ to, children, ...props }) {
  const { navigate } = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

// Route component
export function Route({ path, component: Component }) {
  const { currentPath } = useRouter();
  
  // Simple path matching (exact match or root path special case)
  const isMatch = currentPath === path || 
                  (path === '/' && (currentPath === '' || currentPath === '/'));
  
  if (isMatch) {
    return <Component />;
  }
  
  return null;
}

// Routes component
export function Routes({ children }) {
  return <>{children}</>;
} 