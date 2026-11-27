import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('PrivacyGuard AI — Theme & Navigation Interaction Verification', () => {
  it('TEST 1 & 5: Clicking theme toggle changes theme without navigating away from Data Sanitizer', async () => {
    render(<App />);

    // Navigate to Data Sanitizer
    const sanitizerNavButtons = screen.getAllByRole('button', { name: /Data Sanitizer|Sanitizer/i });
    fireEvent.click(sanitizerNavButtons[0]);

    // Verify Data Sanitizer is rendered
    expect(screen.getByRole('heading', { name: /Data Sanitizer/i })).toBeInTheDocument();

    // Find the theme toggle button (starts in Dark mode -> has label "Switch to Light Mode")
    const themeToggle = screen.getByRole('button', { name: /Switch to Light Mode/i });
    expect(themeToggle).toBeInTheDocument();

    // Click theme toggle
    fireEvent.click(themeToggle);

    // Verify:
    // 1. Data Sanitizer remains open!
    expect(screen.getByRole('heading', { name: /Data Sanitizer/i })).toBeInTheDocument();
    // 2. Light mode attribute / class is applied
    expect(window.document.documentElement.classList.contains('light')).toBe(true);
    // 3. Theme toggle now displays "Switch to Dark Mode"
    expect(screen.getByRole('button', { name: /Switch to Dark Mode/i })).toBeInTheDocument();
  });

  it('TEST 2: Opening Detection Analytics and switching theme preserves Analytics page', async () => {
    render(<App />);

    // Navigate to Analytics
    const analyticsBtn = screen.getByRole('button', { name: /Analytics/i });
    fireEvent.click(analyticsBtn);

    expect(screen.getByRole('heading', { name: /Detection Analytics/i })).toBeInTheDocument();

    // Toggle theme
    const themeBtn = screen.getByTitle(/Switch to Light Mode|Switch to Dark Mode/i);
    fireEvent.click(themeBtn);

    // Verify Detection Analytics is STILL rendered and did NOT bounce to Overview Dashboard
    expect(screen.getByRole('heading', { name: /Detection Analytics/i })).toBeInTheDocument();
  });

  it('TEST 3: Opening Settings and toggling theme keeps Settings page active', async () => {
    render(<App />);

    // Navigate to Settings
    const settingsBtn = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsBtn);

    expect(screen.getByRole('heading', { name: /Settings & Workspace Preferences/i })).toBeInTheDocument();

    // Click theme toggle in header
    const themeBtn = screen.getByTitle(/Switch to Light Mode|Switch to Dark Mode/i);
    fireEvent.click(themeBtn);

    expect(screen.getByRole('heading', { name: /Settings & Workspace Preferences/i })).toBeInTheDocument();
  });

  it('TEST 4: Opening Privacy Audit and toggling theme twice preserves Privacy Audit view', async () => {
    render(<App />);

    const auditBtn = screen.getByRole('button', { name: /Privacy Audit/i });
    fireEvent.click(auditBtn);

    expect(screen.getByRole('heading', { name: /Privacy & Security Audit/i })).toBeInTheDocument();

    const themeBtn = screen.getByTitle(/Switch to Light Mode|Switch to Dark Mode/i);
    // Toggle 1: Dark -> Light
    fireEvent.click(themeBtn);
    expect(screen.getByRole('heading', { name: /Privacy & Security Audit/i })).toBeInTheDocument();

    // Toggle 2: Light -> Dark
    const themeBtn2 = screen.getByTitle(/Switch to Light Mode|Switch to Dark Mode/i);
    fireEvent.click(themeBtn2);
    expect(screen.getByRole('heading', { name: /Privacy & Security Audit/i })).toBeInTheDocument();
  });

  it('TEST 6: Clicking Dashboard opens Overview explicitly', () => {
    render(<App />);

    // Navigate away first
    const promptsBtn = screen.getByRole('button', { name: /Prompt Log/i });
    fireEvent.click(promptsBtn);
    expect(screen.getByRole('heading', { name: /Prompt & Activity Log/i })).toBeInTheDocument();

    // Click Overview in sidebar
    const overviewBtns = screen.getAllByRole('button', { name: /Overview/i });
    fireEvent.click(overviewBtns[0]);

    expect(screen.getByText(/Browser Security Operations Center/i)).toBeInTheDocument();
  });
});
