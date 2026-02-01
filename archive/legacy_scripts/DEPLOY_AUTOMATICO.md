# Deploy Automático - Brandão Contabilidade

## 🚀 Configuração Atual

### Repositório GitHub
- **URL**: https://github.com/arroschaves/brandaocontador-site
- **Branch Principal**: `main`
- **Proprietário**: Alessandro Chaves

### Vercel
- **URL de Produção**: https://brandaocontador-site-alessandro-chaves-projects.vercel.app
- **Integração**: GitHub conectado automaticamente
- **Trigger**: Deploy automático a cada push na branch `main`

## 📋 Processo de Deploy

### 1. Desenvolvimento Local
```bash
# Fazer alterações no código
# Testar localmente com:
npm run dev
```

### 2. Commit e Push
```bash
# Verificar status
git status

# Adicionar arquivos
git add .

# Commit com mensagem descritiva
git commit -m "Descrição das alterações"

# Push para GitHub
git push
```

### 3. Deploy Automático
- O Vercel detecta automaticamente o push
- Inicia o processo de build
- Deploy é realizado em poucos minutos
- URL atualizada automaticamente

## ✅ Vantagens do Deploy Automático

1. **Eficiência**: Sem necessidade de deploy manual
2. **Consistência**: Processo padronizado e confiável
3. **Rapidez**: Deploy em minutos após o push
4. **Histórico**: Controle de versões integrado
5. **Rollback**: Fácil reversão se necessário

## 🔧 Configurações Importantes

### Variáveis de Ambiente
- Configuradas diretamente no painel do Vercel
- Não expostas no código fonte
- Aplicadas automaticamente nos deploys

### Build Settings
- **Framework**: Next.js (detectado automaticamente)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 📊 Monitoramento

### Como Verificar o Status
1. Acesse o painel do Vercel
2. Verifique a aba "Deployments"
3. Monitore logs em tempo real
4. Confirme sucesso do deploy

### URLs Importantes
- **Painel Vercel**: https://vercel.com/dashboard
- **Site em Produção**: https://brandaocontador-site-alessandro-chaves-projects.vercel.app
- **Repositório GitHub**: https://github.com/arroschaves/brandaocontador-site

## 🚨 Troubleshooting

### Problemas Comuns
1. **Build Falha**: Verificar erros de sintaxe ou dependências
2. **Deploy Lento**: Aguardar conclusão (normal até 5 minutos)
3. **Alterações Não Aparecem**: Verificar se o push foi realizado

### Comandos Úteis
```bash
# Verificar status do repositório
git status

# Ver histórico de commits
git log --oneline

# Forçar push (usar com cuidado)
git push --force
```

## 📝 Histórico de Configuração

- **Data**: Janeiro 2025
- **Configurado por**: SOLO Coding Assistant
- **Versão**: Sprint 1 - Design System Implementation
- **Status**: ✅ Funcionando perfeitamente

---

**Nota**: Este documento deve ser atualizado sempre que houver mudanças na configuração de deploy.