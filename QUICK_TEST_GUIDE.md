# 🚀 Guia Rápido de Testes

## ⚡ Testes Rápidos (5 minutos)

### 1. Executar Todos os Testes Automatizados
```bash
npm test
```

**Resultado Esperado:**
```
✓ src/app/battle/ai/__tests__/integration.test.ts (7 tests)
✓ src/app/battle/ai/__tests__/battle.test.ts (70 tests)
✓ src/engine/__tests__/engine.test.ts (17 tests)
✓ src/engine/__tests__/characters.test.ts (42 tests)

Test Files  4 passed (4)
Tests  136 passed (136) ✅
```

---

### 2. Teste Manual Rápido no Navegador

#### Passo 1: Iniciar o servidor
```bash
npm run dev
```

#### Passo 2: Abrir a batalha
Navegue para: `http://localhost:3000/battle/ai`

#### Passo 3: Teste Rápido (2 minutos)
1. **Seleção de Energia:**
   - [ ] Selecionar 4 energias diferentes
   - [ ] Verificar que botão "START BATTLE" fica habilitado
   - [ ] Iniciar batalha

2. **Primeiro Turno:**
   - [ ] Verificar no log: "Turn 1 - Gained 1 energy!"
   - [ ] Verificar que tem apenas 1 energia no pool

3. **Acumulação:**
   - [ ] Não gastar toda energia
   - [ ] Passar turno
   - [ ] Verificar que energia acumulou (não resetou)

4. **Turnos Alternados:**
   - [ ] Seu turno: Pode selecionar ações
   - [ ] Clicar "END TURN"
   - [ ] Turno da IA: NÃO pode selecionar ações
   - [ ] Volta para seu turno

5. **Type Effectiveness:**
   - [ ] Usar ataque Water contra Fire → Ver "super effective!"
   - [ ] Usar ataque Fire contra Water → Ver "not very effective..."

**Se todos esses 5 pontos funcionarem, o sistema está OK!** ✅

---

## 🔍 Teste Completo (30 minutos)

### Seguir o checklist completo:
Ver arquivo: `TESTING_CHECKLIST.md`

**Categorias:**
1. Sistema de Energia (4 testes)
2. Sistema de Turnos (2 testes)
3. Type Effectiveness (4 testes)
4. Status Effects (10 testes)
5. Sistema de Evolução (2 testes)
6. Trainers e Passivas (7 testes)
7. Sistema de Itens (9 testes)
8. Backgrounds e UI (3 testes)
9. Habilidades Responsivas (4 testes)
10. Vitória e Derrota (3 testes)

---

## 🐛 Como Reportar Bugs

Se encontrar algum bug durante os testes:

### 1. Documentar o Bug
```markdown
## Bug: [Título Descritivo]

**Categoria:** [Energia/Turnos/Status/etc]

**Passos para Reproduzir:**
1. ...
2. ...
3. ...

**Resultado Esperado:**
...

**Resultado Atual:**
...

**Screenshots/Logs:**
...
```

### 2. Adicionar ao arquivo
Adicionar no final de `TESTING_CHECKLIST.md` na seção "🐛 Bugs Encontrados"

---

## ✅ Checklist de Validação Final

Antes de considerar COMPLETO, verificar:

- [ ] **Testes Automatizados:** 136/136 passando
- [ ] **Energia:** Acumula corretamente
- [ ] **Turnos:** Alternados (não simultâneos)
- [ ] **Primeiro Turno:** Apenas 1 energia
- [ ] **Seleção:** Exatamente 4 energias
- [ ] **Type Effectiveness:** Super/Not Very/No Effect funcionam
- [ ] **Status Effects:** Pelo menos 5 tipos testados
- [ ] **Evolução:** Funciona e aumenta stats
- [ ] **Trainers:** Pelo menos 2 passivas testadas
- [ ] **Itens:** Pelo menos 3 itens testados
- [ ] **UI:** Background aparece, borda dourada no targeting

**Se todos os itens acima estiverem OK, o sistema está VALIDADO!** 🎉

---

## 📊 Resultados dos Testes

### Última Execução
**Data:** 20/02/2026
**Testes Automatizados:** ✅ 136/136 (100%)
**Testes Manuais:** ⏳ Pendente

### Histórico
| Data | Testes Auto | Testes Manuais | Status |
|------|-------------|----------------|--------|
| 20/02/2026 | 136/136 ✅ | Pendente | 🟡 |

---

## 🎯 Critérios de Aceitação

### Para considerar PRONTO PARA PRODUÇÃO:
1. ✅ Todos os testes automatizados passando (136/136)
2. ⏳ Pelo menos 80% dos testes manuais validados
3. ⏳ Zero bugs críticos
4. ⏳ Performance aceitável (< 2s load, 60fps)
5. ⏳ UI responsiva e sem glitches

**Status Atual:** 🟡 Em Validação

---

## 🚀 Comandos Úteis

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Executar testes
npm test

# Executar testes em watch mode
npm test -- --watch

# Build de produção
npm run build

# Iniciar produção
npm start
```

### Testes Específicos
```bash
# Apenas testes de batalha
npm test -- battle.test.ts

# Apenas testes de integração
npm test -- integration.test.ts

# Com cobertura
npm test -- --coverage
```

---

## 📞 Suporte

**Documentação Completa:**
- `IMPLEMENTATION_SUMMARY.md` - Resumo técnico completo
- `TESTING_CHECKLIST.md` - Checklist detalhado de testes
- `README.md` - Documentação geral do projeto

**Arquivos de Teste:**
- `src/app/battle/ai/__tests__/battle.test.ts` - 70 testes unitários
- `src/app/battle/ai/__tests__/integration.test.ts` - 7 testes de integração

---

**Boa sorte com os testes! 🎮✨**
