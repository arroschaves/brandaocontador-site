ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS drive_folder_id TEXT DEFAULT NULL;

-- Index for performance checks
CREATE INDEX IF NOT EXISTS idx_clientes_drive_folder ON public.clientes(drive_folder_id);
