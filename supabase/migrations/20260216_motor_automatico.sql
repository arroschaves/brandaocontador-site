-- ============================================================
-- 🧠 MOTOR AUTOMÁTICO DE OBRIGAÇÕES — TRIGGERS E FUNÇÕES
-- Versão: 2.0 | Data: 2026-02-16
-- O CÉREBRO OPERACIONAL do sistema
-- ============================================================
-- Execute APÓS: 20260216_banco_master_completo.sql
-- ============================================================

-- ============================================================
-- FUNÇÃO: Calcular vencimento respeitando FDS e feriados
-- Suporta antecipação E postergação (DAS posterga)
-- ============================================================

CREATE OR REPLACE FUNCTION fiscal.calcular_vencimento(
    p_competencia DATE,
    p_dia_vencimento INTEGER,
    p_antecipa BOOLEAN DEFAULT TRUE,
    p_posterga BOOLEAN DEFAULT FALSE
) RETURNS DATE AS $$
DECLARE
    v_data DATE;
    v_tentativas INTEGER := 0;
BEGIN
    -- Se dia_vencimento é NULL (obrigações eventuais), retorna NULL
    IF p_dia_vencimento IS NULL THEN
        RETURN NULL;
    END IF;

    -- Monta a data base: mês seguinte à competência + dia de vencimento
    -- Trata caso do dia ser maior que dias do mês (ex: dia 31 em mês de 30)
    v_data := (p_competencia + INTERVAL '1 month');
    v_data := make_date(
        EXTRACT(YEAR FROM v_data)::INT,
        EXTRACT(MONTH FROM v_data)::INT,
        LEAST(p_dia_vencimento, (DATE_TRUNC('month', v_data) + INTERVAL '1 month - 1 day')::DATE - DATE_TRUNC('month', v_data)::DATE + 1)
    );

    -- Loop para ajustar FDS e feriados (máx 10 iterações de segurança)
    WHILE v_tentativas < 10 LOOP
        v_tentativas := v_tentativas + 1;

        -- Verificar se cai em FDS
        IF EXTRACT(DOW FROM v_data) = 0 THEN -- Domingo
            IF p_posterga THEN
                v_data := v_data + INTERVAL '1 day';
            ELSE
                v_data := v_data - INTERVAL '2 days';
            END IF;
        ELSIF EXTRACT(DOW FROM v_data) = 6 THEN -- Sábado
            IF p_posterga THEN
                v_data := v_data + INTERVAL '2 days';
            ELSE
                v_data := v_data - INTERVAL '1 day';
            END IF;
        -- Verificar se cai em feriado
        ELSIF EXISTS (SELECT 1 FROM fiscal.feriados WHERE data = v_data) THEN
            IF p_posterga THEN
                v_data := v_data + INTERVAL '1 day';
            ELSE
                v_data := v_data - INTERVAL '1 day';
            END IF;
        ELSE
            EXIT; -- Data OK
        END IF;
    END LOOP;

    RETURN v_data;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- FUNÇÃO: Gerar calendário fiscal completo para uma empresa
-- Gera 12 meses de obrigações automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION fiscal.gerar_calendario_empresa(
    p_empresa_id UUID,
    p_ano INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT
) RETURNS INTEGER AS $$
DECLARE
    v_empresa RECORD;
    v_template RECORD;
    v_competencia DATE;
    v_vencimento DATE;
    v_count INTEGER := 0;
    v_mes INTEGER;
