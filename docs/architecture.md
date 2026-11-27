# PRIVACYGUARD AI — Architectural Specification

## 1. System Overview
**PrivacyGuard AI** is a zero-trust, browser-based Personally Identifiable Information (PII) sanitization platform. Designed with enterprise cybersecurity SaaS principles, the application runs 100% locally in the client runtime without relying on remote inference APIs or cloud datastores.

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

## 2. Component Pipeline

### 2.1 File Ingestion Layer (`src/engine/processor.ts`)
- **TXT Pipeline:** Plaintext streams are validated against an in-browser size ceiling (10MB) to preserve UI responsiveness. Line endings (`\r\n` and `\n`) and whitespace formatting are preserved byte-for-byte.
- **CSV Pipeline:** Employs Papa Parse to tokenize rows and columns. Detects quoted commas, embedded newlines, and preserves empty cells without schema alteration. Each detection is annotated with its row, column, and header coordinates.

### 2.2 Classification & Detection Layer (`src/engine/detectors.ts`)
The detection pipeline resolves patterns deterministically in order of priority:
1. **Email (RFC 5322):** Strict regex boundary matching. Rejects malformed structures.
2. **IPv4:** Evaluates four decimal octets. Each octet is strictly asserted within `[0, 255]`.
3. **PAN (Permanent Account Number):** 10-character case-insensitive CBDT format (`[A-Za-z]{5}\d{4}[A-Za-z]`).
4. **Credit Cards (ISO/IEC 7812):** Matches 13–19 digit sequences (delimited by spaces or hyphens). Every candidate is validated via the **Luhn Checksum Algorithm** (`src/engine/luhn.ts`). Candidates failing the modulo-10 checksum are classified as `luhn_invalid` and segregated from valid cards.
5. **Aadhaar-shaped Numbers:** 12-digit grouped sequences with repetitive sequence rejection (e.g., `0000 0000 0000`, `1111 1111 1111`).
6. **Indian Mobile Telephony:** Identifies valid 10-digit series starting with 6, 7, 8, or 9, supporting `+91`, `91`, and `0` prefixes.

### 2.3 Overlap Resolution Strategy
All matches are sorted by:
1. Start Index Ascending (`startIndex ASC`)
2. Classification Priority Descending (`priority DESC`)
3. Match Span Length Descending (`length DESC`)

Any candidate overlapping with an accepted boundary is filtered out, preventing nested highlights or corrupted offsets.

---

## 3. Redaction Engine (`src/engine/redactor.ts`)

| Mode | Strategy Description | Example Transformation |
| :--- | :--- | :--- |
| **Full Masking** | Total eradication of sensitive entity using a uniform indicator. | `rahul@example.com` → `[REDACTED]` |
| **Partial Masking** | Retains non-sensitive context (initials, domain, last 4 digits). | `9876543210` → `XXXXXX3210`<br>`ABCDE1234F` → `XXXXX1234F` |
| **Consistent Pseudonymization** | In-memory deterministic dictionary assigning uniform tokens to identical values. | `rahul@example.com` → `USER_01`<br>`9876543210` → `PHONE_01` |

### Pseudonymization Invariant:
- Given an input string $S_1$ and category $C$, the mapping function returns $P_k = \text{Map}(C, \text{normalize}(S_1))$.
- Subsequent occurrences of $S_1$ within the session receive identical placeholder $P_k$.
- Distinct entity $S_2 \neq S_1$ within category $C$ receives $P_{k+1}$.
- Pseudonym maps exist exclusively in JavaScript volatile heap memory and are wiped on workspace reset or tab unload.

---

## 4. State Management & Lifecycle
- React Context (`SanitizerContext`) centralizes reactive state.
- **Zero LocalStorage Persistence:** Sensitive document text, detection results, and pseudonym lookup tables are explicitly forbidden from `localStorage` or `sessionStorage`.
- **Blob Generation:** Sanitized exports utilize browser-native `URL.createObjectURL(new Blob([...]))` with subsequent URL revocation to guarantee complete isolation from external networks.
