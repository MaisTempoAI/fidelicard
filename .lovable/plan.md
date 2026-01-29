

# Plano: Check-In Configuravel + Redirecionamento Automatico para Cartao Unico

## Resumo

Duas funcionalidades serao implementadas:
1. **Check-In Configuravel**: O admin podera habilitar/desabilitar check-in nas configuracoes do CoCard (promocao). Quando desabilitado, o QR Code ficara maior na tela do cartao.
2. **Redirecionamento Automatico**: Quando um usuario tem apenas 1 cartao ativo, abre direto o cartao sem mostrar a tela de selecao.

---

## Parte 1: Check-In Configuravel

### 1.1 Migracao de Banco de Dados

Adicionar nova coluna `checkin_enabled` na tabela `CRF-CoCards`:

```sql
ALTER TABLE "CRF-CoCards" 
ADD COLUMN checkin_enabled boolean DEFAULT true;
```

- Default `true` para manter comportamento atual em cartoes existentes
- Tipo booleano para toggle simples

### 1.2 Atualizar Interface CoCard (src/components/CoCardFormModal.tsx)

Adicionar switch "Habilitar Check-In" na aba DADOS, abaixo do switch "Renovavel":

```text
DADOS tab:
- Nome do Cartao
- Texto do Cartao  
- Produto de Troca
- Quantidade Selos | Validade dias
- [Switch] Renovavel
- [Switch] Habilitar Check-In  <-- NOVO
```

Alteracoes:
- Adicionar `checkin_enabled: boolean` na interface `CoCardForm`
- Adicionar componente Switch com label "Habilitar Check-In" e descricao "Se desativado, cliente nao tera botao de check-in no cartao"

### 1.3 Atualizar Hook useCoCards (src/hooks/useCoCards.ts)

- Adicionar `checkin_enabled` na interface `CoCard`
- Atualizar funcoes `createCoCard` e `updateCoCard` para incluir o novo campo

### 1.4 Atualizar Tela do Cartao (src/pages/Card.tsx)

Logica condicional no footer:

```text
SE coCardData.checkin_enabled === true (ou indefinido para retrocompatibilidade):
  - Mostrar QR Code + Botao Check-In lado a lado (layout atual)
  - QR Code: w-[clamp(70px,18vw,90px)]

SE coCardData.checkin_enabled === false:
  - Mostrar APENAS QR Code (maior e centralizado)
  - QR Code: w-[clamp(100px,25vw,130px)]
```

Passos:
1. Adicionar `checkin_enabled?: boolean` ao estado `coCardData`
2. Verificar `coCardData?.checkin_enabled !== false` para mostrar botao de check-in
3. Ajustar tamanho do QR dinamicamente baseado na configuracao

---

## Parte 2: Redirecionamento Automatico para Cartao Unico

### 2.1 Atualizar ClientCards.tsx

Na funcao `loadClientCards`, apos carregar os cartoes:

```typescript
// Apos carregar cartoes
let clientCards = await getAllCardsByClient(cardId);

// Se nao tem cartao, verifica promocoes
if (clientCards.length === 0) {
  await checkAndShowPromotions(cardId, companyData);
  return;
}

// NOVO: Se tem apenas 1 cartao, redireciona direto
const activeCard = clientCards.find(c => !c.completed);
if (clientCards.length === 1 || (activeCard && !clientCards.some(c => c.completed))) {
  // Usuario tem apenas 1 cartao (ou apenas 1 ativo sem historico)
  const targetCard = activeCard || clientCards[0];
  navigate(`/card/${targetCard.cardcode}`);
  return;
}

// Multiplos cartoes: mostra lista normalmente
setCards(clientCards.map(...));
```

A logica verifica:
- Se ha apenas 1 cartao total, redireciona para ele
- Se ha 1 cartao ativo e nenhum completo/resgatado, redireciona para o ativo
- Caso contrario, mostra a lista de cartoes normalmente

---

## Arquivos Modificados

| Arquivo | Tipo de Mudanca |
|---------|----------------|
| CRF-CoCards (banco) | Adicionar coluna `checkin_enabled` |
| src/hooks/useCoCards.ts | Adicionar campo na interface e funcoes |
| src/components/CoCardFormModal.tsx | Adicionar Switch de Check-In |
| src/pages/Card.tsx | Logica condicional para QR maior |
| src/pages/ClientCards.tsx | Redirecionamento automatico |
| src/pages/Admin.tsx | Passar `checkin_enabled` no form do CoCard |

---

## Detalhes Tecnicos

### Tamanhos do QR Code

**Com Check-In (lado a lado):**
```css
w-[clamp(70px,18vw,90px)] h-[clamp(70px,18vw,90px)]
```

**Sem Check-In (centralizado e maior):**
```css
w-[clamp(100px,25vw,130px)] h-[clamp(100px,25vw,130px)]
```

### Interface CoCardForm Atualizada

```typescript
interface CoCardForm {
  id?: number;
  name: string;
  text: string;
  prod: string;
  stamps: number;
  days: number;
  pricolour: string;
  seccolour: string;
  icon: string;
  active: boolean;
  renewable: boolean;
  checkin_enabled: boolean; // NOVO
}
```

### Retrocompatibilidade

- CoCards existentes sem o campo terao `checkin_enabled = null/undefined`
- O codigo tratara `null/undefined` como `true` (check-in habilitado)
- Isso mantem o comportamento atual para cartoes ja criados

