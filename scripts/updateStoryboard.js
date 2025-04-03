const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const COMPONENTS_DIR = path.resolve(SRC_DIR, './components');
const STORYBOARD_PATH = path.resolve(__dirname, '../utopia/storyboard.js');
const COMPONENT_EXTENSIONS = ['.jsx', '.js', '.tsx', '.ts'];

// Files to ignore - exact names or patterns
const IGNORED_FILES = [
  'index',    // Index files usually just re-export
  'utils',    // Utility files aren't components
  'router',   // Router configuration
  'spec',     // Test files
  'mock',     // Test mocks
  'helpers',  // Helper utilities
  'constants', // Constants and configs
  'types',    // TypeScript type definitions
];

// Layout settings
const AUTO_SIZE_COMPONENTS = true;
const VERTICAL_LAYOUT = true;
const VERTICAL_SPACING = 220;              // Space between vertically stacked components
const HORIZONTAL_COLUMN_SPACING = 936;     // Distance between component columns (1148 - 212 = 936)
const COMPONENT_COLUMN_TOP = 1584;         // Starting top position for component columns
const SUB_FOLDER_COLUMN_LEFT = 1148;       // Left position for the first subfolder column

// File patterns to always include even if they match ignore patterns
const FORCE_INCLUDE = [];

// Analyze component type based on name and content patterns
function analyzeComponentType(content, filename) {
  const lowerFilename = filename.toLowerCase();
  
  // Check for common component naming patterns
  if (lowerFilename.includes('button') || content.includes('<button') || content.includes('role="button"')) {
    return 'button';
  } else if (lowerFilename.includes('card') || content.includes('card') || content.includes('Card')) {
    return 'card';
  } else if (lowerFilename.includes('tag') || lowerFilename.includes('badge')) {
    return 'tag';
  } else if (lowerFilename.includes('nav') || lowerFilename.includes('header')) {
    return 'nav';
  } else if (lowerFilename.includes('layout') || lowerFilename.includes('page') || lowerFilename.includes('container')) {
    return 'layout';
  } else if (lowerFilename.includes('input') || lowerFilename.includes('field')) {
    return 'input';
  } else if (lowerFilename.includes('modal') || lowerFilename.includes('dialog')) {
    return 'modal';
  } else if (lowerFilename.includes('icon')) {
    return 'icon';
  } else if (lowerFilename.includes('menu') || lowerFilename.includes('dropdown')) {
    return 'menu';
  } else if (lowerFilename.includes('form')) {
    return 'form';
  } else if (lowerFilename.includes('list') || content.match(/<(ul|ol)\b/)) {
    return 'list';
  } else if (lowerFilename.includes('table') || content.includes('<table')) {
    return 'table';
  } else if (content.includes('width: \'100%\'') || content.includes('width: "100%"') || 
            content.includes('width: 100%') || content.includes('maxWidth')) {
    return 'full-width';
  }
  
  return 'generic';
}

// Define default sizes for different component types
function getDefaultSizesByComponentType(componentType) {
  const defaults = {
    button: { width: 120, height: 40, aspectRatio: 3 },
    tag: { width: 110, height: 44, aspectRatio: 2.5 },
    nav: { width: 800, height: 80, aspectRatio: 10 },
    card: { width: 350, height: 400, aspectRatio: 0.875 },
    layout: { width: 600, height: 400, aspectRatio: 1.5 },
    input: { width: 240, height: 40, aspectRatio: 6 },
    modal: { width: 500, height: 300, aspectRatio: 1.67 },
    icon: { width: 32, height: 32, aspectRatio: 1 },
    menu: { width: 200, height: 300, aspectRatio: 0.67 },
    form: { width: 400, height: 500, aspectRatio: 0.8 },
    list: { width: 300, height: 400, aspectRatio: 0.75 },
    table: { width: 600, height: 400, aspectRatio: 1.5 },
    'full-width': { width: 800, height: 600, aspectRatio: 1.33 },
    generic: { width: 400, height: 300, aspectRatio: 1.33 }
  };
  
  return defaults[componentType] || defaults.generic;
}

