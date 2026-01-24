Brandão Contabilidade – PRD Completo
1. Visão Geral

Este projeto consiste na criação de um site institucional moderno em Next.js 14 + TailwindCSS, que servirá de base para evolução futura em SaaS contábil, permitindo emissão de documentos fiscais eletrônicos (NF-e, CT-e, MDF-e) e portal de clientes.

Objetivos principais:

Presença digital profissional, responsiva e otimizada.

Área de login para clientes acessarem documentos.

Evolução gradual para SaaS de emissão de NF-e, CT-e e MDF-e.

2. Tecnologias

Frontend: Next.js 14, TailwindCSS, Shadcn UI

Backend: Node.js/Next.js API (para SaaS futuro)

Hospedagem: Vercel

Domínio/DNS: Cloudflare

Controle de versão: Git + GitHub

3. Estrutura de Páginas
Página	Função
/	Página inicial (landing page institucional)
/servicos	Lista de serviços contábeis oferecidos
/contato	Contato com telefone, WhatsApp e e-mail
/cliente/login	Área de cliente (protótipo)
4. Deploy

Subir repositório no GitHub.

Importar no Vercel → Deploy automático.

Configurar domínio brandaocontador.com.br no Vercel + Cloudflare (CNAME/A).

5. Roadmap Futuro
Fase 1 – Site Institucional

Landing page, serviços e contato.

Hospedagem no Vercel.

Fase 2 – Portal do Cliente (Protótipo)

Login de cliente com email/senha.

Área reservada para documentos.

Fase 3 – SaaS NF-e MVP

Upload de XMLs e emissão de NF-e (certificado A1).

Geração automática de DANFE (PDF).

Armazenamento seguro e relatórios básicos.

Fase 4 – Expansão CT-e / MDF-e

Novos módulos conforme demanda.

6. Requisitos Funcionais

 Página inicial

 Lista de serviços

 Contato com WhatsApp/Email

 Login de cliente (protótipo)

 Área de upload/download de documentos

 Notificações automáticas por e-mail

 Assinatura digital com certificado A1

 Dashboard administrativo

 Blog e newsletter

 Integração com Google Analytics / Matomo

7. Requisitos Não Funcionais

Deploy automatizado no Vercel.

Código versionado no GitHub.

DNS gerenciado via Cloudflare.

Uso de tecnologias modernas (Next.js + TailwindCSS).

Responsividade e performance otimizada.

8. Quadro Kanban Semanal (Trello/Notion)
Semana	Tarefas
Semana 1 – Estabilização	Testar responsividade, corrigir performance, títulos/meta, links, SSL
Semana 2 – Credibilidade	Página “Quem Somos”, depoimentos, termos de serviço, revisão visual
Semana 3 – Funcionalidades Cliente	Login, pastas de documentos, notificações por e-mail
Semana 4 – Integração Avançada	Assinatura digital, alertas de documentos, teste fluxo completo
Semana 5 – Marketing	Blog/novidades, newsletter, redes sociais, Analytics
Semana 6 – Automação	CI/CD, backup periódico, monitoramento de uptime

💡 Passo a passo para Trello/Notion:

Criar colunas/listas: Semana 1 → Semana 6.

Criar cada tarefa como card/item dentro da semana correspondente.

Adicionar etiquetas: “A fazer / Em andamento / Concluído”.

No Notion, criar uma Database Board e colunas semanais, importar tarefas via CSV (modelo abaixo).

9. Prompt para Documentação e PRD Atualizado

“Crie um PRD completo para o site e plataforma SaaS da Brandão Contabilidade, incluindo roadmap de implementação semanal, funcionalidades para clientes, área administrativa, integração com certificados A1 para NF-e, blog e newsletter, deploy no Vercel, domínio no Cloudflare, tecnologias utilizadas, requisitos funcionais e não funcionais, quadro Kanban pronto para Trello/Notion com passo a passo de uso.”