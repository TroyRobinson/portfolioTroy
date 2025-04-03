# Details for LLMs working on this project as it pertains to external resources. 

## Performance Optimization Strategies

### Style & Component Patterns
- **Style Organization**:
  - Consolidate repeated styles into style objects at component level
  - Use reusable styled components for common design patterns
  - Apply default values to style props (e.g., `style = {}`) to prevent errors
  - Create style object groups for logical sections of complex components
- **Component Architecture**:
  - Extract complex UI logic into custom hooks when appropriate
  - Split large components into smaller, focused pieces
  - Use consistent style and prop patterns across related components

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
- **Transaction Batching**:
  - Always batch related operations into a single transaction when possible
  - Use array-based operations for bulk updates/deletes
  - Implement retry logic for critical operations
- **Error Handling**:
  - Always implement try/catch blocks around database operations
  - Set explicit timeouts for operations that might hang
  - Provide user feedback during lengthy operations

### Frontend Rendering Optimization
- **Component Performance**:
  - Use `React.memo()` and `useMemo()` for expensive renders
  - Implement global cache using `Map()` for cross-component data
  - Prevent memory leaks with mount tracking via refs
  - Add default prop values to memoized components for TypeScript compatibility
- **User Experience**:
  - Replace spinners with content-shaped skeleton UI
  - Use content-preserving transitions during state changes
  - Pre-generate likely data before it's requested
  - Load data in background when tab regains visibility
  - Implement minimum loading times to prevent UI flicker (typically 100-200ms)
  - Use visibility tracking to prefetch related content when tab becomes visible

### Content Caching Strategies
- **Proactive Caching**:
  - Pre-generate and cache common data at module initialization time
  - Use slug-based cache keys for predictable retrieval
  - Implement visibility tracking to prefetch content when tab regains focus
- **Cache Management**:
  - Use simple Map() for in-memory caching with string keys
  - Ensure cached data is normalized for consistent rendering

### Module Loading (ESM.sh)
- **Import Strategy**:
  - Use top-level imports instead of dynamic imports in components
  - Specify only needed exports with `?exports=` for tree shaking
  - Set appropriate compilation targets with `?target=`
  - Use explicit versioning to prevent breaking changes
- **Network Optimization**:
  - Bundle operations to minimize external service calls
  - Implement fallbacks for network/module loading failures

### External Component Libraries (Radix UI)
- **Import Optimization**:
  - Import only the specific components needed from Radix
  - Use namespace imports to organize related components
  - Properly memoize components that wrap Radix primitives
- **Style Integration**:
  - Apply consistent styling patterns when using Radix components
  - Use composition rather than extending Radix components

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
  - Unnecessary comments that explain obvious operations
  - Over-commented code that makes maintenance difficult
- **Style Anti-patterns**:
  - Repeating the same style objects across multiple components
  - Inconsistent style organization between related components
  - Using hardcoded values instead of extracting to style objects