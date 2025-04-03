const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const COMPONENTS_DIR = path.resolve(SRC_DIR, './components');
const STORYBOARD_PATH = path.resolve(__dirname, '../utopia/storyboard.js');
const COMPONENT_EXTENSIONS = ['.jsx', '.js', '.tsx', '.ts'];

// Files to ignore - can be exact names or patterns (as strings)
const IGNORED_FILES = [
  'index', // Ignore files named index.js, index.jsx, etc.
  'utils', // Ignore utility files
  'router', // Ignore router files
  'spec', // Ignore spec files
  'mock', // Ignore mock files
  'helpers', // Ignore helper files
  'constants', // Ignore constant files
  'types', // Ignore type definition files
];

// Flag to enable auto-sizing for components
const AUTO_SIZE_COMPONENTS = true;

// Vertical layout settings for components
const VERTICAL_LAYOUT = true;
const VERTICAL_SPACING = 60; // Space between vertically stacked components
const HORIZONTAL_COLUMN_SPACING = 300; // Space between component columns
const SUB_FOLDER_COLUMN_LEFT = 600; // Left position for the first subfolder column

// File patterns that should be included even if they match ignore patterns
const FORCE_INCLUDE = [
  // Add specific files to always include here if needed
  // Example: 'SpecialComponent', 'ImportantUtil'
];

// Add a function to analyze component file and extract dimensions
function extractComponentDimensions(componentPath) {
  try {
    const content = fs.readFileSync(componentPath, 'utf-8');
    
    // Default size if we can't determine
    const defaultSize = { width: 700, height: 700 };
    
    // Look for direct size specifications in inline styles
    let width, height;
    
    // Match width and height in style object
    const styleMatch = content.match(/style={?{[^}]*width:\s*['"]?([^'",}]+)['"]?[^}]*height:\s*['"]?([^'",}]+)['"]?/);
    if (styleMatch) {
      width = parseStyleValue(styleMatch[1]);
      height = parseStyleValue(styleMatch[2]);
    }
    
    // If not found, try to match dimensions in separate style properties
    if (!width || !height) {
      const widthMatch = content.match(/width:\s*['"]?([^'",}]+)['"]?/);
      const heightMatch = content.match(/height:\s*['"]?([^'",}]+)['"]?/);
      
      if (widthMatch) width = parseStyleValue(widthMatch[1]);
      if (heightMatch) height = parseStyleValue(heightMatch[1]);
    }
    
    // If we found valid dimensions, return them
    if (width && height && isNumber(width) && isNumber(height)) {
      console.log(`Extracted dimensions for ${path.basename(componentPath)}: ${width}x${height}`);
      return { width, height };
    }
    
    // Check for max content or fixed sizing
    const isFixedHeight = content.includes('height: \'100%\'') || 
                          content.includes('height: "100%"') ||
                          content.includes('height: 100%');
    
    const isFixedWidth = content.includes('width: \'100%\'') || 
                         content.includes('width: "100%"') ||
                         content.includes('width: 100%');
    
    // Look for specific component types to make good default sizing guesses
    const isButton = content.includes('<button') || content.includes('role="button"');
    const isTag = content.includes('tag') || content.includes('Tag') || content.includes('badge') || content.includes('Badge');
    const isNav = content.includes('nav') || content.includes('Nav') || content.includes('header') || content.includes('Header');
    const isCard = content.includes('card') || content.includes('Card');
    const isLayout = content.includes('Layout') || content.includes('Container') || content.includes('Page');
    
    // Assign reasonable defaults based on component type
    if (isButton) {
      return { width: 120, height: 40 };
    } else if (isTag) {
      return { width: 110, height: 44 };
    } else if (isNav) {
      return { width: 800, height: 80 };
    } else if (isCard) {
      return { width: 350, height: 400 };
    } else if (isLayout) {
      return { width: 800, height: 600 };
    } else if (isFixedWidth && isFixedHeight) {
      // If component uses 100% width and height, probably meant to fill parent
      return defaultSize;
    }
    
    return defaultSize;
  } catch (error) {
    console.log(`Error extracting dimensions from ${componentPath}: ${error.message}`);
    return { width: 700, height: 700 };
  }
}