BEGIN
    -- Buscar dados da empresa
    SELECT * INTO v_empresa FROM core.empresas WHERE id = p_empresa_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Empresa não encontrada: %', p_empresa_id;
    END IF;

    -- Para cada template que se aplica ao regime da empresa
    FOR v_template IN
        SELECT * FROM fiscal.obrigacoes_templates
        WHERE active = TRUE
        AND v_empresa.regime_tributario = ANY(regime_tributario)
    LOOP
        -- Obrigações MENSAIS: gerar 12 meses
        IF v_template.periodicidade = 'MENSAL' THEN
            FOR v_mes IN 1..12 LOOP
                v_competencia := make_date(p_ano, v_mes, 1);
                v_vencimento := fiscal.calcular_vencimento(
                    v_competencia,
                    v_template.dia_vencimento,
                    v_template.antecipa_fds,
                    COALESCE(v_template.postergavel, FALSE)
                );

                -- Não duplicar se já existe
                IF NOT EXISTS (
                    SELECT 1 FROM fiscal.calendario
                    WHERE empresa_id = p_empresa_id
                    AND template_id = v_template.id
                    AND mes_referencia = v_mes
                    AND ano_referencia = p_ano
                ) AND v_vencimento IS NOT NULL THEN
                    INSERT INTO fiscal.calendario (
                        empresa_id, template_id, mes_referencia, ano_referencia,
                        data_vencimento, status
                    ) VALUES (
                        p_empresa_id, v_template.id, v_mes, p_ano,
                        v_vencimento, 'PENDENTE'
                    );
                    v_count := v_count + 1;
                END IF;
            END LOOP;

        -- Obrigações ANUAIS: gerar 1 vez
        ELSIF v_template.periodicidade = 'ANUAL' THEN
            v_competencia := make_date(p_ano, COALESCE(v_template.mes_entrega, 12), 1);
            v_vencimento := fiscal.calcular_vencimento(
                v_competencia,
                v_template.dia_vencimento,
                v_template.antecipa_fds,
                COALESCE(v_template.postergavel, FALSE)
            );

            IF NOT EXISTS (
                SELECT 1 FROM fiscal.calendario
                WHERE empresa_id = p_empresa_id
                AND template_id = v_template.id
                AND ano_referencia = p_ano
            ) AND v_vencimento IS NOT NULL THEN
                INSERT INTO fiscal.calendario (
                    empresa_id, template_id, mes_referencia, ano_referencia,
                    data_vencimento, status
                ) VALUES (
                    p_empresa_id, v_template.id,
                    COALESCE(v_template.mes_entrega, 12), p_ano,
                    v_vencimento, 'PENDENTE'
                );
                v_count := v_count + 1;
            END IF;

        -- Obrigações TRIMESTRAIS: gerar 4 vezes
        ELSIF v_template.periodicidade = 'TRIMESTRAL' THEN
            FOREACH v_mes IN ARRAY ARRAY[3, 6, 9, 12] LOOP
                v_competencia := make_date(p_ano, v_mes, 1);
                v_vencimento := fiscal.calcular_vencimento(
                    v_competencia,
                    v_template.dia_vencimento,
                    v_template.antecipa_fds,
                    COALESCE(v_template.postergavel, FALSE)
                );

                IF NOT EXISTS (
                    SELECT 1 FROM fiscal.calendario
                    WHERE empresa_id = p_empresa_id
                    AND template_id = v_template.id
                    AND mes_referencia = v_mes
                    AND ano_referencia = p_ano
                ) AND v_vencimento IS NOT NULL THEN
                    INSERT INTO fiscal.calendario (
                        empresa_id, template_id, mes_referencia, ano_referencia,
                        data_vencimento, status
                    ) VALUES (
                        p_empresa_id, v_template.id, v_mes, p_ano,
                        v_vencimento, 'PENDENTE'
                    );
                    v_count := v_count + 1;
                END IF;
            END LOOP;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: Ao criar empresa → gerar serviços + calendário
-- O CORAÇÃO DO SISTEMA
-- ============================================================

CREATE OR REPLACE FUNCTION core.trigger_empresa_criada()
RETURNS TRIGGER AS $$
DECLARE
    v_servico RECORD;
    v_count INTEGER;
