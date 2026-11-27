import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalyticsSummary, DetectionResult, RedactionMode } from '../types';
import { isConfirmedDetection } from './detectors';

export interface PDFExportOptions {
  filename: string;
  sanitizedText: string;
  redactionMode: RedactionMode;
  analytics: AnalyticsSummary;
  detections: DetectionResult[];
  isSummaryOnly?: boolean;
}

/**
 * Generate and download a certified client-side PDF sanitization report.
 * Guaranteed 100% in-browser generation with zero network transmission.
 */
export function exportSanitizedPDF(options: PDFExportOptions): { filename: string; size: number } {
  const {
    filename,
    sanitizedText,
    redactionMode,
    analytics,
    detections,
    isSummaryOnly = false,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const outFilename = `PrivacyGuard_Sanitized_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

  // --- BRAND COLOR SYSTEM ---
  const PRIMARY_PURPLE: [number, number, number] = [147, 51, 234]; // #9333EA
  const DARK_BG: [number, number, number] = [17, 24, 39]; // #111827
  const TEXT_PRIMARY: [number, number, number] = [30, 41, 59]; // slate-800
  const TEXT_MUTED: [number, number, number] = [100, 116, 139]; // slate-500
  const SUCCESS_GREEN: [number, number, number] = [16, 185, 129];
  const DANGER_RED: [number, number, number] = [244, 63, 94];

  // ==========================================
  // PAGE 1: EXECUTIVE AUDIT & REPORT HEADER
  // ==========================================
  // Top Header Banner
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, 210, 36, 'F');

  // Accent Line
  doc.setFillColor(...PRIMARY_PURPLE);
  doc.rect(0, 35, 210, 1.5, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PRIVACYGUARD AI', 14, 16);

  // Tagline & Context
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(168, 85, 247); // Violet-400
  doc.text('Client-Side Data Privacy & PII Sanitization Engine | PromptWars × NIAT Pune', 14, 23);

  // Security Verification Stamp on Header Right
  doc.setFontSize(8);
  doc.setTextColor(52, 211, 153); // Emerald
  doc.text('✓ 100% IN-BROWSER ISOLATION • ZERO NETWORK EGRESS', 196, 23, { align: 'right' });

  // Document Metadata Table (2-column layout)
  let yPos = 46;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text('Sanitized Document Audit Certificate', 14, yPos);

  yPos += 5;
  autoTable(doc, {
    startY: yPos,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: PRIMARY_PURPLE, textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 250, 252] },
      1: { cellWidth: 132 },
    },
    body: [
      ['Target Source File', filename || 'pasted_input.txt'],
      ['Audit Timestamp', timestamp],
      ['Applied Redaction Strategy', redactionMode.toUpperCase() + ' MASKING'],
      ['Processing Location', 'Client V8 Sandboxed Heap (Zero Server Transmission)'],
      ['Confirmed PII Entities Detected', `${analytics.totalDetected} entity tokens`],
      ['Confirmed Entities Redacted', `${analytics.totalRedacted} items (${analytics.redactionEfficiency}% efficiency)`],
      ['Luhn Checksum Verification', `${analytics.luhnValidCards} Validated Payment Cards | ${analytics.luhnInvalidCards} Invalid Excluded`],
    ],
  });

  // Category Findings Breakdown Table
  const lastTable = (doc as any).lastAutoTable;
  yPos = lastTable ? lastTable.finalY + 8 : 110;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text('Entity Classification & Disposition Summary', 14, yPos);

  yPos += 4;
  const categoryRows = [
    ['Electronic Mail (Email)', analytics.categoryBreakdown.email || 0, 'RFC 5322 Regex Filter', 'REDACTED'],
    ['Indian Phone Numbers', analytics.categoryBreakdown.phone || 0, '+91 / 91 / 0 Prefix [6-9]', 'REDACTED'],
    ['Internet Protocol (IPv4)', analytics.categoryBreakdown.ip || 0, 'Dotted Quad [0-255] Octets', 'REDACTED'],
    ['Income Tax PAN', analytics.categoryBreakdown.pan || 0, 'Gov 10-Alphanumeric Shape', 'REDACTED'],
    ['Aadhaar-Shaped ID', analytics.categoryBreakdown.aadhaar || 0, '12-Digit Non-Repetitive ID', 'REDACTED'],
    ['Credit / Payment Cards', analytics.luhnValidCards || 0, 'ISO/IEC 7812 Luhn Checksum Passed', 'REDACTED'],
    ['Invalid Card Candidates', analytics.luhnInvalidCards || 0, 'Luhn Failed Checksum (Candidate Rejected)', 'EXCLUDED / PRESERVED'],
  ];

  autoTable(doc, {
    startY: yPos,
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2 },
    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold' },
    head: [['PII Category', 'Count', 'Validation Logic', 'Pipeline Status']],
    body: categoryRows,
  });

  // ==========================================
  // PAGE 2+: SANITIZED DOCUMENT CONTENT
  // ==========================================
  if (!isSummaryOnly) {
    doc.addPage();
    yPos = 20;

    // Header on Content Page
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_PRIMARY);
    doc.text('Sanitized Document Stream', 14, yPos);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Source: ${filename} | Strategy: ${redactionMode.toUpperCase()} | PII Sanitized`, 14, yPos + 5);

    yPos += 10;

    // Content container with monospace formatting
    const contentLines = doc.splitTextToSize(sanitizedText, 182);
    const lineHeight = 4.2;
    const pageHeight = 280;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    for (let i = 0; i < contentLines.length; i++) {
      if (yPos > pageHeight) {
        doc.addPage();
        yPos = 20;
        doc.setFont('courier', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
      }
      doc.text(contentLines[i], 14, yPos);
      yPos += lineHeight;
    }
  }

  // ==========================================
  // FOOTER & PAGE NUMBERING ON ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 287, 196, 287);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('PrivacyGuard AI • 100% In-Browser Privacy Protection • Confidential Sanitized Document', 14, 292);
    doc.text(`Page ${p} of ${totalPages}`, 196, 292, { align: 'right' });
  }

  // Save and download locally
  doc.save(outFilename);

  // Return download metadata
  const blob = doc.output('blob');
  return {
    filename: outFilename,
    size: blob.size,
  };
}
