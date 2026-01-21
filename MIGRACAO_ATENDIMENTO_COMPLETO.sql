-- Migração Completa: Sistema de Atendimento Inteligente
-- Data: 2026-01-21

-- 1. Adicionar campos de mídia e classificação automática
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS tipo_midia TEXT; -- 'texto', 'audio', 'imagem', 'documento', 'video'
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS url_midia TEXT; -- URL do arquivo de mídia
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS transcricao_audio TEXT; -- Transcrição de áudio (se aplicável)
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS atendimento_automatico BOOLEAN DEFAULT false; -- Se foi/será atendido automaticamente
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS resposta_automatica TEXT; -- Resposta gerada pela IA
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS motivo_humano TEXT; -- Por que precisa de atendimento humano
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS confianca_classificacao DECIMAL(3,2); -- 0.00 a 1.00 (confiança da IA)

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_atendimentos_categoria ON atendimentos(categoria_solicitacao);
CREATE INDEX IF NOT EXISTS idx_atendimentos_prioridade ON atendimentos(prioridade);
CREATE INDEX IF NOT EXISTS idx_atendimentos_tipo_midia ON atendimentos(tipo_midia);
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON atendimentos(status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_created_at ON atendimentos(created_at DESC);

-- 3. Criar ENUM para categorias (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categoria_atendimento') THEN
        CREATE TYPE categoria_atendimento AS ENUM (
            'CERTIDAO',
            'ALVARA',
            'CARTAO_CNPJ_IE',
            'FOLHA_PAGAMENTO',
            'GUIAS_IMPOSTOS',
            'DOCUMENTOS_FISCAIS',
            'IR_DECLARACOES',
            'SOCIETARIO',
            'OUTROS'
        );
    END IF;
END $$;

-- 4. Adicionar comentários explicativos
COMMENT ON COLUMN atendimentos.categoria_solicitacao IS 'Categoria da solicitação classificada por IA';
COMMENT ON COLUMN atendimentos.prioridade IS 'Prioridade: 1=Urgente, 2=Alta, 3=Normal';
COMMENT ON COLUMN atendimentos.tipo_midia IS 'Tipo de mídia recebida: texto, audio, imagem, documento, video';
COMMENT ON COLUMN atendimentos.url_midia IS 'URL do arquivo de mídia armazenado';
COMMENT ON COLUMN atendimentos.transcricao_audio IS 'Transcrição automática de áudio via IA';
COMMENT ON COLUMN atendimentos.atendimento_automatico IS 'Se true, foi/será atendido automaticamente pela IA';
COMMENT ON COLUMN atendimentos.resposta_automatica IS 'Resposta gerada automaticamente pela IA';
COMMENT ON COLUMN atendimentos.motivo_humano IS 'Motivo pelo qual precisa de atendimento humano';
COMMENT ON COLUMN atendimentos.confianca_classificacao IS 'Nível de confiança da IA na classificação (0.00 a 1.00)';

-- 5. Criar view para dashboard de atendimentos
CREATE OR REPLACE VIEW vw_dashboard_atendimentos AS
SELECT 
    DATE(created_at) as data,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
    COUNT(*) FILTER (WHERE status = 'em_atendimento') as em_atendimento,
    COUNT(*) FILTER (WHERE status = 'concluido') as concluidos,
    COUNT(*) FILTER (WHERE atendimento_automatico = true) as automaticos,
    COUNT(*) FILTER (WHERE prioridade = 1) as urgentes,
    COUNT(*) FILTER (WHERE prioridade = 2) as alta_prioridade,
    AVG(confianca_classificacao) as confianca_media
FROM atendimentos
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- 6. Criar função para calcular tempo médio de atendimento
CREATE OR REPLACE FUNCTION calcular_tempo_medio_atendimento()
RETURNS TABLE (
    categoria TEXT,
    tempo_medio_horas DECIMAL,
    total_atendimentos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        categoria_solicitacao,
        EXTRACT(EPOCH FROM AVG(updated_at - created_at)) / 3600 as tempo_medio_horas,
        COUNT(*) as total_atendimentos
    FROM atendimentos
    WHERE status = 'concluido'
    AND categoria_solicitacao IS NOT NULL
    GROUP BY categoria_solicitacao
    ORDER BY tempo_medio_horas DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calcular_tempo_medio_atendimento IS 'Calcula o tempo médio de atendimento por categoria';
