

# Plano: Navegacao entre Datas na Tela de Check-In

## Objetivo

Adicionar navegacao entre dias na aba de Check-In do Admin, permitindo:
- Visualizar check-ins de **Hoje**, **Ontem** ou uma **data personalizada**
- Evitar perda de dados caso o admin esqueca de processar os check-ins do dia

---

## Estrutura da Navegacao

```text
+-----------------------------------------------+
|  [< Ontem]   [ Hoje: 29/01/2026 ]   [Cal 📅]  |
+-----------------------------------------------+
|  Check-ins de 29/01/2026                       |
|  Badge: 5 check-ins                            |
+-----------------------------------------------+
```

### Componentes de Navegacao:
1. **Botao "Ontem"** (seta esquerda) - navega para o dia anterior
2. **Botao central** - mostra a data selecionada, clique reseta para Hoje
3. **Botao Calendario** - abre um DatePicker para selecionar data personalizada

---

## Alteracoes Tecnicas

### 1. Novos Estados em Admin.tsx

```typescript
// Estado para data selecionada no check-in
const [checkinDate, setCheckinDate] = useState<Date>(new Date());
const [isCalendarOpen, setIsCalendarOpen] = useState(false);
```

### 2. Modificar loadCheckinData para aceitar data

Atualizar a funcao para receber uma data como parametro em vez de usar sempre "hoje":

```typescript
// DE:
const loadCheckinData = async () => {
  const today = new Date();
  const todayStr = `${today.getDate()...`;
  
// PARA:
const loadCheckinData = async (targetDate?: Date) => {
  const dateToUse = targetDate || checkinDate;
  const dateStr = format(dateToUse, 'dd/MM/yyyy');
```

### 3. Ajustar logica de "hasStampToday"

Renomear para `hasStampOnDate` e verificar selos na data selecionada (nao apenas hoje):

```typescript
// Verificar se recebeu selo NA DATA SELECIONADA
let hasStampOnDate = false;
if (card.events) {
  const eventEntries = card.events.split(';');
  for (const entry of eventEntries) {
    const match = entry.match(/\d+selo='(\d{2}\/\d{2}\/\d{4})...'/);
    if (match && match[1] === dateStr) {
      hasStampOnDate = true;
      break;
    }
  }
}
```

### 4. Atualizar Interface CheckinClient

```typescript
interface CheckinClient {
  cardId: number;
  clientId: number;
  clientName: string;
  clientPhone: string;
  checkinTime: string;
  checkinDate: string;        // NOVO: data do check-in
  hasStampOnDate: boolean;    // RENOMEADO de hasStampToday
  custamp: number;
  reqstamp: number;
  completed: boolean;
}
```

### 5. UI de Navegacao de Datas

Adicionar no header da view 'checkin':

```typescript
{/* Date Navigation */}
<div className="flex items-center gap-2 mb-4">
  {/* Previous Day Button */}
  <Button
    variant="ghost"
    size="icon"
    onClick={() => {
      const prev = new Date(checkinDate);
      prev.setDate(prev.getDate() - 1);
      setCheckinDate(prev);
    }}
    className="h-10 w-10 rounded-xl bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]"
  >
    <ChevronLeft className="w-5 h-5" />
  </Button>

  {/* Current Date Display */}
  <Button
    onClick={() => setCheckinDate(new Date())}
    className={`flex-1 h-10 rounded-xl font-medium ${
      isToday(checkinDate) 
        ? 'bg-orange-500 text-white' 
        : 'bg-[#1a1a1a] text-gray-300'
    }`}
  >
    {isToday(checkinDate) 
      ? 'Hoje' 
      : format(checkinDate, 'dd/MM/yyyy')
    }
  </Button>

  {/* Calendar Picker */}
  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]"
      >
        <CalendarDays className="w-5 h-5" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a]">
      <Calendar
        mode="single"
        selected={checkinDate}
        onSelect={(date) => {
          if (date) {
            setCheckinDate(date);
            setIsCalendarOpen(false);
          }
        }}
        disabled={(date) => date > new Date()}
        className="pointer-events-auto"
      />
    </PopoverContent>
  </Popover>
</div>
```

### 6. useEffect para recarregar ao mudar data

```typescript
useEffect(() => {
  if (activeView === 'checkin') {
    loadCheckinData(checkinDate);
  }
}, [checkinDate, activeView]);
```

### 7. Atualizar Titulo Dinamico

```typescript
<h2 className="text-lg font-semibold text-white">
  {isToday(checkinDate) 
    ? 'Check-ins de Hoje' 
    : `Check-ins de ${format(checkinDate, 'dd/MM/yyyy')}`
  }
</h2>
```

---

## Novos Imports Necessarios

```typescript
import { format, isToday } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
```

---

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| src/pages/Admin.tsx | Adicionar estados, navegacao, modificar loadCheckinData |

---

## Fluxo de Uso

1. Admin acessa aba Check-In -> mostra check-ins de **hoje** (padrao)
2. Clica na seta **esquerda** -> carrega check-ins de **ontem**
3. Continua navegando para dias anteriores
4. Clica no botao central -> volta para **hoje**
5. Clica no icone de **calendario** -> abre datepicker para escolher data especifica
6. Datas futuras sao **desabilitadas** (nao faz sentido)

---

## Comportamento do Botao "Selo p/ Todos"

- Funciona normalmente para qualquer data selecionada
- Adiciona selo a todos os clientes que fizeram check-in **na data selecionada** e ainda nao receberam selo **na mesma data**

