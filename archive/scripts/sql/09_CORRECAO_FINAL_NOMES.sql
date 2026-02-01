-- ========================================
-- SCRIPT DE CORREÇÃO FINAL
-- Corrige TODOS os problemas identificados
-- ========================================

-- PROBLEMA 1: Nomes com timestamp (formato: 2026-01-26T15:47:52.234-03:00)
-- Esses clientes precisam ter o nome restaurado manualmente

-- Primeiro, vamos ver quais são:
SELECT 
    id,
    nome,
    razao_social,
    cnpj_cpf,
    email
FROM clientes
WHERE nome ~ '^\d{4}-\d{2}-\d{2}T'  -- Regex para detectar timestamps
ORDER BY nome;

-- CORREÇÃO: Substituir timestamps por nomes corretos
-- Baseado na lista que você enviou:

UPDATE clientes SET nome = 'LUIZ MARIO' 
WHERE id = '094d6c27-5cb6-44f0-bf9f-4f65d28aa78d';

UPDATE clientes SET nome = 'AABB SIDROLANDIA' 
WHERE id = '26c598e9-508f-4138-b324-795feb9859bd';

UPDATE clientes SET nome = 'E. RODRIGUERO' 
WHERE id = '0f4ec71d-08d6-4f35-86e5-206e0c55759d';

UPDATE clientes SET nome = 'IGNACIO TRANSPORTES' 
WHERE id = '8dc67625-70d9-48e6-91d9-a1deabace2a2';

UPDATE clientes SET nome = 'FRUTILANDIA' 
WHERE id = '6eb4f1db-89a3-4e73-8926-ea9ddb11a078';

UPDATE clientes SET nome = 'PONTOCOM' 
WHERE id = '2dd5ccd2-cb92-4373-a16b-0409e4953a72';

UPDATE clientes SET nome = 'AGROPECUARIA ITAOCA' 
WHERE id = 'a3ec4908-b3bb-4622-9f0b-3a1f1c5a9759';

UPDATE clientes SET nome = 'ANA LUCIA FRISO' 
WHERE id = '691a025a-c2c5-4cc7-8b69-5d4d52ecaaf1';

UPDATE clientes SET nome = 'RESTAURANTE COMIDA CASEIRA' 
WHERE id = '34b68103-4494-42f5-adc8-4bdd44c352ee';

UPDATE clientes SET nome = 'DORIVAL BASSO' 
WHERE id = '36d4ccd3-0ecf-41bd-8000-fe4b87f795f1';

UPDATE clientes SET nome = 'WANESSA DUQUE' 
WHERE id = '24391511-15b1-41e0-b981-16217a3ca395';

UPDATE clientes SET nome = 'E. A. SORRILHA' 
WHERE id = '320b2346-e722-4e6c-aa36-5bb1778eddcd';

UPDATE clientes SET nome = 'ELVIS LEANDRO' 
WHERE id = '60c6ebdf-1173-49df-a435-dcff1fe37479';

UPDATE clientes SET nome = 'D. F. DOS SANTOS' 
WHERE id = 'f075eda0-aaed-49c2-a0fe-4c6246c4d256';

UPDATE clientes SET nome = 'GABARDO COMERCIAL' 
WHERE id = '0dd68bbc-050c-4393-ac8d-28920075fccc';

UPDATE clientes SET nome = 'ITACIR BONADIMAN' 
WHERE id = '4f627487-77c8-46fd-8a6f-69909f674083';

UPDATE clientes SET nome = 'JULIO BRITA' 
WHERE id = '75b9b38d-6512-4b25-bb20-d20942228e73';

UPDATE clientes SET nome = 'J. P. ALCARAS' 
WHERE id = 'f2bf9e92-0d20-4fa1-ae55-30e048e34ab5';

UPDATE clientes SET nome = 'MARCOS BRUNO NANTES' 
WHERE id = '5ee9d905-57e3-42f1-9d3e-c5df53c5e1c8';

UPDATE clientes SET nome = 'MAURICIO GARCIA' 
WHERE id = '8873801d-e19f-4c2c-aefb-4f0406b1d7b2';

UPDATE clientes SET nome = 'MG PETS' 
WHERE id = '67807290-bc7f-4387-ad44-3d511b654efe';

UPDATE clientes SET nome = 'RISALVA LACERDA' 
WHERE id = 'd0907d08-4a67-4a0f-ad77-fad91b76be47';

UPDATE clientes SET nome = 'NILO FRUTILANDIA' 
WHERE id = 'fd2de9c0-15d1-4661-a51a-c2527e62f58f';

UPDATE clientes SET nome = 'W. P. FRANCA' 
WHERE id = 'f12f137c-45d1-401a-8136-c783b30c3ae0';

UPDATE clientes SET nome = 'DENISE GRANATA' 
WHERE id = 'f1155760-2099-448d-8133-bdc0891a148e';

UPDATE clientes SET nome = 'MAP MADEIRAS' 
WHERE id = '7d861f7d-c63f-430d-a59d-2f535985a0a0';

UPDATE clientes SET nome = 'BRANDAO CONTABILIDADE' 
WHERE id = '2a2c7e1b-ade6-412d-a8be-552f0290b5fb';

UPDATE clientes SET nome = 'AROLDO CORREA' 
WHERE id = '7c10ea9e-91c3-4615-b8d5-6a95c7f8bb47';

UPDATE clientes SET nome = 'AROLDO CORREA JR' 
WHERE id = 'c1e492f4-0a2f-4470-8932-1aeb1366554e';

UPDATE clientes SET nome = 'CAMPESTRE FLORES' 
WHERE id = '247a9731-cb49-4f77-8f2e-d9f2582e9b7c';

UPDATE clientes SET nome = 'DENISE GRANATA SOUZA' 
WHERE id = '5692495d-e353-4e60-ba53-556c7be0d44d';

UPDATE clientes SET nome = 'ODON BARBOSA' 
WHERE id = '1275d61d-b1d8-41a1-9aec-fc5198332740';

UPDATE clientes SET nome = 'L. H. C. BENITES' 
WHERE id = '614fb008-4f04-4207-9394-3564cea3f348';

UPDATE clientes SET nome = 'TV PLANALTO' 
WHERE id = '154269c6-524a-4aaf-9600-d6bb108d4ebe';

-- Verificar correção
SELECT 
    COUNT(*) as total_clientes,
    SUM(CASE WHEN nome ~ '^\d{4}-\d{2}-\d{2}T' THEN 1 ELSE 0 END) as ainda_com_timestamp,
    SUM(CASE WHEN nome IS NULL THEN 1 ELSE 0 END) as nomes_vazios
FROM clientes;

-- Deve mostrar: ainda_com_timestamp = 0, nomes_vazios = 0

-- Ver todos os clientes corrigidos
SELECT id, nome, razao_social, cnpj_cpf
FROM clientes
ORDER BY nome
LIMIT 69;
