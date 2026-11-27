import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';
import { RedactionModeSelector } from '../components/sanitizer/RedactionModeSelector';
import { InputWorkspace } from '../components/sanitizer/InputWorkspace';
import { SanitizerProvider } from '../context/SanitizerContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('PrivacyGuard AI — Accessibility & Keyboard Navigation', () => {
  it('renders all sidebar navigation buttons with accessible names (aria-label)', () => {
    render(<App />);
    const overviewBtns = screen.getAllByRole('button', { name: /Overview/i });
    expect(overviewBtns.length).toBeGreaterThan(0);

    const sanitizerBtns = screen.getAllByRole('button', { name: /Data Sanitizer/i });
    expect(sanitizerBtns.length).toBeGreaterThan(0);

    const findingsBtns = screen.getAllByRole('button', { name: /Findings/i });
    expect(findingsBtns.length).toBeGreaterThan(0);

    const alertsBtns = screen.getAllByRole('button', { name: /Alerts/i });
    expect(alertsBtns.length).toBeGreaterThan(0);
  });

  it('renders RedactionModeSelector as an accessible radiogroup with keyboard radio items', () => {
    let mode = 'full';
    const { rerender } = render(
      <RedactionModeSelector
        currentMode={mode as 'full' | 'partial' | 'pseudonym'}
        onChangeMode={(m) => { mode = m; }}
      />
    );

    const radiogroup = screen.getByRole('radiogroup', { name: /Redaction strategies/i });
    expect(radiogroup).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(3);

    // Initial state: Full Masking is checked
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');

    // Clicking partial switches state
    fireEvent.click(radios[1]);
    expect(mode).toBe('partial');

    rerender(
      <RedactionModeSelector
        currentMode={mode as 'full' | 'partial' | 'pseudonym'}
        onChangeMode={(m) => { mode = m; }}
      />
    );
    const updatedRadios = screen.getAllByRole('radio');
    expect(updatedRadios[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('renders InputWorkspace with accessible textarea and keyboard-activatable upload zone', () => {
    render(
      <ThemeProvider>
        <SanitizerProvider>
          <InputWorkspace />
        </SanitizerProvider>
      </ThemeProvider>
    );

    const textarea = screen.getByLabelText(/Raw text or document contents to sanitize/i);
    expect(textarea).toBeInTheDocument();

    const uploadDropZone = screen.getByRole('button', { name: /Upload document file drop zone/i });
    expect(uploadDropZone).toBeInTheDocument();
    expect(uploadDropZone).toHaveAttribute('tabindex', '0');
  });

  it('provides an accessible reset modal with role="dialog" and aria-modal="true"', () => {
    render(<App />);

    // Click Reset Workspace button
    const resetBtn = screen.getByRole('button', { name: /Reset Workspace/i });
    fireEvent.click(resetBtn);

    // Verify dialog appears with correct ARIA attributes
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'purge-modal-title');

    // Cancel modal
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
