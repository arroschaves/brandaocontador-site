# Maestro Manual Mapping & Learning

## Goal
Implement a manual file mapping feature to resolve automation "blind spots" and allow the Maestro to learn from user corrections.

## Tasks
- [ ] **Task 1: Database Migration** -> Add `manual_file_id`, `manual_file_name`, and `maestro_log` columns to `obrigacoes_acessorias`.
- [ ] **Task 2: API Debug Mode** -> Update `/api/sync/audit/route.ts` to return found files when `debug: true` is sent.
- [ ] **Task 3: Manual Map Endpoint** -> Create `/api/sync/audit/manual-map/route.ts` to link an obligation to a specific file.
- [ ] **Task 4: Frontend UI - Click to Map** -> In `ClientHubPage`, make obligation items clickable to open a selection dialog.
- [ ] **Task 5: Frontend UI - Selection Dialog** -> Create a dialog that shows files from Drive and allows linking them.
- [ ] **Task 6: Maestro Learning** -> Integrate manual mapping data into the Maestro's heuristic logic in the sync API.

## Done When
- [ ] User can click a "Pendente" obligation and manually link it to a file from the Drive.
- [ ] The obligation status changes to "No Drive" (concluido) immediately.
- [ ] The Maestro records this mapping for future analysis and learning.

## Notes
- This approach stops the "Maestro logic war" and gives control back to the user while improving the AI.
