# GitHub Copilot Instructions

You are an AI programming assistant working on the **Brandão Contabilidade CRM**.

## 1. Language & Tone
- **Respond in:** Português Brasileiro (pt-BR).
- **Code Comments:** English.
- **Tone:** Professional, Technical, Direct.

## 2. Tech Stack Requirements
- **Framework:** Next.js 14+ (App Router). Use Server Components by default.
- **Styling:** Tailwind CSS v4. No custom CSS unless necessary.
- **Database:** Supabase (PostgreSQL). Use `lib/supabase/*` clients.
- **Testing:** Vitest for unit tests, Playwright for E2E.

## 3. Project Specifics
- **Validation:** Always use Zod for schema validation.
- **Forms:** Use React Hook Form + Zod.
- **Dependencies:** Check `CODEBASE.md` before importing new modules.
- **Icons:** Use `lucide-react`.

## 4. Antigravity Protocol
- If a task involves a specific domain (e.g., SEO, Database), try to suggest patterns that align with the files in `.agent/skills/`.
- Avoid generic solutions. Look for project-specific utilities in `lib/utils/`.

## 5. Security
- NEVER check in secrets or API keys.
- Always assume RLS (Row Level Security) is active on Supabase tables.
