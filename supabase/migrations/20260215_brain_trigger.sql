-- 1. Ajustar Tabela para Suportar PF e PJ
ALTER TABLE core.empresas 
    RENAME COLUMN cnpj TO documento;

ALTER TABLE core.empresas
    ADD COLUMN IF NOT EXISTS tipo_pessoa TEXT CHECK (tipo_pessoa IN ('PF', 'PJ')),
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS telefone TEXT,
    ADD COLUMN IF NOT EXISTS regime_tributario TEXT, -- Simples, Lucro Presumido, Produtor Rural
    ADD COLUMN IF NOT EXISTS status_analise TEXT DEFAULT 'PENDENTE_DADOS'; -- Para controle do onboarding

-- 2. O CÉREBRO: Função Gatilho para Classificar Automaticamente
CREATE OR REPLACE FUNCTION core.trigger_classificar_cliente()
RETURNS TRIGGER AS $$
BEGIN
  -- Limpar documento (deixar apenas números)
  NEW.documento := REGEXP_REPLACE(NEW.documento, '[^0-9]', '', 'g');
  
  -- Lógica de Classificação
  IF LENGTH(NEW.documento) = 11 THEN
    NEW.tipo_pessoa := 'PF';
    -- Se não foi definido regime, assume Produtor Rural para PF (regra de negócio inicial)
    IF NEW.regime_tributario IS NULL THEN
        NEW.regime_tributario := 'Produtor Rural'; 
    END IF;

  ELSIF LENGTH(NEW.documento) = 14 THEN
    NEW.tipo_pessoa := 'PJ';
  ELSE
    -- Caso venha vazio ou incompleto
    -- Mantemos o que estava ou define como Indefinido
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Ativar o Gatilho
DROP TRIGGER IF EXISTS trg_auto_classify_cliente ON core.empresas;
CREATE TRIGGER trg_auto_classify_cliente
BEFORE INSERT OR UPDATE OF documento ON core.empresas
FOR EACH ROW
EXECUTE FUNCTION core.trigger_classificar_cliente();
