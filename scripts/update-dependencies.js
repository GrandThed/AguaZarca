#!/usr/bin/env node

/**
 * Script to update package.json with all required dependencies for the complete implementation
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read current package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

// Required dependencies for the complete implementation
const requiredDependencies = {
  // Core React/Next.js (likely already present)
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",

  // UI and Icons
  "react-icons": "^4.12.0",
  "lucide-react": "^0.292.0",

  // Forms and Validation
  "react-hook-form": "^7.47.0",

  // HTTP Client
  "axios": "^1.6.0",

  // State Management & Data Fetching
  "@tanstack/react-query": "^5.8.0",

  // Drag & Drop
  "react-beautiful-dnd": "^13.1.1",
  "react-dropzone": "^14.2.3",

  // Image Processing
  "browser-image-compression": "^2.0.2",

  // Notifications
  "react-toastify": "^9.1.3",

  // Cookies
  "js-cookie": "^3.0.5",

  // Utilities
  "lodash": "^4.17.21",
  "clsx": "^2.0.0",
  "classnames": "^2.3.2",

  // Date handling
  "date-fns": "^2.30.0",

  // Rich text editor (for blog)
  "@tiptap/react": "^2.1.13",
  "@tiptap/starter-kit": "^2.1.13",
  "@tiptap/extension-image": "^2.1.13",
  "@tiptap/extension-link": "^2.1.13",

  // Charts (for statistics)
  "recharts": "^2.8.0",

  // File export
  "papaparse": "^5.4.1",
}

const requiredDevDependencies = {
  // TypeScript types
  "@types/js-cookie": "^3.0.6",
  "@types/lodash": "^4.14.202",
  "@types/papaparse": "^5.3.14",
  "@types/react-beautiful-dnd": "^13.1.7",
}

// Merge dependencies
packageJson.dependencies = {
  ...packageJson.dependencies,
  ...requiredDependencies
};

packageJson.devDependencies = {
  ...packageJson.devDependencies,
  ...requiredDevDependencies
};

// Ensure scripts are present
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

const requiredScripts = {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "export": "next build && next export"
};

packageJson.scripts = {
  ...requiredScripts,
  ...packageJson.scripts
};

// Write updated package.json
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ package.json updated successfully!');
  console.log('\nAdded dependencies:');
  Object.keys(requiredDependencies).forEach(dep => {
    console.log(`  - ${dep}`);
  });
  console.log('\nRun "npm install" to install new dependencies.');
} catch (error) {
  console.error('Error writing package.json:', error);
  process.exit(1);
}