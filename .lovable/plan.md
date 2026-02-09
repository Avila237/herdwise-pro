

# Plano: Transformar App em Demo

## Resumo

O objetivo e transformar o sistema em uma versao demo publica, sem autenticacao e com dados ficticios genericos.

## Analise Atual

### O que JA esta ok:
- **Nao existe autenticacao implementada** - nao ha login, signup ou protecao de rotas
- Dados de animais sao ficticios (Mimosa, Aurora, Boneca, Esperanca)
- Nomes de touros sao genericos (ABS Jedi, CRV Lagoon, SEMEX Magnus)
- Parametros e metricas sao tecnicos, sem dados pessoais

### O que PRECISA ser alterado:

| Item | Atual | Demo |
|------|-------|------|
| Nome da Fazenda | "Fazenda teste 01" | "Fazenda Demo" |
| Nomes de inseminadores | "Joao Silva", "Pedro Costa" | "Tecnico 1", "Tecnico 2" |
| Banners/avisos | Nenhum | Adicionar banner "DEMO" |
| RLS Policies | Abertas (true) | Manter (nao ha usuarios) |

---

## Etapas de Implementacao

### Etapa 1: Atualizar Dados no Banco

**1.1 Renomear Fazenda**
```sql
UPDATE farms 
SET name = 'Fazenda Demo' 
WHERE name = 'Fazenda teste 01';
```

**1.2 Anonimizar Inseminadores**
```sql
UPDATE events 
SET inseminator_name = CASE 
  WHEN inseminator_name = 'João Silva' THEN 'Técnico 1'
  WHEN inseminator_name = 'Pedro Costa' THEN 'Técnico 2'
  ELSE inseminator_name
END
WHERE inseminator_name IS NOT NULL;
```

---

### Etapa 2: Adicionar Banner de Demo

**2.1 Criar componente DemoBanner**

Novo arquivo: `src/components/common/DemoBanner.tsx`
- Banner fixo no topo
- Cor de destaque (amarelo/laranja)
- Mensagem: "Esta e uma versao de demonstracao com dados ficticios"

**2.2 Integrar no AppLayout**

Modificar: `src/components/layout/AppLayout.tsx`
- Adicionar `<DemoBanner />` antes do header principal

---

### Etapa 3: Bloquear Edicao de Fazenda

**3.1 Modificar SettingsPage**

Modificar: `src/pages/SettingsPage.tsx`
- Remover ou desabilitar a criacao de novas fazendas
- Adicionar aviso: "No modo demo, a configuracao de fazendas esta bloqueada"

---

### Etapa 4: Adicionar Mensagem de Boas-Vindas

**4.1 Modificar Dashboard**

Modificar: `src/pages/Dashboard.tsx`
- Adicionar card de boas-vindas explicando que e um demo
- Sugerir explorar as funcionalidades

---

## Arquivos a Modificar/Criar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| Banco de dados | UPDATE | Renomear fazenda e anonimizar nomes |
| `src/components/common/DemoBanner.tsx` | CRIAR | Banner de demonstracao |
| `src/components/layout/AppLayout.tsx` | EDITAR | Adicionar DemoBanner |
| `src/pages/SettingsPage.tsx` | EDITAR | Bloquear criacao de fazendas |
| `src/pages/Dashboard.tsx` | EDITAR | Adicionar card de boas-vindas |

---

## Resultado Esperado

Apos as alteracoes:
1. Usuario abre o app e ve banner "VERSAO DEMO" no topo
2. Dashboard mostra mensagem de boas-vindas
3. Todos os dados exibidos sao genericos/ficticios
4. Nao e possivel criar novas fazendas (apenas explorar)
5. Funcionalidades de CRUD de animais e eventos continuam funcionando

