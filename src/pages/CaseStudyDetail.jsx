import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react'
import { Link } from 'wouter'
import { PageLayout } from '../components/PageLayout.jsx'
import { FlexCol, FlexRow } from '../utils.jsx'
import { Tag } from '../components/Tag.jsx'

// Pre-load common case study data to avoid layout shifts
const GENERIC_CASE_STUDY = {
  name: 'Case Study Not Found',
  description:
    "Sorry, we couldn't find the case study you're looking for. This might be because the URL is incorrect or the case study has been removed.",
  technologies: 'React, Wouter, JavaScript',
  date: new Date().toISOString().split('T')[0],
}

// Cache for case studies to avoid repeated fetching
const caseStudyCache = new Map();

// Pre-generate some common case studies to eliminate first-time lag
// This eagerly creates data for likely slugs
const preloadCommonCaseStudies = () => {
  // Common case study slugs based on your sample data
  const commonSlugs = [
    'e-commerce-platform',
    'health-tracking-mobile-app',
    'enterprise-crm-system',
    'ai-powered-content-generator',
    'real-time-collaboration-tool'
  ];

  // Preload these common case studies
  commonSlugs.forEach(slug => {
    if (!caseStudyCache.has(slug)) {
      const name = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      const dummyData = {
        name,
        description:
          'This is a detailed case study showcasing the development process, challenges overcome, and final solution. The project demonstrates expertise in modern web development practices with a focus on performance and user experience.',
        technologies: 'React, JavaScript, CSS, HTML, API Integration',
        date: new Date().toISOString().split('T')[0],
      };
      
      caseStudyCache.set(slug, dummyData);
    }
  });
};

// Eagerly preload on module import
preloadCommonCaseStudies();

// Simple spinner component borrowed from PortfolioPage
const Spinner = () => (
  <div
    style={{
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '50%',
      borderTopColor: '#333',
      animation: 'spin 1s ease-in-out infinite',
      marginRight: '8px',
      verticalAlign: 'middle',
    }}
  >
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

// Separate skeleton component for code splitting
const CaseStudySkeleton = () => (
  <FlexCol style={{ gap: '20px', width: '100%' }}>
    <div style={{ 
      height: '24px', 
      width: '180px', 
      backgroundColor: '#f0f0f0',
      borderRadius: '4px'
    }}></div>
    <div style={{ 
      height: '120px', 
      width: '100%', 
      backgroundColor: '#f0f0f0',
      borderRadius: '4px'
    }}></div>
    <div style={{ 
      height: '24px', 
      width: '120px', 
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      marginTop: '10px'
    }}></div>
    <FlexRow style={{ gap: '8px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ 
          height: '30px', 
          width: '80px', 
          backgroundColor: '#f0f0f0',
          borderRadius: '20px'
        }}></div>
      ))}
    </FlexRow>
  </FlexCol>
);

// Optimized case study content component
const CaseStudyContent = React.memo(({ caseStudy }) => {
  if (!caseStudy) return null;
  
  return (
    <FlexCol style={{ gap: '20px' }}>
      <FlexRow
        style={{
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <span style={{ color: '#666' }}>
          {caseStudy.date}
        </span>
      </FlexRow>
      <p style={{ lineHeight: '1.6' }}>
        {caseStudy.description}
      </p>
      <FlexCol style={{ gap: '10px' }}>
        <h3
          style={{
            fontSize: '1.1rem',
            color: '#555',
          }}
        >
          Technologies
        </h3>
        <FlexRow
          style={{ flexWrap: 'wrap', gap: '8px' }}
        >
          {caseStudy.technologies
            .split(',')
            .map((tech, index) => (
              <Tag key={index}>{tech.trim()}</Tag>
            ))}
        </FlexRow>
      </FlexCol>
      {/* Additional case study content would go here */}
      {caseStudy === GENERIC_CASE_STUDY && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              color: '#555',
              marginBottom: '10px',
            }}
          >
            Looking for case studies?
          </h3>
          <p style={{ marginBottom: '15px' }}>
            Check out our portfolio to browse all
            available case studies.
          </p>
          <Link
            href='/portfolio'
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#2b6cb0',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            View Portfolio
          </Link>
        </div>
      )}
    </FlexCol>
  );
});

