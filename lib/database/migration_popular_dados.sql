-- ============================================================================
-- MIGRATION: Popular Dados Existentes - Certificados Digitais
-- Descrição: Migra dados de cliente_certificados para certificados_digitais
-- Autor: Antigravity AI
-- Data: 2026-02-06
-- ============================================================================

-- Este script popula a tabela certificados_digitais com base nos dados
-- já existentes na tabela cliente_certificados (vault)

-- IMPORTANTE: Execute APENAS APÓS executar migration_dashboard_widgets.sql

-- ============================================================================
-- POPULAR certificados_digitais a partir de cliente_certificados
-- ============================================================================

INSERT INTO certificados_digitais (
    cliente_id,
    tipo,
    data_emissao,
    data_vencimento,
    arquivo_id,
    senha_criptografada,
    observacoes,
    metadata,
    status
)
SELECT 
    cc.cliente_id,
    -- Mapear tipo: certificado_cnpj → cnpj_a1, certificado_cpf → cpf_a1
    CASE 
        WHEN cc.tipo = 'certificado_cnpj' THEN 'cnpj_a1'::text
        WHEN cc.tipo = 'certificado_cpf' THEN 'cpf_a1'::text
        WHEN cc.tipo LIKE '%a1%' OR cc.tipo LIKE '%A1%' THEN 
            CASE 
                WHEN cc.tipo LIKE '%cpf%' OR cc.tipo LIKE '%CPF%' THEN 'cpf_a1'::text
                ELSE 'cnpj_a1'::text
            END
        ELSE 'cnpj_a1'::text -- Fallback para CNPJ A1
    END as tipo,
    cc.created_at as data_emissao,
    cc.data_vencimento,
    cc.id as arquivo_id,
    cc.senha_dados as senha_criptografada,
    'Migrado de cliente_certificados' as observacoes,
    jsonb_build_object(
        'arquivo_original', cc.nome_arquivo,
        'senha_iv', cc.senha_iv,
        'senha_tag', cc.senha_tag,
        'arquivo_iv', cc.arquivo_iv,
        'arquivo_tag', cc.arquivo_tag,
        'tipo_original', cc.tipo,
        'migrado_de', 'cliente_certificados',
        'data_migracao', NOW()
    ) as metadata,
    -- Calcular status baseado na data de validade
    CASE 
        WHEN cc.data_vencimento IS NULL THEN 'ativo'::text
        WHEN cc.data_vencimento < CURRENT_DATE THEN 'vencido'::text
        ELSE 'ativo'::text
    END as status
FROM cliente_certificados cc
WHERE cc.tipo IS NOT NULL
  -- Evitar duplicatas
  AND NOT EXISTS (
      SELECT 1 FROM certificados_digitais cd 
      WHERE cd.arquivo_id = cc.id
  )
ORDER BY cc.created_at DESC;

-- Mensagem de resultado
DO $$
DECLARE
    total_migrados INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_migrados 
    FROM certificados_digitais 
    WHERE metadata->>'migrado_de' = 'cliente_certificados';
    
    RAISE NOTICE '✅ Migrados % certificados A1 de cliente_certificados', total_migrados;
    RAISE NOTICE '📝 Certificados A3 (CPF e CNPJ) devem ser cadastrados manualmente no CRM';
END $$;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Contar quantos certificados foram migrados
SELECT COUNT(*) as total_migrados FROM certificados_digitais WHERE metadata->>'migrado_de' = 'cliente_certificados';

-- Ver resumo por tipo
SELECT 
    tipo,
    status,
    COUNT(*) as quantidade
FROM certificados_digitais
GROUP BY tipo, status
ORDER BY tipo, status;

-- ============================================================================
-- POPULAR certidoes_negativas (se houver dados em outra tabela)
-- ============================================================================

-- Caso você tenha certidões em documents ou outra tabela, ajuste aqui:
-- Exemplo (COMENTADO - ajuste conforme sua estrutura):

/*
INSERT INTO certidoes_negativas (
    cliente_id,
    tipo,
    numero,
    data_emissao,
    data_vencimento,
    arquivo_url,
    status
)
SELECT 
    d.cliente_id,
    'federal' as tipo, -- Ajustar lógica de detecção
    d.numero_documento as numero,
    d.data_emissao,
    d.data_validade as data_vencimento,
    d.arquivo_url,
    CASE 
        WHEN d.data_validade < CURRENT_DATE THEN 'vencida'
        ELSE 'valida'
    END as status
FROM documents d
WHERE d.tipo_documento = 'certidao_negativa' -- Ajuste o filtro
  AND NOT EXISTS (
      SELECT 1 FROM certidoes_negativas cn 
      WHERE cn.cliente_id = d.cliente_id 
        AND cn.numero = d.numero_documento
  );
*/

-- ============================================================================
-- CRIAR ALERTAS AUTOMÁTICOS PARA VENCIMENTOS PRÓXIMOS
-- ============================================================================

-- Criar agendamentos automáticos para certificados que vencem em < 60 dias
INSERT INTO agendamentos_pendencias (
    cliente_id,
    tipo_pendencia,
    descricao,
    data_vencimento,
    alertas_config,
    status
)
SELECT 
    cd.cliente_id,
    'certificado_vencendo' as tipo_pendencia,
    'Renovação de Certificado ' || 
        CASE cd.tipo
            WHEN 'cpf_a1' THEN 'CPF A1'
            WHEN 'cpf_a3' THEN 'CPF A3'
            WHEN 'cnpj_a1' THEN 'CNPJ A1'
            WHEN 'cnpj_a3' THEN 'CNPJ A3'
        END as descricao,
    cd.data_vencimento,
    jsonb_build_object(
        'dias_antes', ARRAY[30, 15, 7, 3, 1],
        'canais', ARRAY['sistema', 'email']
    ) as alertas_config,
    'pendente' as status
FROM certificados_digitais cd
WHERE cd.status = 'ativo'
  AND cd.data_vencimento BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '60 days')
  -- Evitar duplicatas
  AND NOT EXISTS (
      SELECT 1 FROM agendamentos_pendencias ap
      WHERE ap.cliente_id = cd.cliente_id
        AND ap.tipo_pendencia = 'certificado_vencendo'
        AND ap.descricao LIKE '%' || cd.tipo || '%'
        AND ap.status = 'pendente'
  );

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Mostrar resumo completo
SELECT 
    'certificados_digitais' as tabela,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE status = 'ativo') as ativos,
    COUNT(*) FILTER (WHERE status = 'vencido') as vencidos
FROM certificados_digitais

UNION ALL

SELECT 
    'certidoes_negativas' as tabela,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE status = 'valida') as ativos,
    COUNT(*) FILTER (WHERE status = 'vencida') as vencidos
FROM certidoes_negativas

UNION ALL

SELECT 
    'agendamentos criados' as tabela,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE tipo_pendencia = 'certificado_vencendo') as certificados,
    NULL as vencidos
FROM agendamentos_pendencias
WHERE tipo_pendencia = 'certificado_vencendo';

-- ============================================================================
-- FIM DA MIGRATION DE DADOS
-- ============================================================================

-- LOGS
DO $$
BEGIN
    RAISE NOTICE '✅ Migration de dados concluída!';
    RAISE NOTICE '📊 Verifique os resultados acima';
    RAISE NOTICE '🔔 Alertas automáticos criados para certificados vencendo';
END $$;
