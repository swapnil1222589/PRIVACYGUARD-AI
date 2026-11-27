/**
 * Synthetic demonstration data for PRIVACYGUARD AI.
 * All records are strictly mock/synthetic test fixtures for privacy verification.
 */

export const SAMPLE_TEXT = `PRIVACYGUARD AI — SYNTHETIC AUDIT VERIFICATION LOG
Security Incident Report: #SEC-2026-0914-DEMO
Classification: Synthetic Test Fixture (Non-Production)

CUSTOMER PROFILE & COMMUNICATIONS:
Primary Contact: Rahul Sharma
Primary Email: rahul.demo@example.com
Secondary Notification: rahul.demo@example.com
Mobile Number: +91 9876543210
Alternate Contact: 9876543210
Secondary Emergency: 09876543210
Originating Host IPv4: 192.168.1.10
Secondary Gateway IPv4: 10.0.4.15
Malformed Octet IPv4: 192.168.1.300

IDENTITY CREDENTIALS & COMPLIANCE:
Income Tax PAN Identifier: ABCDE1234F
Secondary Corporate PAN: BZTPA9876K
UIDAI Aadhaar Shape: 1234 5678 9012
Repeated Aadhaar Token: 1234 5678 9012
Invalid Aadhaar Sequence: 0000 0000 0000

PAYMENT INSTRUMENT VERIFICATION:
Valid Test Visa Card (Luhn Valid): 4111111111111111
Valid Test RuPay Candidate: 4111 1111 1111 1111
Invalid Test Card (Luhn Fails Checksum): 4111111111111112
Arbitrary 16-Digit Sequence (Non-Card): 1234567890123456

AUDIT STATEMENT:
All identifiers above are purely synthetic for testing privacy sanitization, consistent pseudonymization mapping, and local browser-based execution.
`;

export const SAMPLE_CSV = `"Employee ID","Full Name","Corporate Email","Direct Phone","Tax PAN","Assigned IP","Corporate Card (Luhn Valid)"
"EMP-101","Rahul Sharma","rahul.demo@example.com","+91 9876543210","ABCDE1234F","192.168.1.10","4111111111111111"
"EMP-102","Priya Patel","priya.demo@example.com","+91 9812345678","BKZPP4321M","192.168.1.15","4111111111111111"
"EMP-103","Rahul Sharma (Duplicate Contact)","rahul.demo@example.com","9876543210","ABCDE1234F","192.168.1.10","4111111111111112"
"EMP-104","Ananya Rao","ananya.rao@example.com","+91 9765432109","CRWPA5544J","10.200.5.88","4000000000000002"
"EMP-105","Vikram Singh","vikram.s@example.com","09890123456","DELPS8899N","172.16.0.45","4111-1111-1111-1111"
`;
