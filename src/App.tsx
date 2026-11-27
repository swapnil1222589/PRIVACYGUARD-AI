import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SanitizerProvider } from './context/SanitizerContext';
import { AppLayout } from './components/layout/AppLayout';

export function App() {
  return (
    <ThemeProvider>
      <SanitizerProvider>
        <AppLayout />
      </SanitizerProvider>
    </ThemeProvider>
  );
}

export default App;
