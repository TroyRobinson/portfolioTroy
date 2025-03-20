import React, { useState, useEffect } from 'react';
import { FlexCol, FlexRow } from '../utils.jsx';
import { Tag } from '../components/Tag';
import BulkEditModal from '../components/BulkEditModal';
import NewCaseStudyModal from '../components/NewCaseStudyModal';

// Simple spinner component
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

// Sample dummy data
const SAMPLE_CASE_STUDIES = [
  {
    name: "E-Commerce Platform",
    description: "A full-featured e-commerce platform with product catalog, shopping cart, and payment processing. Implemented responsive design and user authentication.",
    technologies: "React, Node.js, Express, MongoDB, Stripe",
    date: "2023-06-15",
    createdAt: new Date("2023-06-15").getTime()
  },
  {
    name: "Health Tracking Mobile App",
    description: "A cross-platform mobile application for tracking health metrics, workouts, and nutrition. Features include data visualization and progress tracking.",
    technologies: "React Native, Firebase, Redux, Chart.js",
    date: "2023-02-22",
    createdAt: new Date("2023-02-22").getTime()
  },
  {
    name: "Enterprise CRM System",
    description: "Custom CRM system for enterprise client with lead management, customer tracking, and sales pipeline visualization.",
    technologies: "Angular, TypeScript, C#, .NET Core, SQL Server",
    date: "2022-11-10",
    createdAt: new Date("2022-11-10").getTime()
  },
  {
    name: "AI-Powered Content Generator",
    description: "Web application that generates marketing content using OpenAI's GPT API. Features include prompt management and output customization.",
    technologies: "Next.js, OpenAI API, Tailwind CSS, Vercel",
    date: "2023-09-05",
    createdAt: new Date("2023-09-05").getTime()
  },
  {
    name: "Real-time Collaboration Tool",
    description: "A document collaboration tool with real-time editing, commenting, and version history. Implemented WebSocket connections for live updates.",
    technologies: "Vue.js, Socket.io, Express, PostgreSQL",
    date: "2022-07-30",
    createdAt: new Date("2022-07-30").getTime()
  }
];

