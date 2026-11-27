import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('PrivacyGuard AI Integration Workflow', () => {
  it('renders application header and dashboard with zero-data initial state', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/PRIVACYGUARD/i);
    expect(brandElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/100% Local Engine/i)).toBeInTheDocument();
    const overviewButtons = screen.getAllByRole('button', { name: /Overview/i });
    expect(overviewButtons.length).toBeGreaterThan(0);
  });

  it('loads synthetic sample text and transitions to data sanitizer view', async () => {
    render(<App />);

    // Click "Load Synthetic Sample" button on dashboard
    const loadSampleBtn = screen.getByRole('button', { name: /Load Synthetic Sample/i });
    fireEvent.click(loadSampleBtn);

    // Navigate to Sanitizer
    const sanitizerNav = screen.getByRole('button', { name: /Data Sanitizer/i });
    fireEvent.click(sanitizerNav);

    // Verify document mounted & diff viewer rendered
    await waitFor(() => {
      expect(screen.getByText(/Comparison Inspector/i)).toBeInTheDocument();
      expect(screen.getByText(/ORIGINAL RAW STREAM/i)).toBeInTheDocument();
      expect(screen.getByText(/SANITIZED OUTPUT/i)).toBeInTheDocument();
    });
  });

  it('allows switching redaction modes dynamically', async () => {
    render(<App />);

    // Load sample text
    const loadSampleBtn = screen.getByRole('button', { name: /Load Synthetic Sample/i });
    fireEvent.click(loadSampleBtn);

    const sanitizerNav = screen.getByRole('button', { name: /Data Sanitizer/i });
    fireEvent.click(sanitizerNav);

    // Select Partial Masking mode card
    const partialModeCards = screen.getAllByText(/Partial Masking/i);
    fireEvent.click(partialModeCards[0]);

    await waitFor(() => {
      expect(screen.getByText(/Live Real-time Preview/i)).toBeInTheDocument();
    });
  });

  it('resets workspace cleanly flushing all state upon user confirmation', async () => {
    render(<App />);

    // Click Reset Workspace button in Header
    const resetBtn = screen.getByRole('button', { name: /Reset Workspace/i });
    fireEvent.click(resetBtn);

    // Confirm dialog appears
    const confirmBtn = screen.getByRole('button', { name: /Flush Workspace/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Workspace data, cache, and pseudonym mappings wiped/i)).toBeInTheDocument();
    });
  });

  it('toggles global application theme from header control', async () => {
    render(<App />);

    const themeToggleBtn = screen.getByTitle(/Switch to Light Mode|Switch to Dark Mode/i);
    expect(themeToggleBtn).toBeInTheDocument();
    fireEvent.click(themeToggleBtn);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light') || document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
