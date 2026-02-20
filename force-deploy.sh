#!/bin/bash

# Script para forçar deploy no projeto correto do Vercel
# Uso: ./force-deploy.sh [PROJECT_ID]

set -e

PROJECT_ID="${1}"
ORG_ID="team_sEC7Pmyec194uq1k2pl2UzZB"

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Erro: PROJECT_ID não fornecido"
    echo ""
    echo "📝 Como usar:"
    echo "  ./force-deploy.sh prj_xxxxxxxxxxxxx"
    echo ""
    echo "🔍 Como encontrar o PROJECT_ID:"
    echo "  1. Acesse: https://vercel.com/dashboard"
    echo "  2. Clique no projeto 'pokearena-game'"
    echo "  3. Vá em Settings → General"
    echo "  4. Copie o Project ID"
    exit 1
fi

echo "🚀 Configurando deploy para projeto correto..."
echo "   Project ID: $PROJECT_ID"
echo "   Org ID: $ORG_ID"
echo ""

# Criar diretório .vercel se não existir
mkdir -p .vercel

# Criar arquivo de configuração
cat > .vercel/project.json << EOF
{
  "projectId": "$PROJECT_ID",
  "orgId": "$ORG_ID"
}
EOF

echo "✅ Configuração criada em .vercel/project.json"
echo ""

# Verificar se está no branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Aviso: Você está no branch '$CURRENT_BRANCH', não 'main'"
    echo "   Mudando para main..."
    git checkout main
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Aviso: Há mudanças não commitadas"
    echo "   Fazendo commit..."
    git add -A
    git commit -m "chore: Atualizar configuração do Vercel"
fi

# Push para garantir que está atualizado
echo "📤 Enviando para GitHub..."
git push origin main

echo ""
echo "🔨 Fazendo deploy para produção..."
vercel --prod --yes

echo ""
echo "✅ Deploy concluído!"
echo "🌐 Verifique em: https://pokearena-game.vercel.app/"
