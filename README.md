# PRIVACYGUARD AI
> **Your Data. Your Browser. Your Privacy.**

[![PromptWars × NIAT Pune](https://img.shields.io/badge/Hackathon-PromptWars_%C3%97_NIAT_Pune-8B5CF6?style=for-the-badge)](https://github.com)
[![Category](https://img.shields.io/badge/Category-Cybersecurity%20%2F%20Data%20Privacy-22D3EE?style=for-the-badge)](https://github.com)
[![Privacy Boundary](https://img.shields.io/badge/Privacy-100%25%20Local%20Browser%20Engine-22C55E?style=for-the-badge)](https://github.com)
[![Tests](https://img.shields.io/badge/Tests-28%20Passed%20(Vitest)-purple?style=for-the-badge)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🛡️ Problem Statement
Modern enterprises and developers frequently need to sanitize sensitive documents, system logs, customer support transcripts, and databases before feeding them to analytics platforms, third-party LLMs, or external service providers. 

However, virtually all existing web-based sanitization tools transmit raw documents to external servers or cloud APIs for analysis. For compliance officers, cybersecurity engineers, and data privacy teams, this presents a severe vulnerability: **the very tool used to protect privacy exposes confidential data in transit and on third-party cloud infrastructure.**

---

## ⚡ Product Overview
**PrivacyGuard AI** is a privacy-first, browser-native data sanitization platform engineered like a commercial cybersecurity SaaS product. It detects, classifies, highlights, and redacts Personally Identifiable Information (PII) from raw text streams, `.txt` files, and `.csv` datasets **entirely within the user's browser runtime**.

- **Zero Cloud Ingestion:** No document contents or tokens are ever transmitted across networks.
- **Zero Remote AI APIs:** Operates using deterministic, high-throughput TypeScript algorithms.
- **Offline Usability:** Fully functional without an active internet connection once assets are loaded.
- **Zero LocalStorage Persistence:** Volatile heap memory only; purged instantly on workspace reset or tab unload.

---

## 🎯 Key Features

### 1. Independent Client-Side Detection Engine
- **Email Detection (RFC 5322):** Strict regex boundary matching with malformed email pattern rejection.
- **Indian Mobile Numbers:** Identifies 10-digit mobile series [6-9] with support for `+91`, `91`, and `0` prefixes, hyphens, and spaces.
- **IPv4 Address Validation:** Detects IPv4 candidates and verifies each octet independently within the range `[0, 255]`.
- **Indian PAN Identifiers:** Structural verification of 10-character Income Tax Permanent Account Number syntax (`ABCDE1234F`).
- **Aadhaar-Shaped Values:** 12-digit grouped sequences with rejection of repetitive digit strings (e.g., `0000 0000 0000`).
- **Credit Card Candidates & Custom Luhn Validation:** Strict ISO/IEC 7812 modulo-10 checksum calculation. Categorizes candidates into **Luhn Valid** and **Luhn Invalid**, preventing arbitrary 16-digit sequences from false-positive verification.

### 2. Tri-Mode Redaction Strategies
- **Mode 1: Full Masking:** Replaces all active entities with `[REDACTED]`.
- **Mode 2: Partial Masking:** Masks non-essential characters while retaining operational context (`r***@example.com`, `XXXXXX3210`, `XXXXX1234F`, `XXXX-XXXX-XXXX-1111`).
- **Mode 3: Consistent Pseudonymization:** Deterministically maps identical values to uniform placeholders (`USER_01`, `PHONE_01`, `PAN_01`, `CARD_01`) across repeated occurrences, enabling data science analytics without exposing identities.

### 3. Synchronized Dual-Stream Diff Viewer
- Side-by-side synchronized scrolling between raw stream and sanitized output.
- Plain-text secure rendering (zero vulnerability to XSS or DOM injection).
- Color-coded entity badges, line numbers, character counts, and prev/next entity navigation.

### 4. RFC 4180 CSV Engine
- Uses Papa Parse for high-fidelity cell-by-cell processing.
- Preserves headers, columns, quoted commas, embedded newlines, and empty cells.

### 5. Live Telemetry & Privacy Health Audit
- Dynamic dashboard with real-time calculated metrics (zero fabricated statistics).
- Live validation checksum charts and category distribution visualizers.
- Zero-telemetry audit matrix verifying local isolation and volatile heap retention.

---

## 🧩 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 18 + TypeScript | Component architecture & type-safe state |
| **Build Tool** | Vite 6 | Rapid compilation and zero-bloat bundling |
| **Styling** | Tailwind CSS | SaaS dark-mode visual system & glassmorphism |
| **Icons & Visuals** | Lucide React | Cybersecurity and enterprise iconography |
| **Data Charts** | Recharts | Reactive SVG-based telemetry visualizations |
| **CSV Engine** | Papa Parse | Cell-level parsing with RFC 4180 compliance |
| **Automated Testing**| Vitest + React Testing Library | Full unit, detector, and workflow test coverage |

---

## 📐 Architecture Diagram

```
+-------------------------------------------------------------------------+
|                          CLIENT BROWSER RUNTIME                         |
|                                                                         |
|  [ User Ingestion ] ---> [ Parser / File API ] ---> [ Raw Text / CSV ]  |
|                                                            |            |
|                                                            v            |
|                                                [ Regex & Luhn Engine ]  |
|                                                            |            |
|                                                            v            |
|  [ UI Diff & Inspector ] <--- [ Tri-Mode Redactor ] <--- [ Detections ] |
|            |                                                            |
|            v                                                            |
|  [ Local Blob Exporter ] ---> Downloaded Sanitized File (.txt / .csv)   |
+-------------------------------------------------------------------------+
                                    |
                           X  NO NETWORK EGRESS  X
```

---

## 🔍 Detection Engine & Luhn Algorithm Details

```
Luhn Algorithm Modulo-10 Checksum:
1. Strip formatting delimiters (spaces, dashes, dots).
2. Validate digit sequence length (13 to 19 digits).
3. From right to left, double every second digit starting from the penultimate digit.
4. If (digit * 2) > 9, subtract 9.
5. Sum all processed digits.
6. Valid card iff (Sum mod 10) == 0.
```

*Note: Format validation checks syntactic structure only and does not verify official identity, bank accounts, or government issuance.*

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or pnpm

### Quickstart
```bash
# 1. Clone repository
git clone https://github.com/your-username/privacyguard-ai.git
cd privacyguard-ai

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
http://localhost:5173
```

### Running Automated Tests
```bash
# Execute Vitest test suite
npm test
```

### Production Build
```bash
# Build optimized static distribution
npm run build
```

---

## 📁 Project Folder Structure

```
PRIVACYGUARD AI/
├── docs/
│   ├── architecture.md       # Technical architecture & pipeline diagrams
│   ├── privacy.md            # Zero-trust privacy verification guarantees
│   └── prompt-log.md         # Documented engineering prompt log & audit
├── src/
│   ├── components/
│   │   ├── layout/           # Sidebar, Header, and Layout components
│   │   └── sanitizer/        # InputWorkspace, DiffViewer, EntityInspector, ModeSelector
│   ├── context/
│   │   └── SanitizerContext.tsx # Central in-memory state & activity logger
│   ├── data/
│   │   ├── promptLog.ts      # Prompt log entries
│   │   └── sampleData.ts     # Synthetic test data fixtures
│   ├── engine/
│   │   ├── detectors.ts      # PII detection & deterministic overlap resolution
│   │   ├── luhn.ts           # Luhn modulo-10 card checksum validator
│   │   ├── processor.ts      # CSV parser & Blob file export pipeline
│   │   └── redactor.ts       # Tri-mode redaction & consistent pseudonymization
│   ├── pages/
│   │   ├── AboutPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DataSanitizerPage.tsx
│   │   ├── DetectionAnalyticsPage.tsx
│   │   ├── PrivacyAuditPage.tsx
│   │   ├── PromptLogPage.tsx
│   │   └── SettingsPage.tsx
│   ├── test/                 # Automated test suite (28 test cases)
│   ├── types/                # TypeScript interface definitions
│   ├── utils/                # Category colors and helpers
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔒 Privacy & Security Verification

| Privacy Guarantee | Implementation Detail | Audit Result |
| :--- | :--- | :--- |
| **No Server Backend** | Single-page static frontend without Node backend endpoints. | ✅ Certified |
| **Zero Document Uploads**| Zero `fetch()` or `XMLHttpRequest` calls carrying user data. | ✅ Certified |
| **Zero LocalStorage Leak** | No sensitive data written to `localStorage` or `sessionStorage`.| ✅ Certified |
| **Zero Telemetry** | No Google Analytics, Mixpanel, Sentry, or tracking beacons. | ✅ Certified |
| **Memory Purge** | One-click workspace reset clears heap allocations immediately. | ✅ Certified |

---

## ⚠️ Known Limitations & Roadmap
- **Browser Memory Limits:** For documents exceeding 15MB, web workers and stream chunking will be introduced in v2.0 to prevent main-thread UI jitter.
- **OCR Ingestion:** Future versions plan to integrate client-side WebAssembly-based Tesseract OCR for sanitizing images and scanned PDF documents directly in the browser.

---

## 📤 GitHub Submission Instructions
To push this project to your GitHub repository for hackathon submission:

```bash
# Initialize git if not already initialized
git init

# Add all files
git add .

# Commit project files
git commit -m "feat: complete PRIVACYGUARD AI platform for PromptWars × NIAT Pune Hackathon"

# Add your remote repository URL (replace with your repository)
git remote add origin https://github.com/your-username/privacyguard-ai.git

# Push to main branch
git branch -M main
git push -u origin main
```
