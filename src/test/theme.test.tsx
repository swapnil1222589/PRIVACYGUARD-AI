import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const TestComponent = () => {
  const { theme, toggleTheme, setTheme, isDark } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="is-dark">{isDark ? 'true' : 'false'}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
    </div>
  );
};

describe('ThemeProvider & Global Theme System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('initializes with dark theme by default', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(screen.getByTestId('is-dark').textContent).toBe('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme between dark and light, updating document class and localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByText('Toggle');
    act(() => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(screen.getByTestId('is-dark').textContent).toBe('false');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('privacyguard_theme_preference')).toBe('light');

    act(() => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('privacyguard_theme_preference')).toBe('dark');
  });

  it('allows setting explicit theme mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Set Light'));
    });

    expect(screen.getByTestId('current-theme').textContent).toBe('light');

    act(() => {
      fireEvent.click(screen.getByText('Set Dark'));
    });

    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
  });
});