// Helper function to parse style value to number
function parseStyleValue(value) {
  if (!value) return null;
  
  // Remove quotes and handle px values
  value = value.trim().replace(/['"]/g, '');
  
  // If it's a px value, extract the number
  if (value.endsWith('px')) {
    return parseInt(value.slice(0, -2), 10);
  }
  
  // If it's a number as string, convert to number
  if (!isNaN(value)) {
    return parseInt(value, 10);
  }
  
  return null;
}

// Helper function to check if a value is a number
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

// Scan for React components in a directory
function scanForComponents(dir) {
  const components = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively scan subdirectories
      components.push(...scanForComponents(filePath));
    } else if (COMPONENT_EXTENSIONS.includes(path.extname(file))) {
      // Check if this is an ignored file
      const baseName = path.basename(file, path.extname(file));
      const fullPath = path.relative(SRC_DIR, filePath);
      
      // Skip if the file matches any ignore pattern and doesn't match any force include pattern
      if (
        (IGNORED_FILES.some(pattern => baseName.toLowerCase().includes(pattern.toLowerCase())) || 
         IGNORED_FILES.some(pattern => fullPath.toLowerCase().includes(pattern.toLowerCase()))) &&
        !FORCE_INCLUDE.some(pattern => baseName.toLowerCase().includes(pattern.toLowerCase()))
      ) {
        console.log(`Skipping ignored file: ${file}`);
        return;
      }
      
      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Simple regex to detect exported React components
      const exportRegex = /export\s+(var|const|let|function|class)\s+(\w+)(?:\s*=\s*(?:\(([^)]*)\)|function\s*\(([^)]*)\))?)?/g;
      // Regex to detect default exports
      const defaultExportRegex = /export\s+default\s+(\w+)/g;
      // Regex to detect component declarations
      const componentDeclarationRegex = /(var|const|let|function|class)\s+(\w+)(?:\s*=\s*(?:\(([^)]*)\)|function\s*\(([^)]*)\))?)?/g;
      
      let match;
      let defaultExportName = null;
      
      // Check for default exports first
      while ((match = defaultExportRegex.exec(content)) !== null) {
        defaultExportName = match[1];
      }
      
      // Add more patterns for React component detection
      const isReactComponent = (content, componentName) => {
        // Check for JSX usage, React imports, or other React patterns
        const hasJSX = content.includes('<') && content.includes('/>') || content.includes('</');
        const hasReactImport = content.includes('import React') || content.includes('import * as React');
        const isExtendingReactComponent = content.includes(`extends React.Component`) || content.includes(`extends Component`);
        const usesReactHooks = content.includes('useState') || content.includes('useEffect') || content.includes('useContext');
        const returnsJSX = new RegExp(`(return|=>)\\s*\\(\\s*<`, 'g').test(content);
        
        // If the component has a capital first letter and meets any React criteria, consider it a React component
        return (
          componentName[0] === componentName[0].toUpperCase() && 
          (hasJSX || hasReactImport || isExtendingReactComponent || usesReactHooks || returnsJSX)
        );
      };

      // Process named exports
      while ((match = exportRegex.exec(content)) !== null) {
        const componentName = match[2];
        
        // Use the enhanced React component detection
        if (isReactComponent(content, componentName)) {
          // Check if component accepts style prop
          const params = match[3] || match[4] || '';
          
          // Check for style prop in different forms:
          // 1. Direct style param: ({ style }) or (style)
          // 2. Destructured style: ({ style, otherProps })
          // 3. Props object that might contain style: (props) or ({ ...props })
          const hasStyleProp = 
            params.includes('style') || 
            params.includes('props') || 
            params.includes('...') || 
            params.match(/{\s*[^}]*\s*}/); // Destructuring pattern
          
          // Extract dimensions if this is a component in the components directory
          let componentDimensions = null;
          if (AUTO_SIZE_COMPONENTS && filePath.includes(path.sep + 'components' + path.sep)) {
            componentDimensions = extractComponentDimensions(filePath);
          }
          
          // Determine component type based on its path
          let componentType = 'page'; // Default type
          let subFolder = '';
          
          if (fullPath.includes('components/')) {
            // It's a component - check for subfolder
            componentType = 'component';
            
            // Extract the subfolder if any
            const pathAfterComponents = fullPath.split('components/')[1];
            if (pathAfterComponents.includes('/')) {
              subFolder = pathAfterComponents.split('/')[0];
              componentType = 'subfolder-component';
            }
          }
          
          components.push({
            name: componentName,
            path: path.relative(SRC_DIR, filePath).replace(/\\/g, '/'),
            fullPath: filePath,
            hasStyleProp,
            dimensions: componentDimensions,
            type: componentType,
            subFolder
          });
        }
      }
      
      // Process default exports if they reference a named component
      if (defaultExportName) {
        // Reset componentDeclarationRegex to start from beginning
        componentDeclarationRegex.lastIndex = 0;
        
        // Find the component declaration for the default export
        while ((match = componentDeclarationRegex.exec(content)) !== null) {
          const componentName = match[2];
          
          if (componentName === defaultExportName && isReactComponent(content, componentName)) {
            // Check if component accepts style prop
            const params = match[3] || match[4] || '';
            
            const hasStyleProp = 
              params.includes('style') || 
              params.includes('props') || 
              params.includes('...') || 
              params.match(/{\s*[^}]*\s*}/); // Destructuring pattern
            
            // Avoid duplicates if the component was already added via named export
            if (!components.some(c => c.name === componentName)) {
              // Extract dimensions if this is a component in the components directory
              let componentDimensions = null;
              if (AUTO_SIZE_COMPONENTS && filePath.includes(path.sep + 'components' + path.sep)) {
                componentDimensions = extractComponentDimensions(filePath);
              }
              
              // Determine component type based on its path
              let componentType = 'page'; // Default type
              let subFolder = '';
              
              if (fullPath.includes('components/')) {
                // It's a component - check for subfolder
                componentType = 'component';
                
                // Extract the subfolder if any
                const pathAfterComponents = fullPath.split('components/')[1];
                if (pathAfterComponents.includes('/')) {
                  subFolder = pathAfterComponents.split('/')[0];
                  componentType = 'subfolder-component';
                }
              }
              
              components.push({
                name: componentName,
                path: path.relative(SRC_DIR, filePath).replace(/\\/g, '/'),
                fullPath: filePath,
                hasStyleProp,
                dimensions: componentDimensions,
                type: componentType,
                subFolder
              });
            }
          }
        }
      }
    }
  });
  
  return components;
}

