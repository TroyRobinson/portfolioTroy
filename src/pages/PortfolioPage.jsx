import React from 'react';
import { FlexCol, FlexRow } from '../utils.jsx';
import { Tag } from '../components/Tag.jsx';

const PortfolioPage = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [caseStudies, setCaseStudies] = React.useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [db, setDb] = React.useState(null);
  
  // Form state
  const [newCaseStudy, setNewCaseStudy] = React.useState({
    name: '',
    description: '',
    technologies: '',
    date: ''
  });

  // Initialize InstantDB
  React.useEffect(() => {
    const initializeDb = async () => {
      try {
        console.log("Loading InstantDB from esm.sh...");
        
        // Import the modules using esm.sh
        const instantdbModule = await import("https://esm.sh/@instantdb/core@0.17.31");
        
        if (!instantdbModule) {
          throw new Error("Failed to load InstantDB module");
        }
        
        console.log("InstantDB module loaded:", instantdbModule);
        
        // Extract the required functions
        const { init, i, id } = instantdbModule;
        
        console.log("InstantDB loaded successfully, initializing app...");

        // ID for app
        const APP_ID = "4a592307-cbd2-44e0-8818-d863e9e95399";

        // Declare schema
        const schema = i.schema({
          entities: {
            caseStudies: i.entity({
              name: i.string(),
              description: i.string(),
              technologies: i.string(), // Comma-separated tags
              date: i.string(),
              createdAt: i.date(),
            }),
          },
        });

        // Initialize the database
        console.log("Initializing InstantDB with appId:", APP_ID);
        const database = init({ 
          appId: APP_ID, 
          schema,
        });

        setDb({ database, id });
        
        console.log("Database initialized, subscribing to queries...");

        // Subscribe to data
        database.subscribeQuery({ caseStudies: {} }, (resp) => {
          if (resp.error) {
            setError(resp.error.message);
            setLoading(false);
            return;
          }
          
          if (resp.data) {
            console.log("Data received:", resp.data);
            setCaseStudies(resp.data.caseStudies || []);
            setLoading(false);
          }
        });
        
      } catch (err) {
        setError("Error initializing the application: " + err.message);
        setLoading(false);
        console.error("Full error:", err);
      }
    };

    initializeDb();
  }, []);

  // Case Studies operations
  const addCaseStudy = () => {
    if (!db) return;
    
    console.log("Adding case study:", newCaseStudy);
    db.database.transact(
      db.database.tx.caseStudies[db.id()].update({
        name: newCaseStudy.name,
        description: newCaseStudy.description,
        technologies: newCaseStudy.technologies,
        date: newCaseStudy.date,
        createdAt: Date.now(),
      })
    );

    // Reset form
    setNewCaseStudy({
      name: '',
      description: '',
      technologies: '',
      date: ''
    });
    
    // Close dialog
    setDialogOpen(false);
  };

  const deleteCaseStudy = (caseStudy) => {
    if (!db) return;
    
    console.log("Deleting case study:", caseStudy.id);
    db.database.transact(db.database.tx.caseStudies[caseStudy.id].delete());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCaseStudy(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCaseStudy.name && newCaseStudy.technologies) {
      addCaseStudy();
    }
  };

  // Sort case studies by date (newest first)
  const sortedCaseStudies = [...caseStudies].sort((a, b) => {
    // Convert dates to timestamps or use 0 if missing
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <FlexCol style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <FlexRow style={{ justifyContent: 'space-between', alignItems: 'center', padding: '0 0 20px 0' }}>
        <h2 style={{ fontSize: '1.8rem', padding: '0' }}>Case Studies</h2>
        
        <button
          onClick={() => setDialogOpen(true)}
          style={{
            backgroundColor: '#2b6cb0',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          Add New Case Study
        </button>
      </FlexRow>
      
      {dialogOpen && (
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
            
            <form onSubmit={handleSubmit}>
              <FlexCol style={{ gap: '15px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>Project Name</span>
                  <input
                    type="text"
                    name="name"
                    value={newCaseStudy.name}
                    onChange={handleInputChange}
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
                    value={newCaseStudy.description}
                    onChange={handleInputChange}
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
                    value={newCaseStudy.technologies}
                    onChange={handleInputChange}
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
                    value={newCaseStudy.date}
                    onChange={handleInputChange}
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
                    onClick={() => setDialogOpen(false)}
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
      )}
      
      {loading && (
        <div style={{ padding: '20px 0' }}>Loading case studies...</div>
      )}
      
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffeeee', 
          padding: '10px', 
          border: '1px solid #ffcccc',
          borderRadius: '4px'
        }}>
          Error: {error}
        </div>
      )}
      
      {!loading && !error && sortedCaseStudies.length === 0 && (
        <div style={{ padding: '20px 0', color: '#666' }}>
          No case studies yet. Add your first one!
        </div>
      )}
      
      <FlexCol style={{ gap: '15px' }}>
        {sortedCaseStudies.map(study => (
          <div key={study.id} style={{ 
            border: '1px solid #eee',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fafafa'
          }}>
            <FlexRow style={{ justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 0 10px 0' }}>
              <h3 style={{ fontSize: '1.3rem', padding: '0' }}>{study.name}</h3>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>{study.date}</span>
            </FlexRow>
            
            {study.description && (
              <p style={{ padding: '0 0 15px 0', lineHeight: '1.5' }}>{study.description}</p>
            )}
            
            <FlexCol style={{ padding: '0 0 15px 0' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#666', padding: '0 0 8px 0' }}>Technologies</h4>
              <FlexRow style={{ flexWrap: 'wrap', gap: '5px' }}>
                {study.technologies.split(',').map((tech, index) => (
                  <Tag key={index}>{tech.trim()}</Tag>
                ))}
              </FlexRow>
            </FlexCol>
            
            <button 
              onClick={() => deleteCaseStudy(study)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </FlexCol>
    </FlexCol>
  );
};

export default PortfolioPage; 