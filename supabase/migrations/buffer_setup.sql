-- Tabela temporária no schema PUBLIC (onde a API sempre funciona)
CREATE TABLE IF NOT EXISTS public.buffer_empresas (
    id UUID DEFAULT uuid_generate_v4(),
    razao_social TEXT,
    drive_folder_id TEXT,
    status TEXT DEFAULT 'PENDENTE'
);

-- Permissão total
GRANT ALL ON public.buffer_empresas TO anon, authenticated, service_role;
