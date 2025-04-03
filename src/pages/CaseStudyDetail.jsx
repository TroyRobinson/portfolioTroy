import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { PageLayout } from '../components/PageLayout.jsx';
import { FlexCol, FlexRow } from '../utils.jsx';
import { Tag } from '../components/Tag.jsx';

// Simple spinner component borrowed from PortfolioPage
const Spinner = () => (
  <div style={{
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '50%',
    borderTopColor: '#333',
    animation: 'spin 1s ease-in-out infinite',
    marginRight: '8px',
    verticalAlign: 'middle'
  }}>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Generic filler data to use when no case study is found
const GENERIC_CASE_STUDY = {
  name: 'Case Study Not Found',
  description: 'Sorry, we couldn\'t find the case study you\'re looking for. This might be because the URL is incorrect or the case study has been removed.',
  technologies: 'React, Wouter, JavaScript',
  date: new Date().toISOString().split('T')[0]
};

const CaseStudyDetail = ({ slug }) => {
  const [loading, setLoading] = useState(true);
  const [caseStudy, setCaseStudy] = useState(null);
  const [error, setError] = useState(null);

  // In a real implementation, this would fetch data from your database
  // For now, we'll simulate loading case study data
  useEffect(() => {
    if (!slug) {
      // Use generic data instead of just showing an error
      setCaseStudy(GENERIC_CASE_STUDY);
      setLoading(false);
      return;
    }
    
    // Simulate API call to fetch the case study by slug
    const fetchCaseStudy = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would do something like:
        // const response = await db.getCaseStudyBySlug(slug);
        
        // For now, let's simulate a delay and return dummy data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For now we'll just use the slug as the case study name
        // In a real app, you would check if the case study exists
        // and use generic data if it doesn't
        const dummyData = {
          name: slug.replace(/-/g, ' '),
          description: 'This is a case study detail page. In a real implementation, this content would be fetched from your database.',
          technologies: 'React, Wouter, JavaScript',
          date: new Date().toISOString().split('T')[0]
        };
        
        setCaseStudy(dummyData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching case study:', err);
        // Use generic data instead of just showing an error
        setCaseStudy(GENERIC_CASE_STUDY);
        setLoading(false);
      }
    };

    fetchCaseStudy();
  }, [slug]);

  return (
    <PageLayout 
      style={{ minHeight: '100vh' }}
      title={caseStudy ? caseStudy.name : 'Loading Case Study...'}
    >
      <FlexCol style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <Link href="/portfolio" style={{ 
          marginBottom: '20px', 
          color: '#2b6cb0', 
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center'
        }}>
          ← Back to Portfolio
        </Link>
        
        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Spinner /> Loading...
          </div>
        )}
        
        {error && !caseStudy && (
          <div style={{ 
            color: 'red', 
            backgroundColor: '#ffeeee', 
            padding: '15px', 
            border: '1px solid #ffcccc',
            borderRadius: '4px' 
          }}>
            {error}
          </div>
        )}
        
        {!loading && caseStudy && (
          <FlexCol style={{ gap: '20px' }}>
            <FlexRow style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ color: '#666' }}>{caseStudy.date}</span>
            </FlexRow>
            
            <p style={{ lineHeight: '1.6' }}>{caseStudy.description}</p>
            
            <FlexCol style={{ gap: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#555' }}>Technologies</h3>
              <FlexRow style={{ flexWrap: 'wrap', gap: '8px' }}>
                {caseStudy.technologies.split(',').map((tech, index) => (
                  <Tag key={index}>{tech.trim()}</Tag>
                ))}
              </FlexRow>
            </FlexCol>
            
            {/* Additional case study content would go here */}
            
            {caseStudy === GENERIC_CASE_STUDY && (
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ fontSize: '1.1rem', color: '#555', marginBottom: '10px' }}>
                  Looking for case studies?
                </h3>
                <p style={{ marginBottom: '15px' }}>
                  Check out our portfolio to browse all available case studies.
                </p>
                <Link href="/portfolio" style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#2b6cb0',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}>
                  View Portfolio
                </Link>
              </div>
            )}
          </FlexCol>
        )}
      </FlexCol>
    </PageLayout>
  );
};

export default CaseStudyDetail; 