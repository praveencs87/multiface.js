// Basic test to verify @multiface.js packages are installed and accessible
console.log('Testing @multiface.js package installation and metadata...\n');

const fs = require('fs');
const path = require('path');

const packages = [
  // Original SDK packages
  'core', 'ai', 'inputs', 'outputs', 'utils',
  // New packages for React Native and multi-modal support
  'fusion', 'react-native', 'sensors', 'context'
];

packages.forEach(pkg => {
  try {
    const packagePath = path.join(__dirname, 'node_modules', '@multiface.js', pkg);
    const packageJsonPath = path.join(packagePath, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      console.log(`✅ @multiface.js/${pkg} - Package directory exists`);
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        console.log(`   - Version: ${packageJson.version}`);
        console.log(`   - Description: ${packageJson.description}`);
        
        // Check if source files exist
        const srcPath = path.join(packagePath, 'src');
        if (fs.existsSync(srcPath)) {
          const srcFiles = fs.readdirSync(srcPath);
          console.log(`   - Source files: ${srcFiles.length} items`);
        }
        
        // Check if dist files exist
        const distPath = path.join(packagePath, 'dist');
        if (fs.existsSync(distPath)) {
          const distFiles = fs.readdirSync(distPath);
          console.log(`   - Dist files: ${distFiles.join(', ')}`);
        }
      }
    } else {
      console.log(`❌ @multiface.js/${pkg} - Package not found`);
    }
    console.log('');
  } catch (error) {
    console.error(`❌ Error checking @multiface.js/${pkg}:`, error.message);
  }
});

console.log('🎉 Package installation verification complete!');
console.log('\nNote: The packages contain TypeScript source files that need to be');
console.log('transpiled to JavaScript for direct Node.js usage. For React/TypeScript');
console.log('projects, the packages can be imported directly from the source files.');
