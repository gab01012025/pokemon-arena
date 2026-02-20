# 🚀 COMO FAZER DEPLOY MANUAL NO VERCEL

## ❌ PROBLEMA ATUAL

O código está sendo deployado em: `https://naruto-arena-delta.vercel.app/`
Mas deveria ir para: `https://pokearena-game.vercel.app/`

## ✅ SOLUÇÃO - Deploy Manual pelo Dashboard

### Passo 1: Acessar o Vercel Dashboard
1. Acesse: https://vercel.com/dashboard
2. Faça login com sua conta

### Passo 2: Encontrar o Projeto Correto
1. Procure pelo projeto **pokearena-game** na lista
2. Clique no projeto

### Passo 3: Fazer Deploy Manual

#### Opção A: Conectar ao GitHub (RECOMENDADO)
1. No projeto `pokearena-game`, vá em **Settings**
2. Clique em **Git**
3. Conecte ao repositório: `gab01012025/pokemon-arena`
4. Branch: `main`
5. Salve as configurações
6. O Vercel fará deploy automático a cada push

#### Opção B: Deploy via CLI (se conseguir autenticar)
```bash
cd /home/gabifran/naruto-arena

# Criar arquivo de configuração do Vercel
mkdir -p .vercel
cat > .vercel/project.json << 'EOF'
{
  "projectId": "SEU_PROJECT_ID_AQUI",
  "orgId": "team_sEC7Pmyec194uq1k2pl2UzZB"
}
EOF

# Fazer deploy
vercel --prod
```

### Passo 4: Verificar o Deploy
1. Aguarde o build terminar (1-2 minutos)
2. Acesse: https://pokearena-game.vercel.app/battle/ai
3. Verifique se as mudanças apareceram

---

## 🔍 COMO ENCONTRAR O PROJECT_ID

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto `pokearena-game`
3. Vá em **Settings** → **General**
4. Copie o **Project ID**

---

## ✅ MUDANÇAS QUE DEVEM APARECER

Quando o deploy correto for feito, você verá:

### 1. Seleção de Pokémon
- ✅ Apenas 6 Pokémon: Bulbasaur, Charmander, Squirtle, Pikachu, Eevee, Meowth
- ❌ NÃO deve mostrar: Ivysaur, Charmeleon, Venusaur, etc.

### 2. Seleção de Energia
- ✅ 8 tipos: Grass, Fire, Water, Lightning, Psychic, Fighting, Darkness, Metal
- ✅ Texto: "Choose 1-3 energy types"
- ❌ NÃO deve mostrar: Electric, Dragon, Random

### 3. Durante a Batalha
- ✅ Energias com glow effect (brilho)
- ✅ Cores corretas (Lightning amarelo, não Electric)
- ✅ Evoluções funcionam durante batalha

---

## 🐛 SE OS ERROS CONTINUAREM

Se após o deploy correto ainda houver erros no console:

1. **Limpar cache do navegador:**
   - Chrome: Ctrl+Shift+Delete
   - Marcar "Cached images and files"
   - Limpar

2. **Hard Refresh:**
   - Chrome: Ctrl+Shift+R
   - Firefox: Ctrl+F5

3. **Verificar console:**
   - F12 → Console
   - Anotar os erros exatos
   - Me enviar os erros

---

## 📞 PRECISA DE AJUDA?

Se não conseguir fazer o deploy manual:

1. Me envie o **Project ID** do `pokearena-game`
2. Me envie um print do dashboard do Vercel
3. Eu crio a configuração correta para você

---

## 🎯 RESUMO RÁPIDO

1. ✅ Código está correto no GitHub (commit `e1069a6`)
2. ❌ Deploy está indo para projeto errado
3. ✅ Solução: Conectar `pokearena-game` ao GitHub ou usar CLI com project.json

**Última atualização:** 2026-02-20
