-- 1. Deletar obrigações acessórias vinculadas a clientes inválidos (Timestamps e Chaves NFe)
DELETE FROM obrigacoes_acessorias 
WHERE cliente_id IN (
    SELECT id FROM clientes 
    WHERE CAST(cnpj_cpf AS TEXT) LIKE '%2025%' 
       OR CAST(cnpj_cpf AS TEXT) LIKE '%2026%'
       OR CAST(cnpj_cpf AS TEXT) LIKE '5025%'
       OR CAST(cnpj_cpf AS TEXT) LIKE '3525%'
       OR CAST(cnpj_cpf AS TEXT) LIKE '4125%'
       OR CAST(cnpj_cpf AS TEXT) LIKE '5125%'
);

-- 2. Deletar os clientes inválidos
DELETE FROM clientes WHERE CAST(cnpj_cpf AS TEXT) LIKE '%2025%';
DELETE FROM clientes WHERE CAST(cnpj_cpf AS TEXT) LIKE '%2026%';
DELETE FROM clientes WHERE CAST(cnpj_cpf AS TEXT) LIKE '5025%';
DELETE FROM clientes WHERE CAST(cnpj_cpf AS TEXT) LIKE '3525%';
DELETE FROM clientes WHERE CAST(cnpj_cpf AS TEXT) LIKE '4125%';
DELETE FROM clientes WHERE CAST(cnpj_cpf AS TEXT) LIKE '5125%';

-- 3. Deletar obrigações de clientes com nomes de datas (se sobraram)
DELETE FROM obrigacoes_acessorias 
WHERE cliente_id IN (
    SELECT id FROM clientes WHERE nome ~ '^[0-9]{2}-(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)'
);

-- 4. Deletar clientes com nomes de datas
DELETE FROM clientes 
WHERE nome ~ '^[0-9]{2}-(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)';
