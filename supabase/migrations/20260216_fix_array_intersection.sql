-- Correção do operador de comparação de regime
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
        AND (regime_tributario && v_empresa.regime_tributario) -- OPERADOR DE INTERSEÇÃO CORRIGIDO
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
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
