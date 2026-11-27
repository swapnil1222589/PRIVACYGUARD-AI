# PRIVACYGUARD AI — Zero-Trust Privacy & Security Specification

## 1. Privacy Philosophy
Most modern web utilities transmit user documents to backend microservices or third-party AI APIs for extraction and redaction. For security teams handling confidential data, financial records, or medical information, this exposes documents to intermediate interception, cloud logging, and data leak liabilities.

**PrivacyGuard AI** adopts a **Zero-Trust Client Boundary**:
- **No Document Uploads:** Document text and tabular CSV rows never leave the browser runtime.
- **No Remote AI APIs:** All entity detection, categorization, and redactions are computed locally via deterministic TypeScript routines.
- **No Analytical Telemetry:** Zero tracking scripts, analytical cookies, or diagnostic beacon payloads are embedded.

---

## 2. Technical Boundary Guarantees

### 2.1 Network Isolation (Zero Egress)
- Network inspections confirm **0 HTTP/S outbound payloads** carrying document content.
- Bundled font and icon assets are completely local to the project bundle.
- Offline support: Once client assets are loaded, the entire application remains fully operational without an internet connection.

### 2.2 Volatile Memory & Storage Policies
- Sensitive document data is stored solely in JavaScript heap variables.
- Neither `localStorage` nor `sessionStorage` is used to persist raw text, detected PII, or pseudonym tables.
- Browser console logging of sensitive substrings is strictly avoided.
- A single-click **Reset Workspace** action purges all active buffers, cached states, and pseudonym tables from heap memory.

### 2.3 Safe Text Rendering
- Text streams are rendered via React plain-text virtual DOM nodes (`span`, `mark`) to guarantee zero exposure to cross-site scripting (XSS) or DOM injection attacks. User-supplied HTML tags are never interpreted as executable elements.

---

## 3. Legal & Compliance Disclosures

> [!IMPORTANT]
> **Format Check vs. Legal Authentication:**
> Structural validation of Indian Permanent Account Numbers (PAN), Aadhaar-shaped tokens, IPv4 addresses, and credit cards confirms mathematical and syntactic structure only. PrivacyGuard AI **does not** query government databases (such as UIDAI or the Income Tax Department) or card issuer networks, and does not verify official issuance or legal validity.
