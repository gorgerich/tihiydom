// Suppress React Three Fiber console warnings
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('THREE.') ||
     args[0].includes('WebGL') ||
     args[0].includes('R3F') ||
     args[0].includes('Multiple instances') ||
     args[0].includes('Three.js'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('THREE.') ||
     args[0].includes('WebGL') ||
     args[0].includes('R3F') ||
     args[0].includes('Multiple instances') ||
     args[0].includes('Three.js'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};