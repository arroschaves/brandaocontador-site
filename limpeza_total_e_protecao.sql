-- 1. LIMPEZA DE LIXO (Timestamps e Chaves NFe que viraram clientes)
DELETE FROM obrigacoes_acessorias 
WHERE cliente_id IN (
    SELECT id FROM clientes 
    WHERE CAST(cnpj_cpf AS TEXT) LIKE '%2025%' 
       OR CAST(cnpj_cpf AS TEXT) LIKE '%5025%' -- Chave MS
       OR CAST(cnpj_cpf AS TEXT) LIKE '%3525%' -- Chave SP
       OR CAST(cnpj_cpf AS TEXT) LIKE '%4125%' -- Chave PR
       OR CAST(cnpj_cpf AS TEXT) LIKE '%5125%' -- Chave MT
       OR LENGTH(CAST(cnpj_cpf AS TEXT)) > 14 -- Maior que um CNPJ
);

DELETE FROM clientes 
WHERE CAST(cnpj_cpf AS TEXT) LIKE '%2025%' 
   OR CAST(cnpj_cpf AS TEXT) LIKE '%5025%'
   OR CAST(cnpj_cpf AS TEXT) LIKE '%3525%'
   OR CAST(cnpj_cpf AS TEXT) LIKE '%4125%'
   OR CAST(cnpj_cpf AS TEXT) LIKE '%5125%'
   OR LENGTH(CAST(cnpj_cpf AS TEXT)) > 14;

-- 2. LIMPEZA DE PASTAS (Nomes de datas)
DELETE FROM clientes 
WHERE nome ~ '^[0-9]{2}-(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)';

-- 3. REMOVER DUPLICATAS (Mantém apenas o cadastro mais recente de cada CPF/CNPJ)
DELETE FROM clientes a USING clientes b
WHERE a.id < b.id
AND a.cnpj_cpf = b.cnpj_cpf;

-- 4. CRIAR PROTEÇÃO (Impede duplicatas no futuro e evita dados nulos na chave)
ALTER TABLE clientes ADD CONSTRAINT unique_cnpj_cpf UNIQUE (cnpj_cpf);