// Generate storyboard content
function generateStoryboard(components, existingScenes = null) {
  // Start with imports
  let imports = `import * as React from 'react'\nimport { Scene, Storyboard } from 'utopia-api'\n`;
  
  // Add component imports
  const importedComponents = new Set();
  components.forEach(component => {
    if (!importedComponents.has(component.name)) {
      // Create the import path with correct extension
      const importPath = component.path;
      const fileExt = path.extname(importPath);
      const importPathWithoutExt = importPath.replace(fileExt, '');
      
      // Read file content to check if it's a default export or named export
      const filePath = path.join(SRC_DIR, importPath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const isDefaultExport = content.includes(`export default ${component.name}`);
      
      // Use relative path from utopia directory to src directory
      if (isDefaultExport) {
        imports += `import ${component.name} from '../src/${importPathWithoutExt}'\n`;
      } else {
        imports += `import { ${component.name} } from '../src/${importPathWithoutExt}'\n`;
      }
      importedComponents.add(component.name);
    }
  });
  
  // Start storyboard content
  let content = `\nexport var storyboard = (\n  <Storyboard>\n`;
  
  // Calculate placement for new scenes
  const usedPositions = new Set();
  const defaultSceneWidth = 700;
  const defaultSceneSpacing = 816; // Space between scenes (matched to example spacing)
  const defaultTop = 128;
  
  // Track components we've already added
  const addedComponents = new Set();
  
  // Track scene configurations that we're building
  const sceneConfigurations = {};
  
  // First, add scenes for components with existing configurations
  if (existingScenes) {
    components.forEach(component => {
      const sceneId = `${component.name.toLowerCase()}-scene`;
      if (existingScenes[sceneId]) {
        const sceneConfig = { ...existingScenes[sceneId] };
        sceneConfigurations[sceneId] = sceneConfig;
        addedComponents.add(component.name);
        usedPositions.add(sceneConfig.left);
      }
    });
  }
  
  // Now handle components without existing scenes
  // First, determine the furthest right position
  let furthestRightPosition = 0;
  if (usedPositions.size > 0) {
    furthestRightPosition = Math.max(...usedPositions);
  }
  
  // Add original positions for standard components if they don't exist yet
  const componentsToAdd = components.filter(component => !addedComponents.has(component.name));
  
  // First add Playground and App if they exist and don't have scenes yet
  componentsToAdd.forEach(component => {
    const sceneId = `${component.name.toLowerCase()}-scene`;
    if (component.name === 'Playground' && !addedComponents.has('Playground')) {
      sceneConfigurations[sceneId] = {
        width: 700,
        height: 759,
        left: 212,
        top: defaultTop,
        label: 'Playground',
        component
      };
      addedComponents.add('Playground');
      usedPositions.add(212);
      furthestRightPosition = Math.max(furthestRightPosition, 212);
    } else if (component.name === 'App' && !addedComponents.has('App')) {
      sceneConfigurations[sceneId] = {
        width: 744,
        height: 1133,
        left: 992,
        top: defaultTop,
        label: 'My App',
        component
      };
      addedComponents.add('App');
      usedPositions.add(992);
      furthestRightPosition = Math.max(furthestRightPosition, 992);
    }
  });
  
  // Group components by type and subfolder
  const regularComponents = componentsToAdd.filter(c => c.type === 'component' && !addedComponents.has(c.name));
  const subfolderComponents = componentsToAdd.filter(c => c.type === 'subfolder-component' && !addedComponents.has(c.name));
  
  // Organize subfolders
  const subfolderGroups = {};
  subfolderComponents.forEach(component => {
    if (!subfolderGroups[component.subFolder]) {
      subfolderGroups[component.subFolder] = [];
    }
    subfolderGroups[component.subFolder].push(component);
  });
  
  // Other pages/non-categorized components
  const otherComponents = componentsToAdd.filter(c => 
    c.type === 'page' && 
    c.name !== 'Playground' && 
    c.name !== 'App' && 
    !addedComponents.has(c.name)
  );
  
  // Set up positions for horizontal layout (for pages/screens)
  let nextHorizontalPosition = furthestRightPosition + defaultSceneSpacing;
  
  // Set up positions for vertical layouts
  // Column 1: Regular components (directly in components folder)
  const componentColumnLeft = 212;
  let componentColumnTop = 1200; // Start position below the horizontal row
  
  // For subfolder columns, we'll position them to the right of the pages
  let currentSubfolderColumnIndex = 0;
  const subfolderColumns = {};
  
  // Find gaps in horizontal layout for pages/screens
  let availableGaps = [];
  if (usedPositions.size > 1) {
    // Convert positions to sorted array
    const positionsArray = Array.from(usedPositions).sort((a, b) => a - b);
    
    // Find gaps large enough to fit a scene with proper spacing
    for (let i = 0; i < positionsArray.length - 1; i++) {
      const startPos = positionsArray[i];
      const endPos = positionsArray[i+1];
      const gap = endPos - startPos;
      
      // If gap is large enough to fit a scene (minimum defaultSceneSpacing)
      if (gap >= defaultSceneSpacing) {
        // Calculate how many scenes could fit in this gap
        const scenesFit = Math.floor(gap / defaultSceneSpacing);
        
        // For each possible position in the gap
        for (let j = 0; j < scenesFit; j++) {
          const gapPosition = startPos + defaultSceneSpacing * (j + 1);
          // Ensure we're not too close to the end scene
          if (gapPosition + defaultSceneWidth + 20 <= endPos) {  // 20px buffer
            availableGaps.push({
              position: gapPosition,
              size: gap
            });
          }
        }
      }
    }
    
    console.log(`Found ${availableGaps.length} gaps between existing scenes`);
  }
  
  // Add other (page) components horizontally
  otherComponents.forEach(component => {
    if (!addedComponents.has(component.name)) {
      const sceneId = `${component.name.toLowerCase()}-scene`;
      
      // Determine width and height - use component dimensions if available
      let width = defaultSceneWidth;
      let height = 700;
      
      if (component.dimensions) {
        width = component.dimensions.width;
        height = component.dimensions.height;
      }
      
      // If we have available gaps, use the first one
      if (availableGaps.length > 0) {
        const gap = availableGaps.shift(); // Take the first available gap
        
        sceneConfigurations[sceneId] = {
          width: width,
          height: height,
          left: gap.position,
          top: defaultTop,
          label: component.name,
          component
        };
        
        addedComponents.add(component.name);
        console.log(`Added new scene for ${component.name} at position ${gap.position} (in a gap)`);
      } else {
        // No gaps available, place at the end
        sceneConfigurations[sceneId] = {
          width: width,
          height: height,
          left: nextHorizontalPosition,
          top: defaultTop,
          label: component.name,
          component
        };
        
        addedComponents.add(component.name);
        nextHorizontalPosition += defaultSceneSpacing;
        console.log(`Added new scene for ${component.name} at position ${nextHorizontalPosition - defaultSceneSpacing} (at the end)`);
      }
    }
  });

  // Add regular components (from /components/) in a vertical column
  regularComponents.forEach(component => {
    if (!addedComponents.has(component.name)) {
      const sceneId = `${component.name.toLowerCase()}-scene`;
      
      // Determine width and height - use component dimensions if available
      let width = defaultSceneWidth;
      let height = 700;
      
      if (component.dimensions) {
        width = component.dimensions.width;
        height = component.dimensions.height;
      }
      
      sceneConfigurations[sceneId] = {
        width: width,
        height: height,
        left: componentColumnLeft,
        top: componentColumnTop,
        label: component.name,
        component
      };
      
      addedComponents.add(component.name);
      componentColumnTop += height + VERTICAL_SPACING;
      console.log(`Added component ${component.name} to vertical column at position ${componentColumnLeft},${componentColumnTop - height - VERTICAL_SPACING}`);
    }
  });
  
  // Add subfolder components in separate columns
  Object.entries(subfolderGroups).forEach(([folder, folderComponents], folderIndex) => {
    // Calculate column position - fixed position rather than extending from pages
    const columnLeft = SUB_FOLDER_COLUMN_LEFT + (folderIndex * HORIZONTAL_COLUMN_SPACING);
    let columnTop = 1200; // Start below the pages row
    
    console.log(`Creating column for ${folder} components at position ${columnLeft}`);
    
    folderComponents.forEach(component => {
      if (!addedComponents.has(component.name)) {
        const sceneId = `${component.name.toLowerCase()}-scene`;
        
        // Determine width and height - use component dimensions if available
        let width = defaultSceneWidth;
        let height = 700;
        
        if (component.dimensions) {
          width = component.dimensions.width;
          height = component.dimensions.height;
        }
        
        sceneConfigurations[sceneId] = {
          width: width,
          height: height,
          left: columnLeft,
          top: columnTop,
          label: `${component.name} (${folder})`,
          component
        };
        
        addedComponents.add(component.name);
        columnTop += height + VERTICAL_SPACING;
        console.log(`Added ${folder} component ${component.name} to vertical column at position ${columnLeft},${columnTop - height - VERTICAL_SPACING}`);
      }
    });
    
    currentSubfolderColumnIndex++;
  });
  
  // Now rearrange scenes to close any gaps in the horizontal layout (only for pages)
  // First, add the component reference to existing scenes
  if (existingScenes) {
    Object.keys(sceneConfigurations).forEach(sceneId => {
      const config = sceneConfigurations[sceneId];
      if (config && !config.component) {
        // Find the component for this scene
        const componentName = config.componentName || sceneId.replace(/-scene$/, '');
        const component = components.find(c => 
          c.name.toLowerCase() === componentName.toLowerCase() || 
          sceneId === `${c.name.toLowerCase()}-scene`
        );
        if (component) {
          config.component = component;
        }
      }
    });
  }
  
  // Only reorganize the horizontal row of pages
  const reorganizedScenes = reorganizeScenes(sceneConfigurations, defaultSceneSpacing);
  
  // Now add all scenes to the content in the reorganized positions
  Object.entries(reorganizedScenes).forEach(([sceneId, config]) => {
    if (config.component) {
      addComponentScene(config.component, sceneId, config);
      
      if (existingScenes && existingScenes[sceneId]) {
        if (config.left !== existingScenes[sceneId].left || config.top !== existingScenes[sceneId].top) {
          console.log(`Relocated scene ${sceneId} from position (${existingScenes[sceneId].left},${existingScenes[sceneId].top}) to (${config.left},${config.top})`);
        } else {
          console.log(`Using existing configuration for ${sceneId}`);
        }
      }
    }
  });
  
  // Helper function to add a component scene to the content
  function addComponentScene(component, sceneId, sceneConfig) {
    content += `    <Scene\n`;
    content += `      id='${sceneId}'\n`;
    content += `      commentId='${sceneId}'\n`;
    content += `      style={{\n`;
    content += `        width: ${sceneConfig.width},\n`;
    content += `        height: ${sceneConfig.height},\n`;
    content += `        position: 'absolute',\n`;
    content += `        left: ${sceneConfig.left},\n`;
    content += `        top: ${sceneConfig.top},\n`;
    content += `      }}\n`;
    content += `      data-label='${sceneConfig.label}'\n`;
    content += `    >\n`;
    
    // Add style prop directly if component accepts it
    if (component.hasStyleProp) {
      content += `      <${component.name} style={{}} />\n`;
    } else {
      content += `      <${component.name} />\n`;
    }
    
    content += `    </Scene>\n`;
  }
  
  // Close storyboard
  content += `  </Storyboard>\n)\n`;
  
  return imports + content;
}

// Function to reorganize scenes to close gaps between them
function reorganizeScenes(sceneConfigurations, defaultSpacing) {
  // Clone the configurations to avoid modifying the original
  const reorganized = JSON.parse(JSON.stringify(sceneConfigurations));
  
  // Special handling for Playground and App - they should keep their original positions
  const hasPlayground = Object.values(reorganized).some(config => 
    config.label === 'Playground' || (config.component && config.component.name === 'Playground')
  );
  
  const hasApp = Object.values(reorganized).some(config => 
    config.label === 'My App' || config.label === 'App' || 
    (config.component && config.component.name === 'App')
  );
  
  // Extract scene IDs and positions, so we can sort them by position
  const scenes = Object.entries(reorganized).map(([id, config]) => ({
    id,
    left: config.left,
    top: config.top,
    config,
    originalLeft: config.left, // Save original position for comparison
    // Only reorganize scenes in the top row (pages)
    isInTopRow: config.top === 128 || (config.component && config.component.type === 'page')
  }));
  
  // Get only the scenes in the top row for reorganization
  const topRowScenes = scenes.filter(scene => scene.isInTopRow);
  
  // Sort scenes by left position (ascending)
  topRowScenes.sort((a, b) => a.left - b.left);
  
  // Keep track of position shifts
  let positionShifts = 0;
  
  // Start with the leftmost position based on whether we have Playground or App
  let currentPosition = 212; // Default start position
  if (hasPlayground) {
    // Find the Playground scene and set its position
    const playgroundScene = topRowScenes.find(scene => 
      scene.config.label === 'Playground' || 
      (scene.config.component && scene.config.component.name === 'Playground')
    );
    
    if (playgroundScene) {
      playgroundScene.config.left = 212;
      currentPosition = 212 + defaultSpacing; // Next position
    }
  }
  
  // If we have App, handle it separately
  if (hasApp) {
    // Find the App scene
    const appScene = topRowScenes.find(scene => 
      scene.config.label === 'My App' || scene.config.label === 'App' || 
      (scene.config.component && scene.config.component.name === 'App')
    );
    
    if (appScene) {
      // If Playground exists, App should be at 992, otherwise at 212
      if (hasPlayground) {
        appScene.config.left = 992;
        currentPosition = 992 + defaultSpacing; // Next position
      } else {
        appScene.config.left = 212;
        currentPosition = 212 + defaultSpacing; // Next position
      }
    }
  }
  
  // Now place all other scenes in the top row in sequence with proper spacing
  topRowScenes.forEach((scene) => {
    // Skip Playground and App as we've already positioned them
    const isPlayground = scene.config.label === 'Playground' || 
                         (scene.config.component && scene.config.component.name === 'Playground');
    
    const isApp = scene.config.label === 'My App' || scene.config.label === 'App' || 
                  (scene.config.component && scene.config.component.name === 'App');
    
    if (!isPlayground && !isApp) {
      // If this scene would be positioned differently, track the shift
      if (scene.config.left !== currentPosition) {
        positionShifts++;
        console.log(`Repositioning scene ${scene.id} from ${scene.originalLeft} to ${currentPosition}`);
      }
      
      // Position this scene at the current position
      scene.config.left = currentPosition;
      
      // Move to the next position
      currentPosition += defaultSpacing;
    }
  });
  
  // Log the number of scenes that were repositioned
  if (positionShifts > 0) {
    console.log(`Repositioned ${positionShifts} scenes to close gaps`);
  } else {
    console.log('No scene repositioning needed - layout already optimal');
  }
  
  // Update the original configurations with the repositioned ones
  topRowScenes.forEach(scene => {
    reorganized[scene.id] = scene.config;
  });
  
  return reorganized;
}

// Main function
function updateStoryboard() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let includeUtils = false;
  let includeIndex = false;
  let verbose = false;
  let preserveExisting = true; // Default to preserving existing scenes
  let prune = true; // Default to pruning removed components
  let forceRegenMissing = true; // Always regenerate missing scenes for existing components
  
  // Process command line arguments
  if (args.includes('--include-utils')) {
    includeUtils = true;
    console.log('Including utility files');
    // Remove 'utils' from ignored files if present
    const utilsIndex = IGNORED_FILES.indexOf('utils');
    if (utilsIndex !== -1) {
      IGNORED_FILES.splice(utilsIndex, 1);
    }
  }
  
  if (args.includes('--include-index')) {
    includeIndex = true;
    console.log('Including index files');
    // Remove 'index' from ignored files if present
    const indexIndex = IGNORED_FILES.indexOf('index');
    if (indexIndex !== -1) {
      IGNORED_FILES.splice(indexIndex, 1);
    }
  }
  
  if (args.includes('--verbose')) {
    verbose = true;
    console.log('Verbose mode enabled');
  }
  
  if (args.includes('--no-preserve')) {
    preserveExisting = false;
    console.log('Creating fresh storyboard without preserving existing configurations');
  }
  
  if (args.includes('--no-prune')) {
    prune = false;
    console.log('Disabling pruning of removed components');
  }
  
  if (args.includes('--no-force-regen')) {
    forceRegenMissing = false;
    console.log('Not regenerating missing scenes for existing components');
  }
  
  if (args.includes('--help')) {
    console.log(`
Usage: node scripts/updateStoryboard.js [options]

Options:
  --include-utils    Include utility files in the storyboard
  --include-index    Include index files in the storyboard
  --verbose          Show more detailed output
  --no-preserve      Don't preserve existing scene configurations (create fresh storyboard)
  --no-prune         Keep scenes for components that no longer exist
  --no-force-regen   Don't regenerate missing scenes for existing components
  --help             Show this help message
`);
    return;
  }
  
  try {
    console.log('Scanning for React components...');
    const components = scanForComponents(SRC_DIR);
    
    console.log(`Found ${components.length} components:`);
    components.forEach(c => {
      const message = `- ${c.name} (${c.path}) ${c.hasStyleProp ? 'accepts style' : 'no style prop'}`;
      console.log(message);
      
      if (verbose) {
        console.log(`  Full path: ${c.fullPath}`);
      }
    });
    
    // Check if we should try to preserve existing scene configurations
    let existingScenes = null;
    let allExistingScenes = {}; // Stores ALL scenes, even ones we might prune
    
    if (fs.existsSync(STORYBOARD_PATH)) {
      try {
        console.log('Reading existing storyboard...');
        const existingStoryboard = fs.readFileSync(STORYBOARD_PATH, 'utf-8');
        
        // Extract scene configurations using regex
        const sceneRegex = /<Scene[^>]*id='([^']+)'[^>]*commentId='([^']+)'[^>]*style={{([^}]*)}}[^>]*data-label='([^']+)'[^>]*>([\s\S]*?)<\/Scene>/g;
        existingScenes = {};
        allExistingScenes = {};
        
        let sceneMatch;
        while ((sceneMatch = sceneRegex.exec(existingStoryboard)) !== null) {
          const id = sceneMatch[1];
          const style = sceneMatch[3];
          const label = sceneMatch[4];
          const sceneContent = sceneMatch[5]; // Content between opening and closing Scene tags
          
          // Try to extract component name from scene
          // Look for something like <ComponentName ... /> or <ComponentName>...</ComponentName>
          const componentRegex = /<([A-Z][a-zA-Z0-9_]*)[ \t\n>]/;
          const componentMatch = sceneContent.match(componentRegex);
          let componentName = componentMatch ? componentMatch[1] : null;
          
          // Skip internal components
          if (componentName === 'Scene' || componentName === 'Storyboard' || componentName === 'SafeComponentWrapper') {
            // Try to extract from a wrapper component
            const wrapperMatch = sceneContent.match(/component=\{([A-Z][a-zA-Z0-9_]*)\}/);
            if (wrapperMatch) {
              componentName = wrapperMatch[1];
            } else {
              console.log(`Could not identify component for scene ${id}, will preserve it`);
            }
          }
          
          // Parse the style string to extract width, height, left, top
          const widthMatch = style.match(/width:\s*(\d+)/);
          const heightMatch = style.match(/height:\s*(\d+)/);
          const leftMatch = style.match(/left:\s*(\d+)/);
          const topMatch = style.match(/top:\s*(\d+)/);
          
          if (widthMatch && heightMatch && leftMatch && topMatch) {
            // Store scene info keyed by scene id
            const sceneInfo = {
              width: parseInt(widthMatch[1]),
              height: parseInt(heightMatch[1]),
              left: parseInt(leftMatch[1]),
              top: parseInt(topMatch[1]),
              label,
              componentName
            };
            
            allExistingScenes[id] = sceneInfo;
            
            if (preserveExisting) {
              existingScenes[id] = sceneInfo;
              console.log(`Found existing scene: ${id} (${label})${componentName ? ', component: ' + componentName : ''}`);
            }
          }
        }
      } catch (e) {
        console.log('Error parsing existing storyboard, will generate new one:', e.message);
        existingScenes = null;
        allExistingScenes = {};
      }
    }
    
    console.log('Generating storyboard...');
    
    // Create a set of component names for fast lookup
    const componentNames = new Set(components.map(c => c.name));
    
    // If pruning is enabled, filter out scenes for components that no longer exist
    if (prune && existingScenes) {
      const sceneIdsToRemove = [];
      
      // Identify scenes to remove
      for (const [sceneId, sceneInfo] of Object.entries(allExistingScenes)) {
        const { componentName } = sceneInfo;
        
        // Skip scenes we can't identify the component for - don't prune these
        if (!componentName) {
          console.log(`Preserving scene ${sceneId} (could not identify component)`);
          continue;
        }
        
        // If component no longer exists in our scanned components, mark for removal
        if (!componentNames.has(componentName)) {
          sceneIdsToRemove.push(sceneId);
          console.log(`Pruning scene ${sceneId} for removed component ${componentName}`);
          
          // Remove from existingScenes to prevent preservation
          if (existingScenes[sceneId]) {
            delete existingScenes[sceneId];
          }
        } else {
          console.log(`Keeping scene ${sceneId} for component ${componentName}`);
        }
      }
    }
    
    // Check for components that exist but don't have scenes in the storyboard
    if (forceRegenMissing) {
      for (const component of components) {
        const expectedSceneId = `${component.name.toLowerCase()}-scene`;
        
        // If this component should have a scene but doesn't
        const hasExistingScene = Object.keys(allExistingScenes).includes(expectedSceneId);
        
        if (!hasExistingScene) {
          console.log(`Component ${component.name} exists but scene ${expectedSceneId} is missing - will regenerate`);
          // Don't add to existingScenes here - let the generation logic place it properly
        }
      }
    }
    
    // Pass the existing scenes to the generation function
    const storyboardContent = generateStoryboard(components, existingScenes);
    
    console.log('Writing storyboard to file...');
    fs.writeFileSync(STORYBOARD_PATH, storyboardContent);
    
    console.log('Storyboard updated successfully!');
  } catch (error) {
    console.error('Error updating storyboard:', error);
  }
}

// Run the update
updateStoryboard(); 