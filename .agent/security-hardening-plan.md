# Task: Security Hardening & Authentication Refactor

Implement robust security measures for the Brandão CRM, fixing vulnerabilities in authentication, route protection, and database access.

## Status: COMPLETED
## Priority: CRITICAL

---

## 🛠️ Proposed Changes

### 1. Authentication & Session Management
- [x] Install/Verify `@supabase/ssr` or optimize `@supabase/auth-helpers-nextjs`.
- [x] Refactor `lib/supabase.ts` to support both Client and Server contexts.
- [x] Update `middleware.ts` to perform real session verification using the Supabase library.
- [x] Refactor `app/login/page.tsx` to remove manual `document.cookie` and use Supabase's native session handling.

### 2. API Security
- [x] Delete or completely secure `app/api/supabase/route.ts` (currently a wide-open proxy).
- [x] Ensure all API routes (if any) check for valid user sessions.

### 3. Database Security (RLS)
- [x] Create a consolidated SQL script to:
    - Enable RLS on all tables (`clientes`, `atendimentos`, `obrigacoes_acessorias`).
    - Define policies allowing access only to authenticated users (role: `authenticated`).
    - Restrict administrative actions to users with `role: admin` in their metadata.

### 4. Code Cleanup & Hardening
- [x] Remove hardcoded credentials from scripts and SQL files.
- [x] Ensure `SameSite`, `HttpOnly`, and `Secure` flags are handled correctly via Supabase library.

---

## 📈 Verification Plan

### Automated Tests
- Run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` after changes.

### Manual Verification
1. **Bypass Attempt**: Try to access `/admin` by manually setting a fake cookie in the console. (Should fail).
2. **Proxy Attempt**: Try to access `/api/supabase` endpoint without a session. (Should fail/be gone).
3. **Database Check**: Verify in Supabase SQL Editor that `RLS` is enabled.
4. **Login Flow**: Ensure login still works and redirects correctly.
