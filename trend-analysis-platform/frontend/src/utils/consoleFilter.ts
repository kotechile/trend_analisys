/**
 * Console Filter Utility
 * Filters out harmless Chrome extension errors from the console
 */

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// Function to check if error is from Chrome extension
const isChromeExtensionError = (message: string): boolean => {
  return (
    message.includes('chrome-extension://') ||
    message.includes('net::ERR_FILE_NOT_FOUND') ||
    message.includes('extensionState.js') ||
    message.includes('utils.js') ||
    message.includes('heuristicsRedefinitions.js')
  );
};

// Override console.error to filter out Chrome extension errors
console.error = (...args: any[]) => {
  const message = args.join(' ');
  if (!isChromeExtensionError(message)) {
    originalError.apply(console, args);
  }
};

// Override console.warn to filter out Chrome extension warnings
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  if (!isChromeExtensionError(message)) {
    originalWarn.apply(console, args);
  }
};

// Export function to restore original console methods if needed
export const restoreConsole = () => {
  console.error = originalError;
  console.warn = originalWarn;
};

// Export function to check if an error should be filtered
export const shouldFilterError = (message: string): boolean => {
  return isChromeExtensionError(message);
};

