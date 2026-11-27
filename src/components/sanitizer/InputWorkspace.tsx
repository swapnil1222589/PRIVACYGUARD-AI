import React, { useState, useRef, DragEvent } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  Play,
  FileCode,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useSanitizer } from '../../context/SanitizerContext';
import { validateFile } from '../../engine/processor';

export const InputWorkspace: React.FC = () => {
  const {
    document,
    loadRawText,
    loadCsv,
    loadSampleText,
    loadSampleCsv,
    resetWorkspace,
    isProcessing,
  } = useSanitizer();

  const [rawInput, setRawInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessInput = () => {
    if (!rawInput.trim()) {
      setErrorMessage('Please enter or paste text to sanitize.');
      return;
    }
    setErrorMessage(null);
    loadRawText(rawInput, 'pasted_input.txt');
  };

  const handleFileUpload = (file: File) => {
    setErrorMessage(null);
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    const reader = new FileReader();
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (typeof content === 'string') {
        if (isCsv) {
          loadCsv(content, file.name);
        } else {
          loadRawText(content, file.name);
        }
        setRawInput(content);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read file contents from browser filesystem.');
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-card border border-borderTheme rounded-xl p-4 shadow-card space-y-3 transition-colors">
      {/* Header with Quick Samples */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-borderTheme">
        <div>
          <h2 className="text-xs font-semibold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-primaryPurple" />
            Document Ingestion & Sanitization Stream
          </h2>
          <p className="text-[11px] text-textSecondary">
            Supports raw text streams, TXT files, and CSV datasets. Zero network egress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setErrorMessage(null);
              loadSampleText();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primaryPurple/10 hover:bg-primaryPurple/20 text-primaryPurple border border-primaryPurple/25 transition-all shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
            <span>Sample TXT</span>
          </button>

          <button
            onClick={() => {
              setErrorMessage(null);
              loadSampleCsv();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-accentCyan/10 hover:bg-accentCyan/20 text-accentCyan border border-accentCyan/25 transition-all shadow-subtle"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-accentCyan" />
            <span>Sample CSV</span>
          </button>
        </div>
      </div>

      {/* Grid: Drag & Drop Zone and Paste Textarea */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
            isDragging
              ? 'border-primaryPurple bg-primaryPurple/10'
              : 'border-borderTheme hover:border-primaryPurple/60 bg-inputBg/40 hover:bg-inputBg/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="p-2 rounded-xl bg-card border border-borderTheme text-primaryPurple shadow-subtle">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="text-xs text-textPrimary font-medium">
            <span className="text-primaryPurple font-semibold">Click to upload</span> or drag and drop
          </div>
          <span className="text-[10px] text-textSecondary">
            TXT or CSV (up to 10MB)
          </span>
        </div>

        {/* Raw Text Input Area */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-1.5">
          <textarea
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Paste sensitive text, email logs, phone directories, or CSV rows here..."
            rows={4}
            className="w-full bg-inputBg border border-borderTheme rounded-xl p-2.5 text-xs font-mono text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:border-primaryPurple transition-colors resize-none"
          />

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleProcessInput}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primaryPurple hover:opacity-95 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Process Document</span>
              </button>

              <button
                onClick={() => {
                  setRawInput('');
                  resetWorkspace();
                  setErrorMessage(null);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-textSecondary hover:text-textPrimary hover:bg-cardElevated border border-borderTheme transition-all shadow-subtle"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {/* Document metadata indicators */}
            {document && (
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-textSecondary bg-cardElevated border border-borderTheme px-2.5 py-1 rounded-lg">
                <span className="text-textPrimary font-semibold">{document.metadata.filename}</span>
                <span>•</span>
                <span>{document.metadata.charCount} chars</span>
                <span>•</span>
                <span>{document.metadata.lineCount} lines</span>
                {document.isCsv && (
                  <>
                    <span>•</span>
                    <span className="text-accentCyan font-semibold">
                      {document.metadata.rowCount} rows × {document.metadata.colCount} cols
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-dangerRed/10 border border-dangerRed/25 text-xs text-dangerRed animate-fade-in">
          <AlertCircle className="w-4 h-4 min-w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
