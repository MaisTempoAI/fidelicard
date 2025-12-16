import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, Loader2, ArrowLeft, Plus, CheckCircle, Clock, Gift, User, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { 
  getClientByPhone, 
  getCompany, 
  getAllCardsByClient,
  createNewCardForClient,
  createClient,
  createCard,
  createCardFromCoCard
} from "@/hooks/useLoyalty";
import { getActiveCoCards, CoCard } from "@/hooks/useCoCards";
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
  rescued: boolean;
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
  const [showNameForm, setShowNameForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  
  // Promotion selection
  const [showPromotionSelection, setShowPromotionSelection] = useState(false);
  const [activePromotions, setActivePromotions] = useState<CoCard[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [creatingFromPromotion, setCreatingFromPromotion] = useState<number | null>(null);

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

        // Busca cliente
        const client = await getClientByPhone(phone, Number(companyId));
        
        // Se não existe, mostra formulário de nome
        if (!client) {
          setShowNameForm(true);
          setIsLoading(false);
          return;
        }

        // Cliente existe, continua o fluxo normal
        await loadClientCards(client.cardid!, companyData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erro ao carregar dados");
        navigate("/");
      }
    };

    fetchData();
  }, [companyId, phone, navigate]);

  const loadClientCards = async (cardId: string, companyData: any) => {
    try {
      setClientCardId(cardId);

      // Busca todos os cartões
      let clientCards = await getAllCardsByClient(cardId);
      
      // Se não tem cartão, verifica promoções ativas
      if (clientCards.length === 0) {
        await checkAndShowPromotions(cardId, companyData);
        return;
      }

      setCards(clientCards.map(c => ({
        id: c.id,
        cardcode: c.cardcode,
        custamp: Number(c.custamp) || 0,
        reqstamp: Number(c.reqstamp) || 10,
        completed: c.completed || false,
        completedat: c.completedat,
        created_at: c.created_at,
        rescued: c.rescued || false,
      })));
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error("Erro ao carregar cartões");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndShowPromotions = async (cardId: string, companyData: any) => {
    setLoadingPromotions(true);
    try {
      const { coCards, error } = await getActiveCoCards(Number(companyId));
      
      if (error || coCards.length === 0) {
        // Sem promoções ativas, cria cartão com configurações padrão da empresa
        const requiredStamps = companyData.loyaltystamps ? Number(companyData.loyaltystamps) : 10;
        const newCard = await createCard(cardId, Number(companyId), requiredStamps);
        setCards([{
          id: newCard.id,
          cardcode: newCard.cardcode,
          custamp: 0,
          reqstamp: Number(newCard.reqstamp) || 10,
          completed: false,
          completedat: null,
          created_at: newCard.created_at,
          rescued: false,
        }]);
        navigate(`/card/${newCard.cardcode}`);
        return;
      }

      if (coCards.length === 1) {
        // Apenas uma promoção, cria automaticamente
        const coCard = coCards[0];
        const newCard = await createCardFromCoCard(cardId, coCard);
        toast.success(`Cartão "${coCard.name}" criado!`);
        navigate(`/card/${newCard.cardcode}`);
        return;
      }

      // Múltiplas promoções, mostra seleção
      setActivePromotions(coCards);
      setShowPromotionSelection(true);
    } catch (error) {
      console.error("Error checking promotions:", error);
      toast.error("Erro ao verificar promoções");
    } finally {
      setLoadingPromotions(false);
      setIsLoading(false);
    }
  };

  const handleSelectPromotion = async (coCard: CoCard) => {
    if (!clientCardId) return;
    
    setCreatingFromPromotion(coCard.id);
    try {
      const newCard = await createCardFromCoCard(clientCardId, coCard);
      toast.success(`Cartão "${coCard.name}" criado!`);
      navigate(`/card/${newCard.cardcode}`);
    } catch (error) {
      console.error("Error creating card from promotion:", error);
      toast.error("Erro ao criar cartão");
    } finally {
      setCreatingFromPromotion(null);
    }
  };

  const handleNameSubmit = async () => {
    if (!clientName.trim()) {
      toast.error("Por favor, digite seu nome");
      return;
    }

    setIsSubmittingName(true);
    try {
      const newClient = await createClient(phone, Number(companyId), clientName.trim());
      setShowNameForm(false);
      setClientCardId(newClient.cardid!);
      
      const companyData = await getCompany(Number(companyId));
      await checkAndShowPromotions(newClient.cardid!, companyData);
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Erro ao criar cadastro");
    } finally {
      setIsSubmittingName(false);
    }
  };

  const handleCreateNewCard = async () => {
    if (!clientCardId || !company) return;
    
    // Verifica se há promoções ativas
    setIsCreating(true);
    try {
      const { coCards, error } = await getActiveCoCards(company.id);
      
      if (error || coCards.length === 0) {
        // Sem promoções, cria com configurações da empresa
        const newCard = await createNewCardForClient(clientCardId, company.id);
        toast.success("Novo cartão criado com sucesso!");
        navigate(`/card/${newCard.cardcode}`);
        return;
      }

      if (coCards.length === 1) {
        // Uma promoção, cria automaticamente
        const coCard = coCards[0];
        const newCard = await createCardFromCoCard(clientCardId, coCard);
        toast.success(`Cartão "${coCard.name}" criado!`);
        navigate(`/card/${newCard.cardcode}`);
        return;
      }

      // Múltiplas promoções, mostra seleção
      setActivePromotions(coCards);
      setShowPromotionSelection(true);
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Erro ao criar novo cartão");
    } finally {
      setIsCreating(false);
    }
  };

  const activeCard = cards.find(c => !c.completed);
  const completedCards = cards.filter(c => c.completed && !c.rescued);
  const rescuedCards = cards.filter(c => c.rescued);
  const canCreateNew = !activeCard || activeCard.completed;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4">Carregando seus cartões...</p>
      </div>
    );
  }

  // Formulário de nome para novos clientes
  if (showNameForm) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto w-20 h-20 rounded-full gradient-warm flex items-center justify-center mb-4 shadow-lg">
            {company?.elogo ? (
              <img src={company.elogo} alt={company.name || "Logo"} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <UtensilsCrossed className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{company?.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">Cartão Fidelidade</p>
        </div>

        {/* Name Form Card */}
        <Card className="w-full max-w-sm relative z-10 border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <User className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Como gostaria de ser chamado?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Digite seu nome para criar seu cartão fidelidade
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Seu nome"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-12 text-lg text-center"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNameSubmit();
                  }
                }}
              />
              <Button
                onClick={handleNameSubmit}
                disabled={isSubmittingName || !clientName.trim()}
                className="w-full h-12 text-lg gradient-warm hover:opacity-90 transition-opacity"
              >
                {isSubmittingName ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-8 text-center relative z-10">
          Cartão Fidelidade Digital • {company?.name}
        </p>
      </div>
    );
  }

  // Tela de seleção de promoção
  if (showPromotionSelection) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto w-20 h-20 rounded-full gradient-warm flex items-center justify-center mb-4 shadow-lg">
            {company?.elogo ? (
              <img src={company.elogo} alt={company.name || "Logo"} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <UtensilsCrossed className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{company?.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">Escolha sua Promoção</p>
        </div>

        {/* Promotion Cards */}
        <div className="w-full max-w-md space-y-4 relative z-10">
          {loadingPromotions ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-2">Carregando promoções...</p>
            </div>
          ) : (
            activePromotions.map((promo) => (
              <Card 
                key={promo.id}
                className="border-primary/20 shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                onClick={() => handleSelectPromotion(promo)}
              >
                {/* Gradient Header */}
                <div 
                  className="h-3"
                  style={{ background: `linear-gradient(90deg, ${promo.pricolour || '#FF6B35'}, ${promo.seccolour || '#F7931E'})` }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${promo.pricolour || '#FF6B35'}, ${promo.seccolour || '#F7931E'})` }}
                    >
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-foreground mb-1">{promo.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{promo.text}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {promo.stamps} carimbos
                        </span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {promo.days} dias de validade
                        </span>
                        {promo.prod && (
                          <span className="text-xs bg-green-500/10 text-green-700 px-2 py-1 rounded-full">
                            {promo.prod}
                          </span>
                        )}
                      </div>
                    </div>
                    {creatingFromPromotion === promo.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
                    ) : (
                      <Gift className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Back button */}
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => {
              setShowPromotionSelection(false);
              navigate(`/empresa/${companyId}`);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center relative z-10">
          Cartão Fidelidade Digital • {company?.name}
        </p>
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

      {/* Completed Cards (not rescued yet) */}
      {completedCards.length > 0 && (
        <div className="w-full max-w-md relative z-10 mb-4">
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

      {/* Rescued Cards */}
      {rescuedCards.length > 0 && (
        <div className="w-full max-w-md relative z-10">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5 text-gray-500" />
            Cartões Resgatados ({rescuedCards.length})
          </h2>
          <div className="space-y-3">
            {rescuedCards.map((card) => (
              <Card 
                key={card.id}
                className="border-gray-400/30 bg-gray-500/10 cursor-pointer hover:bg-gray-500/15 transition-colors"
                onClick={() => navigate(`/card/${card.cardcode}`)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-base font-bold text-gray-500">{card.cardcode}</p>
                      <p className="text-xs text-gray-500">
                        Completado em {card.completedat 
                          ? format(new Date(card.completedat), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : format(new Date(card.created_at), "dd/MM/yyyy", { locale: ptBR })
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full font-medium">
                        RESGATADO
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
