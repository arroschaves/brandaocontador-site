-- 1. Adicionar mapeamento do Drive para Fazendas (Produtor Rural)
ALTER TABLE public.unidades_fiscais 
ADD COLUMN IF NOT EXISTS drive_folder_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS area_total_ha NUMERIC(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT DEFAULT NULL;

-- 2. Vincular Obrigações Acessórias a Unidades Fiscais específicas (ex: ITR da Fazenda X)
ALTER TABLE public.obrigacoes_acessorias 
ADD COLUMN IF NOT EXISTS unidade_fiscal_id UUID REFERENCES public.unidades_fiscais(id) ON DELETE SET NULL;

-- 3. Criar Tabela de Log de Sincronização do Drive (Histórico do Robô)
CREATE TABLE IF NOT EXISTS public.maestro_drive_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    unidade_fiscal_id UUID REFERENCES public.unidades_fiscais(id) ON DELETE SET NULL,
    file_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'CREATED', 'UPDATED', 'MOVED'
    status TEXT DEFAULT 'SUCCESS',
    details TEXT
);

-- 4. Criar Política RLS para logs (Se necessário)
ALTER TABLE public.maestro_drive_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.maestro_drive_sync_log
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for service role only" ON public.maestro_drive_sync_log
FOR INSERT WITH CHECK (true); -- Permitir inserção, mas idealmente restrito via função ou role
