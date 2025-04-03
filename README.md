# Utopia Portfolio Project

A modern portfolio application built with React and Utopia, featuring auto-updating storyboards for component visualization in Utopia.

## Quick Start

```bash
# Start development with auto-updating storyboard
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

- **Modern React Application**: Built with React 18 and Vite for fast development
- **Auto-Storyboard System**: Components are automatically added to the Utopia storyboard
- **Component Organization**: Automatic layout of components in the storyboard view
- **Responsive Design**: Built for all device sizes
- **Optimized Performance**: Advanced caching and loading strategies for content
- **Clean Code Architecture**: DRY principles with reusable components and style consolidation

## Technology Stack

- **Frontend Framework**: React 18 with modern hooks and patterns
- **Routing**: Lightweight [wouter](https://github.com/molefrog/wouter) for client-side routing
- **UI Components**: [Radix UI](https://www.radix-ui.com/) for accessible, composable components
- **Styling**: Efficient inline CSS with style object consolidation
- **Animations**: [react-spring](https://www.react-spring.dev/) for physics-based animations
- **Data Layer**: [InstantDB](https://instantdb.com/) loaded via [ESM.sh](https://esm.sh/) for dynamic imports
- **Build System**: Vite for fast development and optimized production builds

## Architecture Highlights

- **ESM.sh Dynamic Imports**: External modules loaded on-demand to optimize initial load times
- **Code Optimization**:
  - Consolidated and reusable style objects
  - Properly memoized components
  - Clean, focused component implementation
  - Minimal, purposeful comments
- **Performance Optimizations**:
  - Pre-importing modules at component level
  - Strategic module caching to prevent reloading
  - Optimized data query patterns with InstantDB
  - Proactive content caching with in-memory Map storage
  - Component memoization with TypeScript compatibility
  - Skeleton UI for content loading states
  - Tab visibility tracking for background data prefetching
- **Accessibility**: Fully accessible components using Radix UI primitives
- **Component Structure**: Organized into reusable, modular components in a logical hierarchy

## Auto-Storyboard System

The project includes a system that automatically updates the Utopia storyboard with scenes for all your React components:

- **Component Discovery**: Automatically detects React components in your codebase
- **Smart Layout**: Positions components in a logical, organized manner
- **Custom Configuration Preservation**: Maintains your customizations when updating
- **Component Dimensions**: Automatically sizes components based on their contents
- **Subfolder Organization**: Groups components by subfolder for better organization

## Available Scripts

```bash
# Development
npm run dev            # Start with auto-updating storyboard
npm run dev:verbose    # Start with verbose storyboard logging
npm run start          # Start Vite without auto-updating storyboard

# Storyboard Management
npm run update-storyboard            # Update storyboard (standard)
npm run update-storyboard:verbose    # Update with detailed logging

# Production
npm run build          # Build for production
npm run preview        # Preview production build
```

## Customization Options

For advanced storyboard customization, you can run the update script with options:

```bash
node scripts/updateStoryboard.js [options]

Options:
  --include-utils    Include utility files in the storyboard
  --include-index    Include index files in the storyboard
  --verbose          Show more detailed output
  --no-preserve      Create fresh storyboard (don't preserve existing configurations)
  --no-prune         Keep scenes for components that no longer exist
  --help             Show this help message
```

## Project Structure

- `/src`: Application source code
  - `/components`: Reusable UI components
  - `/pages`: Application page components
  - `/utils`: Utility functions and helpers
- `/public`: Static assets
- `/utopia`: Utopia configuration files including storyboard
- `/scripts`: Build and maintenance scripts

## Code Optimization Principles

This project follows these optimization principles:
- **DRY (Don't Repeat Yourself)**: Style objects and utility components prevent duplication
- **Minimal Props**: Components accept only the props they need
- **Purposeful Comments**: Documentation focuses on complex or non-obvious functionality
- **Consistent Patterns**: Similar components follow consistent implementation patterns
- **Style Consolidation**: Repeated styles are extracted to reusable objects

For more information about this project, please contact the repository owner. 