# PRIVACYGUARD AI — Engineering Prompt Log & Audit

This document maintains a transparent historical record of engineering prompts and architectural directives executed to build **PRIVACYGUARD AI** for the **PromptWars × NIAT Pune Hackathon**.

---

### Prompt 01: Core Architecture & Project Bootstrap
- **Stage:** Foundation
- **Module:** System Foundation
- **Objective:** Establish a local-first, zero-telemetry cybersecurity architecture with Vite, React, TypeScript, and Tailwind CSS adhering to enterprise SaaS aesthetics.
- **Implementation Summary:** Configured local bundle assets, TypeScript strict checking, custom cybersecurity color tokens (`#080B16`, `#111827`, `#8B5CF6`, `#22D3EE`), and glassmorphism design system.
- **Engine Output:** Pure client-side single-page application foundation with zero external backend dependencies.

---

### Prompt 02: Deterministic Regex & Luhn PII Detection Engine
- **Stage:** Detection Engine
- **Module:** Detection Engine
- **Objective:** Design a modular, client-side detection engine for Email, Indian Phone (+91/0), IPv4 octet validation, PAN, Aadhaar-shape, and Luhn credit cards.
- **Implementation Summary:** Built pure TS detectors with ISO/IEC 7812 Luhn checksum validation, IPv4 `[0, 255]` octet boundaries, priority sorting, and deterministic overlap collision resolution.
- **Engine Output:** `src/engine/detectors.ts` and `src/engine/luhn.ts` with comprehensive unit tests validating valid/invalid candidates.

---

### Prompt 03: Three-Tier Redaction & Consistent Pseudonymization
- **Stage:** Redaction & Masking
- **Module:** Redaction Engine
- **Objective:** Implement Full Masking (`[REDACTED]`), Partial Masking (`r***@...`, `XXXXXX3210`), and Consistent In-Memory Pseudonymization (`USER_01`, `PHONE_01`).
- **Implementation Summary:** Engineered an in-memory stateful mapping context ensuring identical entities receive identical pseudonyms while distinct entities increment sequentially, never persisting to disk.
- **Engine Output:** `src/engine/redactor.ts` with zero-leak mapping tables and live preview reactivity.

---

### Prompt 04: Dual-Stream Synchronized Diff & Interactive Inspector
- **Stage:** UI & Visual Diff
- **Module:** UI / UX Components
- **Objective:** Build an interactive side-by-side text comparator with synchronized scrolling, color-coded badges, entity navigation, and category toggles.
- **Implementation Summary:** Constructed responsive dual-pane viewer with line numbers, safe non-HTML escaping, entity inspector popover, category toggles, and instant clipboard copy.
- **Engine Output:** `src/components/sanitizer/DiffViewer.tsx` and `src/components/sanitizer/EntityInspector.tsx`.

---

### Prompt 05: RFC 4180 CSV & TXT Streaming with Blob Exporter
- **Stage:** UI & Visual Diff
- **Module:** File Pipeline
- **Objective:** Integrate Papa Parse for structured CSV table processing, cell coordinate mapping, and browser-native Blob download generation.
- **Implementation Summary:** Implemented row/column coordinate mapping preserving commas, escaped quotes, and empty cells, with zero-server client-side file downloads.
- **Engine Output:** `src/engine/processor.ts` ensuring clean unparsing of sensitive tabular data.

---

### Prompt 06: Privacy Health Audit & Telemetry Verification
- **Stage:** Testing & Auditing
- **Module:** Privacy & Security
- **Objective:** Deliver an uncompromised privacy audit dashboard certifying offline operation, zero external HTTP calls, and memory-only storage guarantees.
- **Implementation Summary:** Formulated live privacy status checks auditing network isolation, local blob creation, in-memory pseudonym cleanup, and session reset confirmation.
- **Engine Output:** `src/pages/PrivacyAuditPage.tsx` and 28 automated tests passing in Vitest.
