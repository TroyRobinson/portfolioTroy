# Details for LLMs working on this project.

## Performance Optimization Strategies

### Data Layer Optimization (InstantDB)
- **Module Management**:
  - Pre-import the InstantDB module at component level
  - Store module in state to prevent reloading
  - Use proper dependency tracking in callbacks
- **Query Efficiency**:
  - Use single transactions for multiple operations
  - Minimize subscription scope to only needed fields
  - Structure queries consistently to maximize cache hits
- **Connection Settings**:
  - Enable persistence (`persistence: true`)
  - Use faster batching (`batchingInterval: 50`)
  - Leverage offline capabilities with proper sync strategies

### Frontend Rendering Optimization
- **Component Performance**:
  - Use `React.memo()` and `useMemo()` for expensive renders
  - Implement global cache using `Map()` for cross-component data
  - Prevent memory leaks with mount tracking via refs
- **User Experience**:
  - Replace spinners with content-shaped skeleton UI
  - Use content-preserving transitions during state changes
  - Pre-generate likely data before it's requested
  - Load data in background when tab regains visibility

### Module Loading (ESM.sh)
- **Import Strategy**:
  - Use top-level imports instead of dynamic imports in components
  - Specify only needed exports with `?exports=` for tree shaking
  - Set appropriate compilation targets with `?target=`
  - Use explicit versioning to prevent breaking changes
- **Network Optimization**:
  - Bundle operations to minimize external service calls
  - Implement fallbacks for network/module loading failures

### Performance Measurement
- **Development Tools**:
  - Profile components with React DevTools to identify bottlenecks
  - Measure operation timing with `performance.now()`
  - Audit active subscriptions to prevent unnecessary observers
- **User Metrics**:
  - Track Time to Interactive (TTI) and First Contentful Paint (FCP)
  - Analyze dependent resource loading patterns

### Anti-patterns to Avoid
- **Performance Killers**:
  - Adding artificial delays, however small
  - Creating cascading re-renders with poor state management
  - Subscribing to or requesting more data than necessary
  - Using sequential database operations instead of batching
  - Importing entire modules when only specific functions are needed

## Auto-Storyboard System

### Core Functionality
- **Automatic Component Detection**: System scans `src` directory for React components (.js, .jsx, .ts, .tsx files)
- **Scene Generation**: Creates Utopia storyboard scenes for each detected component
- **Customization Preservation**: Maintains custom scene sizes, positions, and labels during updates
- **Component Pruning**: Removes scenes for deleted components automatically

### Technical Implementation
- **Component Detection Heuristics**: Recognizes React components via multiple signals (JSX usage, React imports, hooks, capital first letters)
- **Style Prop Detection**: Detects if components accept style props via parameter analysis (`{ style }`, props objects, destructuring)
- **Export Type Analysis**: Detects whether components use default or named exports to generate correct imports
- **Component Scan Logic**: Recursively scans src directory with customizable filter patterns
- **Command Line API**: Available as stand-alone Node.js script with granular configuration options

### Scene Positioning Logic
- **Intelligent Positioning**: Places new scenes to the right of existing ones with 816px spacing
- **Special Scene Placement**: Playground at 212px, App at 992px, other components positioned relative to these
- **Intelligent Gap Filling**: Finds and utilizes gaps between existing scenes when repositioning component scenes
- **Scene Layout Preservation**: Original scene dimensions, positions, labels and other properties are preserved during updates
- **Scene Positioning Rules**: Maintains consistent 816px spacing between scenes while preserving special component positions

### File Filtering
- **Ignored Patterns**: System filters out index files, utility files by default (utils, router, spec, mock, helpers, constants, types)
- **Force Include**: Special components can be explicitly included despite matching ignore patterns via FORCE_INCLUDE array

### Error Handling
- **Unknown Components**: When component name can't be determined from scene content, scene is preserved as-is
- **Missing Scene Regeneration**: Detects components without corresponding scenes and automatically generates them
- **Conflicting Component Names**: Uses scene IDs with lowercase component names to prevent conflicts

### Available Scripts
- `npm run dev`: Starts development with auto-storyboard updating
- `npm run update-storyboard`: Manually updates storyboard while preserving configurations
- `npm run update-storyboard:all`: Includes all components in storyboard update
- `npm run update-storyboard:fresh`: Generates new storyboard without preserving configurations
- `npm run update-storyboard:no-prune`: Updates without removing scenes for deleted components

### Command Line Options
- `--include-utils`: Include utility files in the storyboard
- `--include-index`: Include index files in the storyboard
- `--verbose`: Show more detailed output with full file paths
- `--no-preserve`: Don't preserve existing scene configurations (create fresh storyboard)
- `--no-prune`: Keep scenes for components that no longer exist