// Parse CSS style values to numeric pixel values
function parseStyleValue(value) {
  if (!value) return null;
  
  value = value.trim().replace(/['"]/g, '');
  
  // Handle different CSS units
  if (value === '100%' || value === 'auto' || value === 'inherit' || value === 'initial') {
    return null;
  } else if (value.endsWith('px')) {
    return parseInt(value.slice(0, -2), 10);
  } else if (value.endsWith('rem')) {
    return parseInt(value.slice(0, -3), 10) * 16;  // 1rem = 16px
  } else if (value.endsWith('em')) {
    return parseInt(value.slice(0, -2), 10) * 16;  // 1em = 16px
  } else if (value.endsWith('vh')) {
    return parseInt(value.slice(0, -2), 10) * 8;   // 100vh = 800px
  } else if (value.endsWith('vw')) {
    return parseInt(value.slice(0, -2), 10) * 12;  // 100vw = 1200px
  } else if (!isNaN(value)) {
    return parseInt(value, 10);
  }
  
  return null;
}

// Simple validator for numeric values
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

// Extract dimensions from component files based on styles, annotations or defaults
function extractComponentDimensions(componentPath) {
  try {
    const content = fs.readFileSync(componentPath, 'utf-8');
    const filename = path.basename(componentPath);
    
    // Check for preferred size in JSDoc comments
    const preferredSizeMatch = content.match(/@preferred-size\s+(\d+)x(\d+)/);
    if (preferredSizeMatch) {
      const width = parseInt(preferredSizeMatch[1], 10);
      const height = parseInt(preferredSizeMatch[2], 10);
      
      if (isNumber(width) && isNumber(height)) {
        console.log(`Found preferred size annotation for ${filename}: ${width}x${height}`);
        return { width, height };
      }
    }
    
    // Default size if we can't determine
    let defaultSize = { width: 700, height: 700 };
    
    // Extract dimensions from style properties
    let width, height, maxWidth, minWidth;
    
    // Collect style blocks from various patterns
    const styleBlocks = [];
    
    // Match inline styles
    const widthHeightRegex = /style=\s*{(?:[^{}]|{[^{}]*})*}\s*>/g;
    let styleMatch;
    while ((styleMatch = widthHeightRegex.exec(content)) !== null) {
      styleBlocks.push(styleMatch[0]);
    }
    
    // Also look for style objects defined separately
    const styleObjectRegex = /style\s*=\s*{([^{}]|{[^{}]*})*}/g;
    while ((styleMatch = styleObjectRegex.exec(content)) !== null) {
      styleBlocks.push(styleMatch[0]);
    }
    
    // Look for complex style definitions
    const complexStyleRegex = /style\s*:\s*{([^{}]|{[^{}]*})*}/g;
    while ((styleMatch = complexStyleRegex.exec(content)) !== null) {
      styleBlocks.push(styleMatch[0]);
    }
    
    // Extract width and height from all style blocks
    for (const block of styleBlocks) {
      const widthMatch = block.match(/width\s*:\s*['"]?([^'",}]+)['"]?/);
      const heightMatch = block.match(/height\s*:\s*['"]?([^'",}]+)['"]?/);
      const maxWidthMatch = block.match(/maxWidth\s*:\s*['"]?([^'",}]+)['"]?/);
      const minWidthMatch = block.match(/minWidth\s*:\s*['"]?([^'",}]+)['"]?/);
      
      if (widthMatch && !width) width = parseStyleValue(widthMatch[1]);
      if (heightMatch && !height) height = parseStyleValue(heightMatch[1]);
      if (maxWidthMatch && !maxWidth) maxWidth = parseStyleValue(maxWidthMatch[1]);
      if (minWidthMatch && !minWidth) minWidth = parseStyleValue(minWidthMatch[1]);
    }
    
    // Look for container elements that might define dimensions
    const containerMatch = content.match(/<(div|section|main|article|aside)\s+[^>]*style\s*=\s*{([^{}]|{[^{}]*})*}/g);
    if (containerMatch) {
      for (const container of containerMatch) {
        const widthMatch = container.match(/width\s*:\s*['"]?([^'",}]+)['"]?/);
        const heightMatch = container.match(/height\s*:\s*['"]?([^'",}]+)['"]?/);
        const maxWidthMatch = container.match(/maxWidth\s*:\s*['"]?([^'",}]+)['"]?/);
        
        if (widthMatch && !width) width = parseStyleValue(widthMatch[1]);
        if (heightMatch && !height) height = parseStyleValue(heightMatch[1]);
        if (maxWidthMatch && !maxWidth) maxWidth = parseStyleValue(maxWidthMatch[1]);
      }
    }
    
    // Use maxWidth as width if no explicit width found
    if (!width && maxWidth) {
      width = maxWidth;
    }
    
    // If we found valid numerical dimensions, return them
    if (width && height && isNumber(width) && isNumber(height)) {
      console.log(`Extracted exact dimensions for ${filename}: ${width}x${height}`);
      return { width, height };
    }
    
    // Analyze component by type and apply appropriate defaults
    const componentType = analyzeComponentType(content, filename);
    const defaultSizes = getDefaultSizesByComponentType(componentType);
    
    // If we have one dimension but not both, calculate the other using type-based aspect ratio
    if (width && !height) {
      height = Math.round(width / defaultSizes.aspectRatio);
      console.log(`Using width ${width} with calculated height ${height} for ${filename}`);
      return { width, height };
    } else if (height && !width) {
      width = Math.round(height * defaultSizes.aspectRatio);
      console.log(`Using height ${height} with calculated width ${width} for ${filename}`);
      return { width, height };
    }
    
    console.log(`Using default dimensions for ${componentType} component ${filename}: ${defaultSizes.width}x${defaultSizes.height}`);
    return { width: defaultSizes.width, height: defaultSizes.height };
  } catch (error) {
    console.log(`Error extracting dimensions from ${componentPath}: ${error.message}`);
    return { width: 700, height: 700 };
  }
}

// Recursively scan directories to find React components
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
      
      // Skip if the file matches ignore patterns and isn't explicitly included
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
      
      // Detect React components
      const exportRegex = /export\s+(var|const|let|function|class)\s+(\w+)(?:\s*=\s*(?:\(([^)]*)\)|function\s*\(([^)]*)\))?)?/g;
      const defaultExportRegex = /export\s+default\s+(\w+)/g;
      const componentDeclarationRegex = /(var|const|let|function|class)\s+(\w+)(?:\s*=\s*(?:\(([^)]*)\)|function\s*\(([^)]*)\))?)?/g;
      
      let match;
      let defaultExportName = null;
      
      // Find default export name if present
      while ((match = defaultExportRegex.exec(content)) !== null) {
        defaultExportName = match[1];
      }
      
      // Determine if a component is a React component
      const isReactComponent = (content, componentName) => {
        const hasJSX = content.includes('<') && content.includes('/>') || content.includes('</');
        const hasReactImport = content.includes('import React') || content.includes('import * as React');
        const isExtendingReactComponent = content.includes(`extends React.Component`) || content.includes(`extends Component`);
        const usesReactHooks = content.includes('useState') || content.includes('useEffect') || content.includes('useContext');
        const returnsJSX = new RegExp(`(return|=>)\\s*\\(\\s*<`, 'g').test(content);
        
        return (
          componentName[0] === componentName[0].toUpperCase() && 
          (hasJSX || hasReactImport || isExtendingReactComponent || usesReactHooks || returnsJSX)
        );
      };

      // Process named exports
      while ((match = exportRegex.exec(content)) !== null) {
        const componentName = match[2];
        
        if (isReactComponent(content, componentName)) {
          // Check if component accepts style prop
          const params = match[3] || match[4] || '';
          
          const hasStyleProp = 
            params.includes('style') || 
            params.includes('props') || 
            params.includes('...') || 
            params.match(/{\s*[^}]*\s*}/); // Destructuring pattern
          
          // Auto-size components in the components directory
          let componentDimensions = null;
          if (AUTO_SIZE_COMPONENTS && filePath.includes(path.sep + 'components' + path.sep)) {
            componentDimensions = extractComponentDimensions(filePath);
          }
          
          // Categorize component by location
          let componentType = 'page';
          let subFolder = '';
          
          if (fullPath.includes('components/')) {
            componentType = 'component';
            
            // Check for subfolder structure
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
      
      // Process default exports referencing named components
      if (defaultExportName) {
        componentDeclarationRegex.lastIndex = 0;
        
        while ((match = componentDeclarationRegex.exec(content)) !== null) {
          const componentName = match[2];
          
          if (componentName === defaultExportName && isReactComponent(content, componentName)) {
            const params = match[3] || match[4] || '';
            const hasStyleProp = 
              params.includes('style') || 
              params.includes('props') || 
              params.includes('...') || 
              params.match(/{\s*[^}]*\s*}/);
            
            // Skip if component already added via named export
            if (!components.some(c => c.name === componentName)) {
              // Extract dimensions for components
              let componentDimensions = null;
              if (AUTO_SIZE_COMPONENTS && filePath.includes(path.sep + 'components' + path.sep)) {
                componentDimensions = extractComponentDimensions(filePath);
              }
              
              // Categorize component by location
              let componentType = 'page';
              let subFolder = '';
              
              if (fullPath.includes('components/')) {
                componentType = 'component';
                
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

// Generate storyboard content for all discovered components
function generateStoryboard(components, existingScenes = null) {
  // Start with imports
  let imports = `import * as React from 'react'\nimport { Scene, Storyboard } from 'utopia-api'\n`;
  
  // Add component imports
  const importedComponents = new Set();
  components.forEach(component => {
    if (!importedComponents.has(component.name)) {
      const importPath = component.path;
      const fileExt = path.extname(importPath);
      const importPathWithoutExt = importPath.replace(fileExt, '');
      
      // Determine if component uses default or named export
      const filePath = path.join(SRC_DIR, importPath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const isDefaultExport = content.includes(`export default ${component.name}`);
      
      // Generate the import statement using the appropriate format
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
  
  // Scene layout configuration
  const usedPositions = new Set();
  const defaultSceneWidth = 700;
  const defaultSceneSpacing = 816;
  const defaultTop = 128;
  
  // Track components and scenes
  const addedComponents = new Set();
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
  
  // Determine furthest right position for layout calculation
  let furthestRightPosition = 0;
  if (usedPositions.size > 0) {
    furthestRightPosition = Math.max(...usedPositions);
  }
  
  // Components that need new scenes
  const componentsToAdd = components.filter(component => !addedComponents.has(component.name));
  
  // Special handling for Playground and App
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
  
  // Group components by type for organized layout
  const regularComponents = componentsToAdd.filter(c => c.type === 'component' && !addedComponents.has(c.name));
  const subfolderComponents = componentsToAdd.filter(c => c.type === 'subfolder-component' && !addedComponents.has(c.name));
  const otherComponents = componentsToAdd.filter(c => 
    c.type === 'page' && 
    c.name !== 'Playground' && 
    c.name !== 'App' && 
    !addedComponents.has(c.name)
  );
  
  // Group subfolder components 
  const subfolderGroups = {};
  subfolderComponents.forEach(component => {
    if (!subfolderGroups[component.subFolder]) {
      subfolderGroups[component.subFolder] = [];
    }
    subfolderGroups[component.subFolder].push(component);
  });
  
  // Layout positioning variables
  let nextHorizontalPosition = furthestRightPosition + defaultSceneSpacing;
  const componentColumnLeft = 212;
  let componentColumnTop = COMPONENT_COLUMN_TOP;
  let currentSubfolderColumnIndex = 0;
  
  // Find available gaps in the horizontal layout for efficient space use
  let availableGaps = [];
  if (usedPositions.size > 1) {
    const positionsArray = Array.from(usedPositions).sort((a, b) => a - b);
    
    for (let i = 0; i < positionsArray.length - 1; i++) {
      const startPos = positionsArray[i];
      const endPos = positionsArray[i+1];
      const gap = endPos - startPos;
      
      if (gap >= defaultSceneSpacing) {
        const scenesFit = Math.floor(gap / defaultSceneSpacing);
        
        for (let j = 0; j < scenesFit; j++) {
          const gapPosition = startPos + defaultSceneSpacing * (j + 1);
          if (gapPosition + defaultSceneWidth + 20 <= endPos) {
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
  
  // Position page components in horizontal layout
  otherComponents.forEach(component => {
    if (!addedComponents.has(component.name)) {
      const sceneId = `${component.name.toLowerCase()}-scene`;
      
      // Use component dimensions or defaults
      let width = defaultSceneWidth;
      let height = 700;
      
      if (component.dimensions) {
        width = component.dimensions.width;
        height = component.dimensions.height;
      }
      
      // Place in gap if available, otherwise at the end
      if (availableGaps.length > 0) {
        const gap = availableGaps.shift();
        
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

  // Position regular components in vertical column
  regularComponents.forEach(component => {
    if (!addedComponents.has(component.name)) {
      const sceneId = `${component.name.toLowerCase()}-scene`;
      
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
  
  // Position subfolder components in separate columns
  Object.entries(subfolderGroups).forEach(([folder, folderComponents], folderIndex) => {
    const columnLeft = SUB_FOLDER_COLUMN_LEFT + (folderIndex * HORIZONTAL_COLUMN_SPACING);
    let columnTop = COMPONENT_COLUMN_TOP;
    
    console.log(`Creating column for ${folder} components at position ${columnLeft}`);
    
    folderComponents.forEach(component => {
      if (!addedComponents.has(component.name)) {
        const sceneId = `${component.name.toLowerCase()}-scene`;
        
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
  
  // Add component reference to existing scenes
  if (existingScenes) {
    Object.keys(sceneConfigurations).forEach(sceneId => {
      const config = sceneConfigurations[sceneId];
      if (config && !config.component) {
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
  
  // Reorganize for optimal layout
  const reorganizedScenes = reorganizeScenes(sceneConfigurations, defaultSceneSpacing);
  
  // Add all scenes to the storyboard content
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
    
    // Add component rendering with proper props based on component name
    const componentName = component.name;
    if (componentName === 'App') {
      // Simple informational representation of the App's router structure
      content += `      <>\n`;
      content += `        {/* Simplified App preview for storyboard */}\n`;
      content += `        <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>\n`;
      content += `          <div style={{ border: '1px dashed #ccc', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>\n`;
      content += `            <h3 style={{ margin: '0 0 10px 0' }}>App Component</h3>\n`;
      content += `            <p style={{ margin: '0 0 10px 0' }}>This component contains a Router with the following routes:</p>\n`;
      content += `            <ul style={{ margin: '0', paddingLeft: '20px' }}>\n`;
      content += `              <li>/ → AboutPage</li>\n`;
      content += `              <li>/portfolio → PortfolioPage</li>\n`;
      content += `              <li>/portfolio/:slug → CaseStudyDetail</li>\n`;
      content += `              <li>/contact → ContactPage</li>\n`;
      content += `            </ul>\n`;
      content += `          </div>\n`;
      content += `        </div>\n`;
      content += `      </>\n`;
    } else if (componentName === 'PageLayout') {
      content += `      <${componentName} style={{}} title="Sample Title">\n`;
      content += `        <div>Sample content</div>\n`;
      content += `      </${componentName}>\n`;
    } else if (componentName === 'Tag') {
      content += `      <${componentName}>Tag label</${componentName}>\n`;
    } else if (componentName === 'Button') {
      content += `      <${componentName} style={{}} onClick={() => {}}>\n`;
      content += `        Click Me\n`;
      content += `      </${componentName}>\n`;
    } else if (componentName === 'CaseStudyDetail') {
      content += `      <${componentName} slug="sample-case-study" />\n`;
    } else if (componentName === 'Playground') {
      content += `      <${componentName} style={{}}>\n`;
      content += `        Playground Content\n`;
      content += `      </${componentName}>\n`;
    } else if (component.hasStyleProp) {
      content += `      <${componentName} style={{}} />\n`;
    } else {
      content += `      <${componentName} />\n`;
    }
    
    content += `    </Scene>\n`;
  }
  
  // Close storyboard
  content += `  </Storyboard>\n)\n`;
  
  return imports + content;
}

// Reorganize scenes to ensure optimal placement and remove gaps
function reorganizeScenes(sceneConfigurations, defaultSpacing) {
  const reorganized = JSON.parse(JSON.stringify(sceneConfigurations));
  
  // Special handling for Playground and App - maintain their fixed positions
  const hasPlayground = Object.values(reorganized).some(config => 
    config.label === 'Playground' || (config.component && config.component.name === 'Playground')
  );
  
  const hasApp = Object.values(reorganized).some(config => 
    config.label === 'My App' || config.label === 'App' || 
    (config.component && config.component.name === 'App')
  );
  
  // Extract scenes for sorting by position
  const scenes = Object.entries(reorganized).map(([id, config]) => ({
    id,
    left: config.left,
    top: config.top,
    config,
    originalLeft: config.left,
    isInTopRow: config.top === 128 || (config.component && config.component.type === 'page')
  }));
  
  // Only reorganize the top row of pages
  const topRowScenes = scenes.filter(scene => scene.isInTopRow);
  topRowScenes.sort((a, b) => a.left - b.left);
  
  // Track position changes
  let positionShifts = 0;
  
  // Special handling for fixed-position components
  let currentPosition = 212; // Default starting position
  
  if (hasPlayground) {
    const playgroundScene = topRowScenes.find(scene => 
      scene.config.label === 'Playground' || 
      (scene.config.component && scene.config.component.name === 'Playground')
    );
    
    if (playgroundScene) {
      playgroundScene.config.left = 212;
      currentPosition = 212 + defaultSpacing;
    }
  }
  
  if (hasApp) {
    const appScene = topRowScenes.find(scene => 
      scene.config.label === 'My App' || scene.config.label === 'App' || 
      (scene.config.component && scene.config.component.name === 'App')
    );
    
    if (appScene) {
      appScene.config.left = hasPlayground ? 992 : 212;
      currentPosition = appScene.config.left + defaultSpacing;
    }
  }
  
  // Position all other scenes sequentially
  topRowScenes.forEach((scene) => {
    // Skip special components already positioned
    const isPlayground = scene.config.label === 'Playground' || 
                         (scene.config.component && scene.config.component.name === 'Playground');
    
    const isApp = scene.config.label === 'My App' || scene.config.label === 'App' || 
                  (scene.config.component && scene.config.component.name === 'App');
    
    if (!isPlayground && !isApp) {
      if (scene.config.left !== currentPosition) {
        positionShifts++;
        console.log(`Repositioning scene ${scene.id} from ${scene.originalLeft} to ${currentPosition}`);
      }
      
      scene.config.left = currentPosition;
      currentPosition += defaultSpacing;
    }
  });
  
  // Log repositioning status
  if (positionShifts > 0) {
    console.log(`Repositioned ${positionShifts} scenes to close gaps`);
  } else {
    console.log('No scene repositioning needed - layout already optimal');
  }
  
  // Update configurations with new positions
  topRowScenes.forEach(scene => {
    reorganized[scene.id] = scene.config;
  });
  
  return reorganized;
}

// Main function to update the storyboard
function updateStoryboard() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let includeUtils = false;
  let includeIndex = false;
  let verbose = false;
  let preserveExisting = true;
  let prune = true;
  let forceRegenMissing = true;
  
  // Process command line flags
  if (args.includes('--include-utils')) {
    includeUtils = true;
    console.log('Including utility files');
    const utilsIndex = IGNORED_FILES.indexOf('utils');
    if (utilsIndex !== -1) IGNORED_FILES.splice(utilsIndex, 1);
  }
  
  if (args.includes('--include-index')) {
    includeIndex = true;
    console.log('Including index files');
    const indexIndex = IGNORED_FILES.indexOf('index');
    if (indexIndex !== -1) IGNORED_FILES.splice(indexIndex, 1);
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
    
    // Get existing scene configurations if preserving
    let existingScenes = null;
    let allExistingScenes = {};
    
    if (fs.existsSync(STORYBOARD_PATH)) {
      try {
        console.log('Reading existing storyboard...');
        const existingStoryboard = fs.readFileSync(STORYBOARD_PATH, 'utf-8');
        
        // Extract scene configurations
        const sceneRegex = /<Scene[^>]*id='([^']+)'[^>]*commentId='([^']+)'[^>]*style={{([^}]*)}}[^>]*data-label='([^']+)'[^>]*>([\s\S]*?)<\/Scene>/g;
        existingScenes = {};
        allExistingScenes = {};
        
        let sceneMatch;
        while ((sceneMatch = sceneRegex.exec(existingStoryboard)) !== null) {
          const id = sceneMatch[1];
          const style = sceneMatch[3];
          const label = sceneMatch[4];
          const sceneContent = sceneMatch[5];
          
          // Extract component name from scene content
          const componentRegex = /<([A-Z][a-zA-Z0-9_]*)[ \t\n>]/;
          const componentMatch = sceneContent.match(componentRegex);
          let componentName = componentMatch ? componentMatch[1] : null;
          
          // Handle wrapped components
          if (componentName === 'Scene' || componentName === 'Storyboard' || componentName === 'SafeComponentWrapper') {
            const wrapperMatch = sceneContent.match(/component=\{([A-Z][a-zA-Z0-9_]*)\}/);
            if (wrapperMatch) {
              componentName = wrapperMatch[1];
            } else {
              console.log(`Could not identify component for scene ${id}, will preserve it`);
            }
          }
          
          // Parse style properties
          const widthMatch = style.match(/width:\s*(\d+)/);
          const heightMatch = style.match(/height:\s*(\d+)/);
          const leftMatch = style.match(/left:\s*(\d+)/);
          const topMatch = style.match(/top:\s*(\d+)/);
          
          if (widthMatch && heightMatch && leftMatch && topMatch) {
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
    
    // Prune scenes for removed components
    if (prune && existingScenes) {
      const componentNames = new Set(components.map(c => c.name));
      
      for (const [sceneId, sceneInfo] of Object.entries(allExistingScenes)) {
        const { componentName } = sceneInfo;
        
        if (!componentName) {
          console.log(`Preserving scene ${sceneId} (could not identify component)`);
          continue;
        }
        
        if (!componentNames.has(componentName)) {
          console.log(`Pruning scene ${sceneId} for removed component ${componentName}`);
          if (existingScenes[sceneId]) {
            delete existingScenes[sceneId];
          }
        } else {
          console.log(`Keeping scene ${sceneId} for component ${componentName}`);
        }
      }
    }
    
    // Identify components that need new scenes
    if (forceRegenMissing) {
      for (const component of components) {
        const expectedSceneId = `${component.name.toLowerCase()}-scene`;
        const hasExistingScene = Object.keys(allExistingScenes).includes(expectedSceneId);
        
        if (!hasExistingScene) {
          console.log(`Component ${component.name} exists but scene ${expectedSceneId} is missing - will regenerate`);
        }
      }
    }
    
    // Generate and write storyboard content
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