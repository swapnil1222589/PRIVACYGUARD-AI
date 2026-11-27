import '@testing-library/jest-dom';

// Polyfill window.URL.createObjectURL and revokeObjectURL for tests
if (typeof window !== 'undefined') {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => 'blob:mock-url';
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {};
  }

  // Mock ResizeObserver for Recharts
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock anchor click to prevent jsdom navigation error
  window.HTMLAnchorElement.prototype.click = () => {};
}
