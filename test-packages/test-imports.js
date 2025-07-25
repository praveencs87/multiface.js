// Test file to verify @multiface.js packages can be imported correctly
console.log('Testing @multiface.js package imports...\n');

try {
  // Test @multiface.js/fusion
  console.log('Testing @multiface.js/fusion...');
  const fusion = require('@multiface.js/fusion');
  console.log('✅ @multiface.js/fusion imported successfully');
  console.log('Available exports:', Object.keys(fusion));
  
  // Test @multiface.js/react-native
  console.log('\nTesting @multiface.js/react-native...');
  const reactNative = require('@multiface.js/react-native');
  console.log('✅ @multiface.js/react-native imported successfully');
  console.log('Available exports:', Object.keys(reactNative));
  
  // Test @multiface.js/sensors
  console.log('\nTesting @multiface.js/sensors...');
  const sensors = require('@multiface.js/sensors');
  console.log('✅ @multiface.js/sensors imported successfully');
  console.log('Available exports:', Object.keys(sensors));
  
  // Test @multiface.js/context
  console.log('\nTesting @multiface.js/context...');
  const context = require('@multiface.js/context');
  console.log('✅ @multiface.js/context imported successfully');
  console.log('Available exports:', Object.keys(context));
  
  console.log('\n🎉 All packages imported successfully!');
  
} catch (error) {
  console.error('❌ Error importing packages:', error.message);
  process.exit(1);
}
