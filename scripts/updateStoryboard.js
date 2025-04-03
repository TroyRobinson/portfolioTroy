const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const COMPONENTS_DIR = path.resolve(SRC_DIR, './components');
const STORYBOARD_PATH = path.resolve(__dirname, '../utopia/storyboard.js');
const COMPONENT_EXTENSIONS = ['.jsx', '.js', '.tsx', '.ts'];

// Storyboard layout configuration
const CLUSTER_HORIZONTAL_SPACING = 1200; // Space between cluster groups
const COMPONENT_HORIZONTAL_SPACING = 600; // Increase horizontal spacing between components 
const COMPONENT_VERTICAL_SPACING = 250;   // Vertical spacing between component rows
const MAX_COMPONENTS_PER_ROW = 3;         // Maximum components per row in a cluster
const COMPONENT_WIDTH_PADDING = 100;      // Padding between components to prevent overlap
const COMPONENT_WIDTH_BUFFER = 50;        // Extra buffer to add to component widths to prevent overlap

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
    
    // Check for common container sizes first
    const maxWidthMatch = content.match(/maxWidth:\s*['"]?([^'",}]+)['"]?/);
    const containerWidthMatch = content.match(/width:\s*['"]?(100%|['"]?[^'",}]+)['"]?/);
    
    // Match height and min-height
    const heightMatch = content.match(/height:\s*['"]?([^'",}]+)['"]?/);
    const minHeightMatch = content.match(/minHeight:\s*['"]?([^'",}]+)['"]?/);
    
    // Analyze component by its path and content to make better guesses
    const fileName = path.basename(componentPath);
    const dirName = path.dirname(componentPath);
    const isLayoutComponent = fileName.toLowerCase().includes('layout') || 
                             content.includes('layout') || 
                             content.includes('container');
    const isPageComponent = fileName.toLowerCase().includes('page') || 
                           dirName.includes('page') || 
                           content.includes('page');
    const isHeaderComponent = fileName.toLowerCase().includes('header') || 
                             content.includes('header') || 
                             content.includes('navbar');
    const isButtonComponent = fileName.toLowerCase().includes('button') || 
                             content.includes('<button') || 
                             content.includes('role="button"');
    const isCardComponent = fileName.toLowerCase().includes('card') || 
                           content.includes('card');
    const isTagComponent = fileName.toLowerCase().includes('tag') || 
                          content.includes('badge') || 
                          content.includes('chip') || 
                          content.includes('label');
    
    // Check for navigation component
    const isNavComponent = fileName.toLowerCase().includes('nav') || 
                          content.includes('navbar') || 
                          content.includes('<nav') || 
                          content.includes('navigation');
    
    // Extract explicit sizes from content
    if (maxWidthMatch && maxWidthMatch[1]) {
      const maxWidthValue = parseStyleValue(maxWidthMatch[1]);
      if (isNumber(maxWidthValue)) {
        width = maxWidthValue;
      }
    }
    
    if (!width && containerWidthMatch && containerWidthMatch[1]) {
      if (containerWidthMatch[1] === '100%') {
        // For full width components, use a reasonable default based on component type
        if (isLayoutComponent || isPageComponent) {
          width = 800;
        } else {
          width = 700;
        }
      } else {
        const widthValue = parseStyleValue(containerWidthMatch[1]);
        if (isNumber(widthValue)) {
          width = widthValue;
        }
      }
    }
    
    // Try to extract height
    if (heightMatch && heightMatch[1]) {
      if (heightMatch[1] === '100%' || heightMatch[1] === '100vh') {
        // For full height components, use a reasonable default
        height = 700;
      } else {
        const heightValue = parseStyleValue(heightMatch[1]);
        if (isNumber(heightValue)) {
          height = heightValue;
        }
      }
    }
    
    // If no height found, check min-height
    if (!height && minHeightMatch && minHeightMatch[1]) {
      if (minHeightMatch[1] === '100vh') {
        height = 700;
      } else {
        const minHeightValue = parseStyleValue(minHeightMatch[1]);
        if (isNumber(minHeightValue)) {
          height = minHeightValue;
        }
      }
    }
    
    // Check for fixed dimensions in multiple formats (px, rem, etc.)
    if (!width || !height) {
      // Look for style object with width/height specified
      const styleObjectMatch = content.match(/style={?{([^}]*)}?}/);
      if (styleObjectMatch) {
        const styleObject = styleObjectMatch[1];
        
        // If we don't have width yet, try to find it in the style object
        if (!width) {
          const widthInStyleMatch = styleObject.match(/width:\s*['"]?([^'",}]+)['"]?/);
          if (widthInStyleMatch) {
            const styleWidth = parseStyleValue(widthInStyleMatch[1]);
            if (isNumber(styleWidth)) {
              width = styleWidth;
            }
          }
        }
        
        // If we don't have height yet, try to find it in the style object
        if (!height) {
          const heightInStyleMatch = styleObject.match(/height:\s*['"]?([^'",}]+)['"]?/);
          if (heightInStyleMatch) {
            const styleHeight = parseStyleValue(heightInStyleMatch[1]);
            if (isNumber(styleHeight)) {
              height = styleHeight;
            }
          }
        }
      }
    }
    
    // If we found valid dimensions, use them
    if (width && height && isNumber(width) && isNumber(height)) {
      console.log(`Extracted dimensions for ${path.basename(componentPath)}: ${width}x${height}`);
      return { width, height };
    }
    
    // Make educated guesses based on component type
    if (isButtonComponent) {
      return { width: 120, height: 40 };
    } else if (isNavComponent) {
      return { width: 800, height: 80 };
    } else if (isTagComponent) {
      return { width: 110, height: 44 };
    } else if (isCardComponent) {
      return { width: 350, height: 400 };
    } else if (isHeaderComponent) {
      return { width: 800, height: 100 };
    } else if (isLayoutComponent) {
      // For layout components, provide a more reasonable dimensions
      return { width: 800, height: 600 };
    } else if (isPageComponent) {
      // For page components, provide dimensions that represent a typical page
      return { width: 800, height: 900 };
    }
    
    // Read deeper into the file for better dimension guessing
    // Check if there's heavy nesting suggesting a complex component
    const nestingLevel = (content.match(/<[^/][^>]*>/g) || []).length - 
                         (content.match(/<\/[^>]*>/g) || []).length;
    
    if (nestingLevel > 10) {
      // Complex component with deep nesting, likely needs more vertical space
      return { width: 700, height: 800 };
    } else if (nestingLevel > 5) {
      // Moderately complex component
      return { width: 700, height: 500 };
    }
    
    // Analyze for rows vs columns layout
    const hasFlexRow = content.includes('flexDirection: "row"') || 
                       content.includes("flexDirection: 'row'") ||
                       content.includes('flex-direction: row') ||
                       content.includes('FlexRow');
    
    const hasFlexCol = content.includes('flexDirection: "column"') || 
                      content.includes("flexDirection: 'column'") ||
                      content.includes('flex-direction: column') ||
                      content.includes('FlexCol');
    
    if (hasFlexRow && !hasFlexCol) {
      // Primarily row-based layout tends to be wider than tall
      return { width: 800, height: 200 };
    } else if (hasFlexCol && !hasFlexRow) {
      // Primarily column-based layout tends to be taller than wide
      return { width: 600, height: 700 };
    }
    
    // Look at file name to make a final guess
    const baseFileName = path.basename(componentPath, path.extname(componentPath)).toLowerCase();
    
    if (baseFileName.includes('layout')) {
      return { width: 800, height: 600 };
    } else if (baseFileName.includes('page')) {
      return { width: 800, height: 900 };
    } else if (baseFileName === 'pagelayout' || baseFileName === 'page-layout') {
      return { width: 800, height: 600 };
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
  
  // If it's a rem value, convert to pixels (assuming 1rem = 16px)
  if (value.endsWith('rem')) {
    const numValue = parseFloat(value.slice(0, -3));
    return parseInt(String(numValue * 16), 10);
  }
  
  // If it's a percentage, return a reasonable default
  if (value.endsWith('%')) {
    return 700; // Default reasonable width for percentage-based components
  }
  
  // If it's a number as string, convert to number
  if (!isNaN(Number(value))) {
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
          
          components.push({
            name: componentName,
            path: path.relative(SRC_DIR, filePath).replace(/\\/g, '/'),
            fullPath: filePath,
            hasStyleProp,
            dimensions: componentDimensions
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
              
              components.push({
                name: componentName,
                path: path.relative(SRC_DIR, filePath).replace(/\\/g, '/'),
                fullPath: filePath,
                hasStyleProp,
                dimensions: componentDimensions
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
  
  // Group components by their directory
  const componentGroups = groupComponentsByDirectory(components);
  
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
  
  // Calculate starting position for the first cluster
  let nextClusterLeftPosition = Math.max(furthestRightPosition + defaultSceneSpacing, 2000);

  // Now add remaining components by their directory groups
  let nextPosition = Math.max(furthestRightPosition + defaultSceneSpacing, 1800);

  // First process ungrouped components (pages, etc.) in the traditional side-by-side layout
  if (componentGroups['ungrouped']) {
    const ungroupedComponents = componentGroups['ungrouped'].filter(component => 
      !addedComponents.has(component.name)
    );
    
    console.log(`Processing ${ungroupedComponents.length} ungrouped components in side-by-side layout`);
    
    ungroupedComponents.forEach(component => {
      if (!addedComponents.has(component.name)) {
        const sceneId = `${component.name.toLowerCase()}-scene`;
        
        // Determine width and height - use component dimensions if available
        let width = defaultSceneWidth;
        let height = 700;
        
        if (component.dimensions) {
          width = component.dimensions.width;
          height = component.dimensions.height;
        }
        
        // Place in traditional side-by-side layout
        sceneConfigurations[sceneId] = {
          width: width,
          height: height,
          left: nextPosition,
          top: defaultTop,
          label: component.name,
          component
        };
        
        addedComponents.add(component.name);
        nextPosition += defaultSceneSpacing;
        console.log(`Added new scene for ${component.name} at position ${nextPosition - defaultSceneSpacing} (side-by-side layout)`);
      }
    });
  }

  // Now process component groups for clustering layout
  for (const [dirPath, groupComponents] of Object.entries(componentGroups)) {
    // Skip the ungrouped components as we've already processed them
    if (dirPath === 'ungrouped') continue;
    
    console.log(`Creating cluster for directory: ${dirPath}`);

    // Skip empty groups
    const componentsInGroup = groupComponents.filter(component => 
      !addedComponents.has(component.name)
    );
    
    if (componentsInGroup.length === 0) {
      console.log(`No components to add in directory: ${dirPath}`);
      continue;
    }
    
    // Calculate cluster layout
    const rows = Math.ceil(componentsInGroup.length / MAX_COMPONENTS_PER_ROW);
    
    // Add components in this group
    let componentIndex = 0;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < MAX_COMPONENTS_PER_ROW; col++) {
        if (componentIndex >= componentsInGroup.length) break;
        
        const component = componentsInGroup[componentIndex];
        componentIndex++;
        
        if (!addedComponents.has(component.name)) {
          const sceneId = `${component.name.toLowerCase()}-scene`;
          
          // Determine width and height - use component dimensions if available
          let width = defaultSceneWidth;
          let height = 700;
          
          if (component.dimensions) {
            width = component.dimensions.width;
            height = component.dimensions.height;
          }
          
          // Calculate position in the cluster
          const left = nextClusterLeftPosition + (col * COMPONENT_HORIZONTAL_SPACING);
          const top = defaultTop + (row * COMPONENT_VERTICAL_SPACING);
          
          sceneConfigurations[sceneId] = {
            width: width,
            height: height,
            left: left,
            top: top,
            label: component.name,
            component,
            group: dirPath // Store group info for potential future use
          };
          
          addedComponents.add(component.name);
          console.log(`Added new scene for ${component.name} at position ${left}x${top} (in cluster ${dirPath})`);
        }
      }
    }
    
    // Move to next cluster position
    nextClusterLeftPosition += CLUSTER_HORIZONTAL_SPACING;
  }
  
  // Now rearrange scenes to close any gaps
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
  
  // Now add all scenes to the content in the reorganized positions
  Object.entries(sceneConfigurations).forEach(([sceneId, config]) => {
    if (config.component) {
      addComponentScene(config.component, sceneId, config);
      
      if (existingScenes && existingScenes[sceneId]) {
        if (config.left !== existingScenes[sceneId].left) {
          console.log(`Relocated scene ${sceneId} from position ${existingScenes[sceneId].left} to ${config.left}`);
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

// Function to group components by their directory
function groupComponentsByDirectory(components) {
  const groups = {};
  
  components.forEach(component => {
    // Get directory path relative to src
    const fullPath = component.path;
    const dirParts = path.dirname(fullPath).split('/');
    
    // Only group components in the components directory
    // Everything else goes into a special "ungrouped" category to maintain side-by-side layout
    let groupKey = 'ungrouped'; // Default for non-components
    
    // Check if component is in /components or a subdirectory
    if (dirParts[0] === 'components') {
      if (dirParts.length > 1) {
        // This is a subdirectory like components/UI
        groupKey = dirParts.slice(0, 2).join('/');
      } else {
        // This is the main components directory
        groupKey = dirParts[0];
      }
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(component);
  });
  
  return groups;
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
        
        // If component no