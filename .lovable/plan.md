

# Plano: Redirecionar automaticamente quando houver apenas 1 cartao ativo

## Problema

A logica atual so redireciona automaticamente se:
- O cliente tem exatamente 1 cartao no total, OU
- Tem 1 cartao ativo e ZERO cartoes completos/resgatados

Se o cliente tem 1 cartao ativo + cartoes completos no historico, ele precisa clicar manualmente. O comportamento desejado e redirecionar sempre que houver apenas 1 cartao ativo.

## Solucao

Simplificar a logica em `src/pages/ClientCards.tsx` (linhas 129-147):

```typescript
// Se tem apenas 1 cartão ativo, redireciona direto
const activeCards = clientCards.filter(c => !c.completed && !c.rescued);
if (activeCards.length === 1 && activeCards[0].cardcode) {
  navigate(`/card/${activeCards[0].cardcode}`);
  return;
}

// Se não tem cartão ativo mas tem 1 cartão total, abre ele
if (activeCards.length === 0 && clientCards.length === 1 && clientCards[0].cardcode) {
  navigate(`/card/${clientCards[0].cardcode}`);
  return;
}
```

Isso cobre todos os cenarios:
- 1 cartao ativo (com ou sem historico de completos) → abre direto
- 0 cartoes ativos e 1 completo → abre o completo
- Multiplos cartoes ativos → mostra lista para selecao

## Arquivo modificado

`src/pages/ClientCards.tsx` — apenas as linhas 129-147

