# Task: Security Elite - Phase 1 Implementation

Implement the second layer of security for Brandão CRM, focusing on sensitive data protection and access auditing.

## Status: COMPLETED
## Priority: CRITICAL

---

## 🛠️ Proposed Changes

### 1. Vault Integration (Certificates A1)
- [x] Create a table `cliente_certificados` if it doesn't exist, or update `clientes` table.
- [x] Implement an API to upload/store certificates using the `vault.ts` encryption.
- [x] Ensure the password of the certificate is also encrypted.

### 2. Zero-Trust Audit Log
- [x] Create a new audit action: `VIEW_SENSITIVE`.
- [x] Implement a wrapper or utility to log every time a decrypted value is requested.
- [x] Update the UI to trigger an audit log when the user clicks to "view" a password or download a certificate.

### 3. Database RLS Hardening
- [ ] Verify if RLS is enabled on the new sensitive tables.
- [ ] Create a SQL script to enforce role-based access (Alessandro vs Staff).

### 4. Security Verification
- [ ] Run `security_scan.py`.
- [ ] Perform manual bypass tests.

---

## 📈 Verification Plan

### Automated
- `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`

### Manual
- Check `auditoria_crm` table after viewing a certificate.
- Verify that the raw data in Supabase is unreadable (encrypted).
