import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UtensilsCrossed, Loader2, ArrowLeft, Plus, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { 
  getClientByPhone, 
  getCompany, 
  getAllCardsByClient,
  createNewCardForClient,
  createClient,
  createCard
} from "@/hooks/useLoyalty";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CardItem {
  id: number;
  cardcode: string | null;
  custamp: number;
  reqstamp: number;
  completed: boolean;
  completedat: string | null;
  created_at: string;
}

interface CompanyData {
  id: number;
  name: string | null;
  loyaltytext: string | null;
  loyaltystamps: string | null;
  elogo: string | null;
}

const ClientCards = () => {
  const { companyId } = useParams();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [clientCardId, setClientCardId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId || !phone) {
        navigate("/");
        return;
      }

      try {
        const companyData = await getCompany(Number(companyId));
        if (!companyData) {
          toast.error("Empresa não encontrada");
          navigate("/");
          return;
        }
        setCompany({
          id: companyData.id,
          name: companyData.name,
          loyaltytext: companyData.loyaltytext,
          loyaltystamps: companyData.loyaltystamps,
          elogo: companyData.elogo,
        });

        const requiredStamps = companyData.loyaltystamps ? Number(companyData.loyaltystamps) : 10;

        // Busca cliente ou cria se não existir
        let client = await getClientByPhone(phone, Number(companyId));
        if (!client) {
          client = await createClient(phone, Number(companyId));
        }
        setClientCardId(client.cardid);

        // Busca todos os cartões
        let clientCards = await getAllCardsByClient(client.cardid!);
        
        // Se não tem cartão, cria o primeiro
        if (clientCards.length === 0) {
          const newCard = await createCard(client.cardid!, Number(companyId), requiredStamps);
          clientCards = [newCard];
        }

        setCards(clientCards.map(c => ({
          id: c.id,
          cardcode: c.cardcode,
          custamp: Number(c.custamp) || 0,
          reqstamp: Number(c.reqstamp) || 10,
          completed: c.completed || false,
          completedat: c.completedat,
          created_at: c.created_at,
        })));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erro ao carregar dados");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId, phone, navigate]);

  const handleCreateNewCard = async () => {
    if (!clientCardId || !company) return;
    
    setIsCreating(true);
    try {
      const newCard = await createNewCardForClient(clientCardId, company.id);
      toast.success("Novo cartão criado com sucesso!");
      navigate(`/card/${newCard.cardcode}`);
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Erro ao criar novo cartão");
    } finally {
      setIsCreating(false);
    }
  };

  const activeCard = cards.find(c => !c.completed);
  const completedCards = cards.filter(c => c.completed);
  const canCreateNew = !activeCard || activeCard.completed;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4">Carregando seus cartões...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 py-8">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Back button */}
      <div className="w-full max-w-md relative z-10 mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/empresa/${companyId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="mx-auto w-16 h-16 rounded-full gradient-warm flex items-center justify-center mb-3 shadow-lg">
          {company?.elogo ? (
            <img src={company.elogo} alt={company.name || "Logo"} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{company?.name}</h1>
        <p className="text-muted-foreground text-sm">Seus Cartões Fidelidade</p>
      </div>

      {/* Active Card */}
      {activeCard && (
        <Card 
          className="w-full max-w-md relative z-10 border-primary/30 shadow-lg mb-4 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => navigate(`/card/${activeCard.cardcode}`)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Cartão Ativo</span>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Em andamento
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-lg font-bold text-primary">{activeCard.cardcode}</p>
                <p className="text-sm text-muted-foreground">
                  {activeCard.custamp} de {activeCard.reqstamp} carimbos
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{activeCard.custamp}</span>
              </div>
            </div>
            {/* Mini progress */}
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(activeCard.custamp / activeCard.reqstamp) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Card Button */}
      {canCreateNew && (
        <Button
          onClick={handleCreateNewCard}
          disabled={isCreating}
          className="w-full max-w-md mb-6 h-14 text-lg gradient-warm hover:opacity-90 transition-opacity relative z-10"
        >
          {isCreating ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Plus className="w-5 h-5 mr-2" />
          )}
          Criar Novo Cartão
        </Button>
      )}

      {/* Completed Cards */}
      {completedCards.length > 0 && (
        <div className="w-full max-w-md relative z-10">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Cartões Completos ({completedCards.length})
          </h2>
          <div className="space-y-3">
            {completedCards.map((card) => (
              <Card 
                key={card.id}
                className="border-green-500/20 bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors"
                onClick={() => navigate(`/card/${card.cardcode}`)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-base font-bold text-foreground">{card.cardcode}</p>
                      <p className="text-xs text-muted-foreground">
                        Completado em {card.completedat 
                          ? format(new Date(card.completedat), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : format(new Date(card.created_at), "dd/MM/yyyy", { locale: ptBR })
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        {card.reqstamp}/{card.reqstamp}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {cards.length === 0 && (
        <div className="text-center relative z-10">
          <p className="text-muted-foreground">Nenhum cartão encontrado</p>
          <Button
            onClick={handleCreateNewCard}
            disabled={isCreating}
            className="mt-4 gradient-warm"
          >
            {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Criar Primeiro Cartão
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-8 text-center relative z-10">
        Cartão Fidelidade Digital • {company?.name}
      </p>
    </div>
  );
};

export default ClientCards;