const CaseStudyDetail = ({ slug }) => {
  const [loading, setLoading] = useState(true)
  const [caseStudy, setCaseStudy] = useState(null)
  const [error, setError] = useState(null)
  const isMounted = useRef(true);
  const dataFetchStartTime = useRef(Date.now());
  
  // Track startup time for minimum display duration
  const MIN_LOADING_TIME = 100; // ms
  
  // Fetch missing case studies in background when component gets focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible, prefetch neighboring case studies
        preloadCommonCaseStudies();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Immediately check cache for faster initial render
  useEffect(() => {
    // Clean up function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Improved data fetching with caching and timing controls
  useEffect(() => {
    // Reset fetch timer on new slug
    dataFetchStartTime.current = Date.now();
    
    if (!slug) {
      // Use generic data if no slug provided
      setCaseStudy(GENERIC_CASE_STUDY)
      setLoading(false)
      return
    }
    
    // Check if we have this case study in cache first for immediate rendering
    if (caseStudyCache.has(slug)) {
      const cachedData = caseStudyCache.get(slug);
      
      // Ensure minimum display time of loading state to prevent flicker
      const elapsedTime = Date.now() - dataFetchStartTime.current;
      if (elapsedTime < MIN_LOADING_TIME) {
        setTimeout(() => {
          if (isMounted.current) {
            setCaseStudy(cachedData);
            setLoading(false);
          }
        }, MIN_LOADING_TIME - elapsedTime);
      } else {
        setCaseStudy(cachedData);
        setLoading(false);
      }
      return;
    }

    // Fetch case study data - with minimal delay for demo
    const fetchCaseStudy = async () => {
      try {
        // For a snappier experience, only delay by 100ms instead of 200ms
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Transform slug to title case for nicer display
        const name = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        const dummyData = {
          name,
          description:
            'This is a detailed case study showcasing the development process, challenges overcome, and final solution. The project demonstrates expertise in modern web development practices with a focus on performance and user experience.',
          technologies: 'React, JavaScript, CSS, HTML, API Integration',
          date: new Date().toISOString().split('T')[0],
        }
        
        // Cache the result for future use
        caseStudyCache.set(slug, dummyData);
        
        // Ensure minimum display time of loading state
        const elapsedTime = Date.now() - dataFetchStartTime.current;
        if (elapsedTime < MIN_LOADING_TIME) {
          await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
        }
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          setCaseStudy(dummyData)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching case study:', err)
        
        if (isMounted.current) {
          // Use generic data instead of just showing an error
          setCaseStudy(GENERIC_CASE_STUDY)
          setLoading(false)
        }
      }
    }

    fetchCaseStudy()
  }, [slug])

  // Optimized rendering with skeleton loading
  // Use the page title from case study data as soon as it's available
  const pageTitle = useMemo(() => {
    return loading ? 'Loading...' : (caseStudy?.name || 'Case Study');
  }, [loading, caseStudy]);
  
  return (
    <PageLayout
      style={{ minHeight: '100vh' }}
      title={pageTitle}
    >
      <FlexCol
        style={{
          maxWidth: '90%',
          alignItems: 'flex-start',
          padding: '20px 20px 20px 0',
        }}
      >
        <Link
          href='/portfolio'
          style={{
            marginBottom: '20px',
            color: '#2b6cb0',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          ← Back to Portfolio
        </Link>
        
        {loading ? (
          <CaseStudySkeleton />
        ) : error && !caseStudy ? (
          <div
            style={{
              color: 'red',
              backgroundColor: '#ffeeee',
              padding: '15px',
              border: '1px solid #ffcccc',
              borderRadius: '4px',
              width: '100%',
            }}
          >
            {error}
          </div>
        ) : (
          <CaseStudyContent caseStudy={caseStudy} />
        )}
      </FlexCol>
    </PageLayout>
  )
}

export default CaseStudyDetail