// Generate a random ID with a prefix
const generateUniqueId = (prefix = '') => {
  return `${prefix}${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
};

const PortfolioPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseStudies, setCaseStudies] = useState([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isNewCaseStudyOpen, setIsNewCaseStudyOpen] = useState(false);
  const [jsonValue, setJsonValue] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technologies: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [db, setDb] = useState(null);
  const [dummyDataLoaded, setDummyDataLoaded] = useState(false);
  const [status, setStatus] = useState('');
  const [appId, setAppId] = useState("4a592307-cbd2-44e0-8818-d863e9e95399");

  useEffect(() => {
    // Load case studies from localStorage
    const savedCaseStudies = localStorage.getItem('caseStudies');
    if (savedCaseStudies) {
      setCaseStudies(JSON.parse(savedCaseStudies));
    }
  }, []);

  const handleJsonChange = (e) => {
    setJsonValue(e.target.value);
    setJsonError('');
  };

  const handleSave = () => {
    try {
      const newCaseStudies = JSON.parse(jsonValue);
      setCaseStudies(newCaseStudies);
      localStorage.setItem('caseStudies', jsonValue);
      setIsBulkEditOpen(false);
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCaseStudy = {
      ...formData,
      technologies: formData.technologies.split(',').map(tech => tech.trim()),
      id: Date.now().toString()
    };
    setCaseStudies(prev => [...prev, newCaseStudy]);
    localStorage.setItem('caseStudies', JSON.stringify([...caseStudies, newCaseStudy]));
    setIsNewCaseStudyOpen(false);
    setFormData({
      name: '',
      description: '',
      technologies: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const addSampleData = async () => {
    if (!db) {
      console.log("Cannot add sample data: Database not initialized");
      return false;
    }
    
    try {
      setIsClearing(true);
      setStatus("Adding sample case studies...");
      console.log("Adding sample case studies...");
      
      // Add each case study one by one
      for (let i = 0; i < SAMPLE_CASE_STUDIES.length; i++) {
        const study = SAMPLE_CASE_STUDIES[i];
        setStatus(`Adding case study ${i+1}/${SAMPLE_CASE_STUDIES.length}: ${study.name}`);
        console.log(`Adding case study ${i+1}/${SAMPLE_CASE_STUDIES.length}: ${study.name}`);
        
        // Use a consistent ID based on index
        const studyId = `sample-${i}`;
        
        try {
          await db.database.transact(
            db.database.tx.caseStudies[studyId].update({
              name: study.name,
              description: study.description,
              technologies: study.technologies,
              date: study.date,
              createdAt: study.createdAt
            })
          );
          console.log(`Added: ${study.name}`);
        } catch (err) {
          console.error(`Error adding case study ${i+1}:`, err);
          setStatus(`Error adding ${study.name}`);
        }
        
        // Small delay between each add
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setStatus("Sample data added successfully!");
      console.log("Sample data added successfully");
      setDummyDataLoaded(true);
      
      // Clear status after 8 seconds
      setTimeout(() => {
        setStatus('');
      }, 8000);
      
      return true;
      
    } catch (err) {
      console.error("Error adding sample data:", err);
      setError("Error adding sample data: " + err.message);
      setStatus("Error adding sample data");
      
      // Clear status after 8 seconds
      setTimeout(() => {
        setStatus('');
      }, 8000);
      
      return false;
    } finally {
      setIsClearing(false);
    }
  };

  const deleteAllData = async (loadSampleDataAfter = false) => {
    if (!db) {
      console.log("Cannot delete data: Database not initialized");
      return;
    }
    
    try {
      setIsClearing(true);
      setError(null);
      setStatus("Starting database cleanup...");
      console.log("Starting full database cleanup...");
      
      // Function to keep deleting until no case studies remain
      const deleteUntilEmpty = async (maxAttempts = 50) => {
        let attempts = 0;
        let totalDeleted = 0;
        
        // Get fresh data
        const refreshData = () => {
          return new Promise(resolve => {
            db.database.subscribeQuery({ caseStudies: {} }, (resp) => {
              if (resp.data) {
                resolve(resp.data.caseStudies || []);
              } else {
                resolve([]);
              }
            });
          });
        };
        
        let remaining = await refreshData();
        setStatus(`Starting deletion of ${remaining.length} studies...`);
        console.log(`Starting deletion with ${remaining.length} studies`);
        
        if (remaining.length > 100) {
          setStatus(`Large dataset (${remaining.length} records) - using aggressive deletion`);
          console.log("Large dataset detected! Using aggressive deletion strategy...");
        }
        
        while (remaining.length > 0 && attempts < maxAttempts) {
          attempts++;
          setStatus(`Deletion batch ${attempts}: ${remaining.length} studies remaining...`);
          console.log(`Deletion attempt ${attempts}, ${remaining.length} studies remaining`);
          
          // Adaptive batch size - larger batches for larger datasets
          let batchSize = remaining.length > 100 ? 20 : 5;
          batchSize = Math.min(batchSize, remaining.length); // Don't exceed array length
          
          // Choose a batch of records to delete
          const batch = remaining.slice(0, batchSize);
          
          try {
            // Delete this batch
            const deleteTransactions = batch.map(study => 
              db.database.tx.caseStudies[study.id].delete()
            );
            
            await db.database.transact(...deleteTransactions);
            totalDeleted += batch.length;
            setStatus(`Deleted ${totalDeleted} of ${totalDeleted + remaining.length - batch.length} studies...`);
            console.log(`Deleted batch of ${batch.length} studies (${totalDeleted} total)`);
          } catch (err) {
            console.error("Error deleting batch:", err);
            setStatus(`Batch deletion failed - retrying one by one...`);
            
            // If batch deletion fails, try one by one
            console.log("Batch deletion failed. Trying one by one...");
            for (let i = 0; i < batch.length; i++) {
              try {
                await db.database.transact(
                  db.database.tx.caseStudies[batch[i].id].delete()
                );
                totalDeleted++;
                console.log(`Deleted individual study: ${batch[i].id}`);
              } catch (innerErr) {
                console.error(`Failed to delete individual study ${batch[i].id}:`, innerErr);
              }
              
              // Very small delay between individual deletes
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          
          // Adaptive delay - shorter for larger datasets
          const delay = remaining.length > 100 ? 200 : 400;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Get fresh data after deletion
          remaining = await refreshData();
          console.log(`After attempt ${attempts}: ${remaining.length} studies remain`);
          
          // Force re-render to show progress
          setCaseStudies(remaining);
        }
        
        if (remaining.length === 0) {
          setStatus(`All case studies deleted successfully (${totalDeleted} total)`);
          console.log(`🎉 Successfully deleted all case studies! (${totalDeleted} total)`);
          return true;
        } else {
          setStatus(`Could not delete all data - ${remaining.length} studies remain`);
          console.log(`⚠️ Couldn't delete all data after ${maxAttempts} attempts. ${remaining.length} studies remain.`);
          return false;
        }
      };
      
      const success = await deleteUntilEmpty();
      if (success) {
        setDummyDataLoaded(false);
        setCaseStudies([]);
        
        // If requested, load sample data after successful deletion
        if (loadSampleDataAfter) {
          setStatus("Deletion complete. Adding sample data...");
          console.log("Deletion successful, now adding sample data...");
          await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
          await addSampleData();
          setStatus("Process complete. Sample data added successfully!");
        } else {
          setStatus("Database cleared successfully!");
        }
      } else {
        setError("Failed to delete all case studies after multiple attempts. Try the reset button instead.");
        setStatus("Deletion failed. Some records could not be deleted.");
      }
      
    } catch (err) {
      console.error("Error in delete operation:", err);
      setError("Error deleting data: " + err.message);
      setStatus("Error occurred during deletion process.");
    } finally {
      setIsClearing(false);
      
      // Clear status after 8 seconds
      setTimeout(() => {
        setStatus('');
      }, 8000);
    }
  };

  const resetDatabase = async () => {
    try {
      setIsClearing(true);
      setError(null);
      setStatus("🔄 Creating fresh database instance...");
      console.log("🔄 RESET: Creating fresh database instance with sample data");
      
      // Reset all state
      setDb(null);
      setCaseStudies([]);
      setDummyDataLoaded(false);
      setLoading(true);
      
      // Clear any stored data
      localStorage.clear();
      console.log("Local storage cleared");
      
      // Generate a new app ID to force a completely new database instance
      // This is the key to avoiding all the previous data!
      const newAppId = generateUniqueId('portfolio-');
      setAppId(newAppId);
      console.log(`Generated new app ID: ${newAppId}`);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize the database with the new app ID
      console.log("Initializing new database...");
      
      // Declare schema
      const schema = i.schema({
        entities: {
          caseStudies: i.entity({
            name: i.string(),
            description: i.string(),
            technologies: i.string(),
            date: i.string(),
            createdAt: i.date(),
          }),
        },
      });

      // Initialize the database with new app ID
      console.log("Initializing InstantDB with appId:", newAppId);
      const database = init({ 
        appId: newAppId, 
        schema,
      });

      console.log("New database initialized");
      
      // Set the database in state
      setDb({ database, id });
      
      // Subscribe to data
      database.subscribeQuery({ caseStudies: {} }, (resp) => {
        if (resp.error) {
          console.error("Subscription error:", resp.error);
          setError(resp.error.message);
          setLoading(false);
          return;
        }
        
        if (resp.data) {
          console.log(`Data received: ${resp.data.caseStudies ? resp.data.caseStudies.length : 0} case studies`);
          const receivedCaseStudies = resp.data.caseStudies || [];
          setCaseStudies(receivedCaseStudies);
          setLoading(false);
          
          // If database is empty, add sample data
          if (receivedCaseStudies.length === 0 && !dummyDataLoaded) {
            console.log("Adding sample data to fresh database...");
            
            // Add sample data
            const addSampleData = async () => {
              for (let i = 0; i < SAMPLE_CASE_STUDIES.length; i++) {
                const study = SAMPLE_CASE_STUDIES[i];
                console.log(`Adding case study ${i+1}/${SAMPLE_CASE_STUDIES.length}: ${study.name}`);
                
                // Generate an ID based on index to ensure consistency
                const studyId = `sample-${i}`;
                
                try {
                  await database.transact(
                    database.tx.caseStudies[studyId].update({
                      name: study.name,
                      description: study.description,
                      technologies: study.technologies,
                      date: study.date,
                      createdAt: study.createdAt
                    })
                  );
                  console.log(`Added: ${study.name}`);
                } catch (err) {
                  console.error(`Error adding case study ${i+1}:`, err);
                }
                
                // Small delay between each add
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              console.log("Sample data added successfully");
              setDummyDataLoaded(true);
            };
            
            // Start adding sample data after a small delay
            setTimeout(addSampleData, 500);
          }
        }
      });
      
      console.log("Reset completed");
      
    } catch (err) {
      console.error("Error resetting database:", err);
      setError("Error resetting database: " + err.message);
      setStatus("Error resetting database.");
      setLoading(false);
    } finally {
      setIsClearing(false);
      
      // Clear status after 8 seconds
      setTimeout(() => {
        setStatus('');
      }, 8000);
    }
  };

  // Initialize InstantDB on first load
  useEffect(() => {
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

        // Declare schema
        const schema = i.schema({
          entities: {
            caseStudies: i.entity({
              name: i.string(),
              description: i.string(),
              technologies: i.string(),
              date: i.string(),
              createdAt: i.date(),
            }),
          },
        });

        // Initialize the database
        console.log("Initializing InstantDB with appId:", appId);
        const database = init({ 
          appId, 
          schema,
        });

        console.log("Database initialized");
        setDb({ database, id });
        
        console.log("Subscribing to queries...");

        // Subscribe to data
        database.subscribeQuery({ caseStudies: {} }, (resp) => {
          if (resp.error) {
            console.error("Subscription error:", resp.error);
            setError(resp.error.message);
            setLoading(false);
            return;
          }
          
          if (resp.data) {
            console.log(`Received ${resp.data.caseStudies ? resp.data.caseStudies.length : 0} case studies`);
            const receivedCaseStudies = resp.data.caseStudies || [];
            setCaseStudies(receivedCaseStudies);
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
  }, [appId]);

  return (
    <FlexCol style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <FlexRow style={{ justifyContent: 'space-between', alignItems: 'center', padding: '0 0 20px 0' }}>
        <FlexCol style={{ gap: '5px' }}>
        <h2 style={{ fontSize: '1.8rem', padding: '0' }}>Case Studies</h2>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            {loading 
              ? <><Spinner /> Loading...</>
              : `${caseStudies.length} case studies loaded`}
          </div>
          {status && (
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#4a5568', 
              backgroundColor: '#edf2f7', 
              padding: '5px 10px',
              borderRadius: '4px',
              marginTop: '5px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {isClearing && <Spinner />}
              <span>{status}</span>
            </div>
          )}
        </FlexCol>
        
        <FlexRow style={{ gap: '10px' }}>
          {db && !loading && (
            <button
              onClick={() => setIsBulkEditOpen(true)}
              disabled={isClearing}
              title="Edit case studies as JSON"
              style={{
                backgroundColor: '#805ad5',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '4px',
                border: 'none',
                cursor: isClearing ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                opacity: isClearing ? 0.7 : 1
              }}
            >
              {isClearing ? <><Spinner /> Processing...</> : '📝 Edit Bulk Data'}
            </button>
          )}
        
        <button
          onClick={() => setIsNewCaseStudyOpen(true)}
            disabled={isClearing || loading}
          style={{
            backgroundColor: '#2b6cb0',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '4px',
            border: 'none',
              cursor: (isClearing || loading) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
              fontSize: '0.9rem',
              opacity: (isClearing || loading) ? 0.7 : 1
          }}
        >
          Add New Case Study
        </button>
      </FlexRow>
      </FlexRow>
      
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffeeee', 
          padding: '10px', 
          border: '1px solid #ffcccc',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          Error: {error}
        </div>
      )}
      
      <BulkEditModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        jsonValue={jsonValue}
        onJsonChange={handleJsonChange}
        onSave={handleSave}
        isClearing={isClearing}
        jsonError={jsonError}
      />
      
      <NewCaseStudyModal
        isOpen={isNewCaseStudyOpen}
        onClose={() => setIsNewCaseStudyOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
      />
      
      {!loading && !error && caseStudies.length === 0 && (
        <div style={{ padding: '20px 0', color: '#666' }}>
          No case studies yet. Add your first one!
        </div>
      )}
      
      <FlexCol style={{ gap: '15px' }}>
        {caseStudies.map(study => (
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
          </div>
        ))}
      </FlexCol>
    </FlexCol>
  );
};

export default PortfolioPage; 