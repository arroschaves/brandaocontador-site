# PLAN: Sync All Client Folders to DB

## 1. Objective
Map every client (69+) in Supabase to their corresponding Google Drive folder.
This enables the Maestro AI Dashboard to correctly identify and display file activities for all clients, "unlocking" the CRM view.

## 2. Technical Steps

### 2.1 Services
- **Google Drive API**: Authenticate via Service Account (`credentials.json`).
- **Supabase**: Authenticate via `SUPABASE_URL` and `SUPABASE_KEY` (Service Role).

### 2.2 Algorithm
1. Retrieve all clients from DB (`SELECT id, nome FROM clientes`).
2. Retrieve the Root Folder layout from Drive (List all folders in "Brandão Contabilidade CRM").
3. **Fuzzy Match**: Loop through clients and try to find a matching folder name.
    - Match Logic: `client.nome.lower() in folder.name.lower()`.
    - Handle exact matches vs partial matches.
4. **Update DB**: `UPDATE clientes SET drive_folder_id = X WHERE id = Y`.
5. **Log**: Print Success/Fail for each client.

## 3. Execution
- Run `scripts/sync_all_clients_folders_to_db.py` once.
- Verify in Supabase Dashboard.