BEGIN
    -- 1. Auto-vincular todos os serviços principais
    FOR v_servico IN SELECT id FROM core.servicos WHERE ativo = TRUE LOOP
        INSERT INTO core.empresa_servicos (empresa_id, servico_id)
        VALUES (NEW.id, v_servico.id)
        ON CONFLICT (empresa_id, servico_id) DO NOTHING;
    END LOOP;

    -- 2. Registrar regime no histórico (se informado)
    IF NEW.regime_tributario IS NOT NULL THEN
        INSERT INTO core.regime_historico (empresa_id, regime, inicio, ano_fiscal)
        VALUES (NEW.id, NEW.regime_tributario, CURRENT_DATE, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
    END IF;

    -- 3. Gerar calendário fiscal do ano corrente
    IF NEW.regime_tributario IS NOT NULL THEN
        v_count := fiscal.gerar_calendario_empresa(NEW.id, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
        RAISE NOTICE 'Empresa % criada: % obrigações geradas', NEW.razao_social, v_count;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_empresa_criada ON core.empresas;
CREATE TRIGGER trg_empresa_criada
    AFTER INSERT ON core.empresas
    FOR EACH ROW
    EXECUTE FUNCTION core.trigger_empresa_criada();

-- ============================================================
-- TRIGGER: Ao alterar regime → fechar histórico + regerar
-- ============================================================

CREATE OR REPLACE FUNCTION core.trigger_regime_alterado()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Só dispara se o regime realmente mudou
    IF OLD.regime_tributario IS DISTINCT FROM NEW.regime_tributario THEN
        -- 1. Fechar regime anterior no histórico
        UPDATE core.regime_historico
        SET fim = CURRENT_DATE
        WHERE empresa_id = NEW.id AND fim IS NULL;

        -- 2. Abrir novo regime no histórico
        INSERT INTO core.regime_historico (empresa_id, regime, inicio, ano_fiscal)
        VALUES (NEW.id, NEW.regime_tributario, CURRENT_DATE, EXTRACT(YEAR FROM CURRENT_DATE)::INT);

        -- 3. Cancelar calendário futuro (obrigações não concluídas)
        UPDATE fiscal.calendario
        SET status = 'CANCELADO'
        WHERE empresa_id = NEW.id
        AND status = 'PENDENTE'
        AND data_vencimento > CURRENT_DATE;

        -- 4. Regerar calendário com novo regime
        v_count := fiscal.gerar_calendario_empresa(NEW.id, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
        RAISE NOTICE 'Regime alterado para %: % novas obrigações geradas', NEW.regime_tributario, v_count;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_regime_alterado ON core.empresas;
CREATE TRIGGER trg_regime_alterado
    AFTER UPDATE OF regime_tributario ON core.empresas
    FOR EACH ROW
    EXECUTE FUNCTION core.trigger_regime_alterado();

-- ============================================================
-- TRIGGER: Classificação automática PF/PJ pelo documento
-- (melhoria do brain_trigger existente)
-- ============================================================

CREATE OR REPLACE FUNCTION core.trigger_classificar_cliente()
RETURNS TRIGGER AS $$
BEGIN
    -- Limpar documento (apenas números)
    IF NEW.documento IS NOT NULL THEN
        NEW.documento := REGEXP_REPLACE(NEW.documento, '[^0-9]', '', 'g');

        IF LENGTH(NEW.documento) = 11 THEN
            NEW.tipo_pessoa := 'PF';
            IF NEW.regime_tributario IS NULL THEN
                NEW.regime_tributario := 'Produtor Rural';
            END IF;
        ELSIF LENGTH(NEW.documento) = 14 THEN
            NEW.tipo_pessoa := 'PJ';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_classify_cliente ON core.empresas;
CREATE TRIGGER trg_auto_classify_cliente
    BEFORE INSERT OR UPDATE OF documento ON core.empresas
    FOR EACH ROW
    EXECUTE FUNCTION core.trigger_classificar_cliente();

-- ============================================================
-- TRIGGER: Auto-atualizar status de obrigações atrasadas
-- Executar via CRON job diário
-- ============================================================

CREATE OR REPLACE FUNCTION fiscal.marcar_obrigacoes_atrasadas()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE fiscal.calendario
    SET status = 'ATRASADO'
    WHERE status = 'PENDENTE'
    AND data_vencimento < CURRENT_DATE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: Verificar certificados vencendo
-- ============================================================

CREATE OR REPLACE FUNCTION core.verificar_certificados_vencendo()
RETURNS TABLE (
    empresa TEXT,
    tipo_cert TEXT,
    titular TEXT,
    validade DATE,
    dias_restantes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.razao_social,
        c.tipo,
        c.titular,
        c.validade,
        (c.validade - CURRENT_DATE)::INTEGER AS dias_restantes
    FROM core.certificados_digitais c
    JOIN core.empresas e ON e.id = c.empresa_id
    WHERE c.status = 'ATIVO'
    AND c.validade <= CURRENT_DATE + INTERVAL '30 days'
    ORDER BY c.validade ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- VIEW: Dashboard de obrigações (para o CRM)
-- ============================================================

CREATE OR REPLACE VIEW fiscal.vw_dashboard_obrigacoes AS
SELECT
    e.id AS empresa_id,
    e.razao_social,
    e.regime_tributario,
    t.nome AS obrigacao,
    t.departamento,
    c.mes_referencia,
    c.ano_referencia,
    c.data_vencimento,
    c.status,
    CASE
        WHEN c.status = 'CONCLUIDO' THEN 'ok'
        WHEN c.data_vencimento < CURRENT_DATE AND c.status = 'PENDENTE' THEN 'atrasado'
        WHEN c.data_vencimento <= CURRENT_DATE + INTERVAL '5 days' THEN 'urgente'
        WHEN c.data_vencimento <= CURRENT_DATE + INTERVAL '15 days' THEN 'atencao'
        ELSE 'normal'
    END AS prioridade_visual
FROM fiscal.calendario c
JOIN core.empresas e ON e.id = c.empresa_id
JOIN fiscal.obrigacoes_templates t ON t.id = c.template_id
WHERE e.status = 'ATIVO';

-- ============================================================
-- VIEW: Resumo por empresa (contadores para dashboard)
-- ============================================================

CREATE OR REPLACE VIEW fiscal.vw_resumo_empresa AS
SELECT
    e.id AS empresa_id,
    e.razao_social,
    COUNT(*) FILTER (WHERE c.status = 'PENDENTE') AS pendentes,
    COUNT(*) FILTER (WHERE c.status = 'CONCLUIDO') AS concluidas,
    COUNT(*) FILTER (WHERE c.status = 'ATRASADO') AS atrasadas,
    COUNT(*) FILTER (WHERE c.data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND c.status = 'PENDENTE') AS vencendo_semana,
    COUNT(*) AS total
FROM core.empresas e
LEFT JOIN fiscal.calendario c ON c.empresa_id = e.id
WHERE e.status = 'ATIVO'
GROUP BY e.id, e.razao_social;

-- ============================================================
-- FUNÇÃO UTILITÁRIA: Soft delete de empresa
-- Nunca deletar fisicamente
-- ============================================================

CREATE OR REPLACE FUNCTION core.soft_delete_empresa(p_empresa_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE core.empresas
    SET status = 'CANCELADO', deleted_at = NOW()
    WHERE id = p_empresa_id;

    -- Cancelar todas as obrigações pendentes
    UPDATE fiscal.calendario
    SET status = 'CANCELADO'
    WHERE empresa_id = p_empresa_id AND status = 'PENDENTE';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ✅ MOTOR COMPLETO — TRIGGERS E FUNÇÕES PRONTOS
-- ============================================================
SELECT 'MOTOR AUTOMÁTICO COMPLETO — FUNÇÕES E TRIGGERS 100%' AS status;
