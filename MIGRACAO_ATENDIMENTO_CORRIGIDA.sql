-- Migração Corrigida: Sistema de Atendimento Inteligente
-- Compatível com o workflow existente
-- Data: 2026-01-21

-- 1. Adicionar campos de mídia e classificação (compatível com workflow atual)
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS tipo_midia TEXT DEFAULT 'texto';
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS url_midia TEXT;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS transcricao_audio TEXT;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS atendimento_automatico BOOLEAN DEFAULT false;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS resposta_automatica TEXT;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS motivo_humano TEXT;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS confianca_classificacao DECIMAL(3,2);

-- 2. Ajustar coluna categoria se necessário (manter TEXT para compatibilidade)
-- A coluna categoria já existe, apenas garantir que aceita os valores corretos

-- 3. Ajustar coluna prioridade se necessário
-- Verificar se a coluna existe e qual o tipo atual
DO $$ 
BEGIN
    -- Se a coluna prioridade não existe, criar como TEXT
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atendimentos' AND column_name = 'prioridade'
    ) THEN
        ALTER TABLE atendimentos ADD COLUMN prioridade TEXT DEFAULT 'NORMAL';
    END IF;
    
    -- Se existe mas é INTEGER, converter para TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'atendimentos' 
        AND column_name = 'prioridade' 
        AND data_type = 'integer'
    ) THEN
        -- Criar coluna temporária
        ALTER TABLE atendimentos ADD COLUMN prioridade_temp TEXT;
        
        -- Converter valores
        UPDATE atendimentos SET prioridade_temp = CASE 
            WHEN prioridade = 1 THEN 'CRITICA'
            WHEN prioridade = 2 THEN 'ALTA'
            WHEN prioridade = 3 THEN 'NORMAL'
            ELSE 'NORMAL'
        END;
        
        -- Remover coluna antiga e renomear
        ALTER TABLE atendimentos DROP COLUMN prioridade;
        ALTER TABLE atendimentos RENAME COLUMN prioridade_temp TO prioridade;
    END IF;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_atendimentos_categoria ON atendimentos(categoria);
CREATE INDEX IF NOT EXISTS idx_atendimentos_prioridade ON atendimentos(prioridade);
CREATE INDEX IF NOT EXISTS idx_atendimentos_tipo_midia ON atendimentos(tipo_midia);
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON atendimentos(status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_created_at ON atendimentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_atendimentos_cliente_id ON atendimentos(cliente_id);

-- 5. Adicionar comentários explicativos
COMMENT ON COLUMN atendimentos.categoria IS 'Categoria da solicitação classificada por IA';
COMMENT ON COLUMN atendimentos.prioridade IS 'Prioridade: CRITICA, ALTA ou NORMAL';
COMMENT ON COLUMN atendimentos.tipo_midia IS 'Tipo de mídia recebida: texto, audio, imagem, documento, video';
COMMENT ON COLUMN atendimentos.url_midia IS 'URL do arquivo de mídia armazenado';
COMMENT ON COLUMN atendimentos.transcricao_audio IS 'Transcrição automática de áudio via IA';
COMMENT ON COLUMN atendimentos.atendimento_automatico IS 'Se true, foi/será atendido automaticamente pela IA';
COMMENT ON COLUMN atendimentos.resposta_automatica IS 'Resposta gerada automaticamente pela IA';
COMMENT ON COLUMN atendimentos.motivo_humano IS 'Motivo pelo qual precisa de atendimento humano';
COMMENT ON COLUMN atendimentos.confianca_classificacao IS 'Nível de confiança da IA na classificação (0.00 a 1.00)';

-- 6. Criar view para dashboard de atendimentos
CREATE OR REPLACE VIEW vw_dashboard_atendimentos AS
SELECT 
    DATE(created_at) as data,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'ABERTO' OR status = 'pendente') as pendentes,
    COUNT(*) FILTER (WHERE status = 'EM_ATENDIMENTO' OR status = 'em_atendimento') as em_atendimento,
    COUNT(*) FILTER (WHERE status = 'CONCLUIDO' OR status = 'concluido') as concluidos,
    COUNT(*) FILTER (WHERE atendimento_automatico = true) as automaticos,
    COUNT(*) FILTER (WHERE prioridade = 'CRITICA') as urgentes,
    COUNT(*) FILTER (WHERE prioridade = 'ALTA') as alta_prioridade,
    AVG(confianca_classificacao) as confianca_media
FROM atendimentos
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- 7. Criar função para calcular tempo médio de atendimento
CREATE OR REPLACE FUNCTION calcular_tempo_medio_atendimento()
RETURNS TABLE (
    categoria TEXT,
    tempo_medio_horas DECIMAL,
    total_atendimentos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        atendimentos.categoria,
        EXTRACT(EPOCH FROM AVG(updated_at - created_at)) / 3600 as tempo_medio_horas,
        COUNT(*) as total_atendimentos
    FROM atendimentos
    WHERE (status = 'CONCLUIDO' OR status = 'concluido')
    AND categoria IS NOT NULL
    GROUP BY atendimentos.categoria
    ORDER BY tempo_medio_horas DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calcular_tempo_medio_atendimento IS 'Calcula o tempo médio de atendimento por categoria';

-- 8. Mensagem de sucesso
DO $$ 
BEGIN
    RAISE NOTICE 'Migração concluída com sucesso!';
    RAISE NOTICE 'Novos campos adicionados: tipo_midia, url_midia, transcricao_audio, atendimento_automatico, resposta_automatica, motivo_humano, confianca_classificacao';
    RAISE NOTICE 'Índices criados para melhor performance';
    RAISE NOTICE 'View vw_dashboard_atendimentos criada';
    RAISE NOTICE 'Função calcular_tempo_medio_atendimento() criada';
END $$;
