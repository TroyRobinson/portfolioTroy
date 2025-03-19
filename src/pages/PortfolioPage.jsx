import React from 'react';
import { FlexCol, FlexRow } from '../utils.jsx';
import { Tag } from '../components/Tag.jsx';

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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [caseStudies, setCaseStudies] = React.useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [bulkEditOpen, setBulkEditOpen] = React.useState(false);
  const [bulkEditJson, setBulkEditJson] = React.useState('');
  const [jsonError, setJsonError] = React.useState(null);
  const [db, setDb] = React.useState(null);
  const [dummyDataLoaded, setDummyDataLoaded] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);
  const [status, setStatus] = React.useState('');
  // Store app ID in state so we can generate a new one when resetting
  const [appId, setAppId] = React.useState("4a592307-cbd2-44e0-8818-d863e9e95399");
  
  // Form state
  const [newCaseStudy, setNewCaseStudy] = React.useState({
    name: '',
    description: '',
    technologies: '',
    date: ''
  });

  // Function to add sample data
  const addSampleData = React.useCallback(async () => {
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
  }, [db]);

  // Function to continuously delete all data until none remains
  const deleteAllData = React.useCallback(async (loadSampleDataAfter = false) => {
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
  }, [db, addSampleData]);

  // Function to completely reset the database with fresh sample data
  const resetDatabase = React.useCallback(async () => {
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
  }, [dummyDataLoaded]);

  // Initialize InstantDB on first load
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

  // Sort case studies by createdAt (newest first)
  const sortedCaseStudies = [...caseStudies].sort((a, b) => {
    // Use createdAt for sorting, with fallback to date if createdAt is missing
    const timeA = a.createdAt || (a.date ? new Date(a.date).getTime() : 0);
    const timeB = b.createdAt || (b.date ? new Date(b.date).getTime() : 0);
    return timeA - timeB; // Sort in ascending order (oldest first) to match JSON order
  });

  // Function to open the bulk edit modal
  const openBulkEdit = () => {
    // Start with the sample data if no case studies exist
    const dataToEdit = caseStudies.length > 0 
      ? caseStudies.map(({ id, ...rest }) => rest) // Remove DB IDs
      : SAMPLE_CASE_STUDIES;
    
    // Convert to formatted JSON string
    const jsonString = JSON.stringify(dataToEdit, null, 2);
    setBulkEditJson(jsonString);
    setJsonError(null);
    setBulkEditOpen(true);
  };

  // Function to validate the JSON input
  const validateJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      if (!Array.isArray(parsed)) {
        return { valid: false, error: "JSON must be an array of case studies" };
      }
      
      // Check if each item has the required fields
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (!item.name) {
          return { valid: false, error: `Item at index ${i} is missing the required 'name' field` };
        }
        if (!item.technologies) {
          return { valid: false, error: `Item at index ${i} is missing the required 'technologies' field` };
        }
      }
      
      return { valid: true, data: parsed };
    } catch (err) {
      return { valid: false, error: `Invalid JSON: ${err.message}` };
    }
  };

  // Function to sync the database with the edited JSON
  const syncWithEditedJson = async (jsonString) => {
    if (!db) {
      setError("Database not initialized");
      return false;
    }
    
    // Validate the JSON
    const validation = validateJson(jsonString);
    if (!validation.valid) {
      setJsonError(validation.error);
      return false;
    }
    
    setJsonError(null);
    setIsClearing(true);
    setStatus("Syncing database with edited JSON...");
    
    try {
      // Delete all existing case studies
      const deleteAll = async () => {
        // Get all case studies
        const allStudies = await new Promise(resolve => {
          db.database.subscribeQuery({ caseStudies: {} }, (resp) => {
            if (resp.data) {
              resolve(resp.data.caseStudies || []);
            } else {
              resolve([]);
            }
          });
        });
        
        if (allStudies.length > 0) {
          setStatus(`Clearing ${allStudies.length} existing case studies...`);
          
          // Delete one at a time to avoid transaction validation issues
          for (let i = 0; i < allStudies.length; i++) {
            const study = allStudies[i];
            try {
              await db.database.transact(
                db.database.tx.caseStudies[study.id].delete()
              );
              setStatus(`Deleted ${i + 1} of ${allStudies.length} case studies...`);
            } catch (err) {
              console.error(`Error deleting study ${study.id}:`, err);
              // Continue with next study even if one fails
            }
            
            // Reduced delay between deletes (from 100ms to 50ms)
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        return true;
      };
      
      // Delete all existing data
      await deleteAll();
      
      // Add the new case studies from the JSON
      const newStudies = validation.data;
      setStatus(`Adding ${newStudies.length} case studies from edited JSON...`);
      
      // Process each study one at a time, exactly matching addCaseStudy's pattern
      for (let i = 0; i < newStudies.length; i++) {
        const study = newStudies[i];
        
        try {
          // Use db.id() exactly as done in addCaseStudy
          // Set createdAt to a timestamp that preserves the order from the JSON
          // Using a base timestamp and adding the index to maintain order
          const baseTimestamp = Date.now();
          const orderPreservingTimestamp = baseTimestamp - (newStudies.length - i) * 1000;
          
          await db.database.transact(
            db.database.tx.caseStudies[db.id()].update({
              name: study.name,
              description: study.description || '',
              technologies: study.technologies,
              date: study.date || new Date().toISOString().split('T')[0],
              createdAt: orderPreservingTimestamp,
            })
          );
          
          setStatus(`Added ${i+1} of ${newStudies.length} case studies...`);
        } catch (err) {
          console.error(`Error adding study ${i+1}:`, err);
          setError(`Error adding study ${i+1}: ${err.message}`);
          
          // Log more details about the study causing the error
          console.error("Study data causing error:", study);
        }
        
        // Reduced delay between adds (from 300ms to 100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setStatus("Database successfully synchronized with edited JSON!");
      setTimeout(() => setStatus(''), 5000);
      
      return true;
    } catch (err) {
      console.error("Error syncing with edited JSON:", err);
      setError(`Error syncing with edited JSON: ${err.message}`);
      setStatus("Error occurred during database sync.");
      setTimeout(() => setStatus(''), 5000);
      
      return false;
    } finally {
      setIsClearing(false);
      setBulkEditOpen(false);
    }
  };

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
              onClick={openBulkEdit}
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
          onClick={() => setDialogOpen(true)}
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
      
      {/* Bulk Edit Modal */}
      {bulkEditOpen && (
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
            maxWidth: '800px',
            padding: '20px',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '0 0 10px 0' }}>
              Edit Case Studies JSON
            </h3>
            
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
              Edit the JSON directly to add, remove, or modify case studies. Each case study requires at minimum a 'name' and 'technologies' field.
            </p>
            
            {jsonError && (
              <div style={{ 
                color: 'red', 
                backgroundColor: '#ffeeee', 
                padding: '10px', 
                border: '1px solid #ffcccc',
                borderRadius: '4px',
                marginBottom: '10px',
                fontSize: '0.9rem'
              }}>
                {jsonError}
              </div>
            )}
            
            <textarea
              value={bulkEditJson}
              onChange={(e) => setBulkEditJson(e.target.value)}
              style={{
                width: '100%',
                height: '400px',
                padding: '10px',
                fontFamily: 'monospace',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
            
            <FlexRow style={{ justifyContent: 'flex-end', gap: '10px', padding: '15px 0 0 0' }}>
              <button 
                onClick={() => setBulkEditOpen(false)}
                disabled={isClearing}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isClearing ? 'not-allowed' : 'pointer',
                  opacity: isClearing ? 0.7 : 1
                }}
              >
                Cancel
              </button>
              
              <button 
                onClick={() => syncWithEditedJson(bulkEditJson)}
                disabled={isClearing}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#805ad5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isClearing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isClearing ? 0.7 : 1
                }}
              >
                {isClearing ? <><Spinner /> Syncing...</> : 'Save & Sync Database'}
              </button>
            </FlexRow>
          </div>
        </div>
      )}
      
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