import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Plus, CheckCircle, Gift, Megaphone, ArrowUpDown, Calendar, SortAsc } from "lucide-react";
import { toast } from "sonner";
import { 
  getClientByPhone, 
  getCompany,
  getCompanyByIdOrSlug, 
  getAllCardsByClient,
  createNewCardForClient,
  createClient,
  createCard,
  createCardFromCoCard,
  filterAvailablePromotions
} from "@/hooks/useLoyalty";
import { getActiveCoCards, getFirstActiveCoCardColors, CoCard, CompanyColors } from "@/hooks/useCoCards";
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
  const [colors, setColors] = useState<CompanyColors>({ bgColor: '#121212', fontColor: '#dcd0c0' });
  
  // Promotion selection
  const [showPromotionSelection, setShowPromotionSelection] = useState(false);
  const [activePromotions, setActivePromotions] = useState<CoCard[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [creatingFromPromotion, setCreatingFromPromotion] = useState<number | null>(null);
  
  // Filters for completed/rescued cards
  type SortType = 'date-desc' | 'date-asc' | 'alpha-asc' | 'alpha-desc';
  const [completedSort, setCompletedSort] = useState<SortType>('date-desc');
  const [rescuedSort, setRescuedSort] = useState<SortType>('date-desc');

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId || !phone) {
        navigate("/");
        return;
      }

      try {
        const companyData = await getCompanyByIdOrSlug(companyId!);
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

        // Fetch colors from first active CoCard
        const companyColors = await getFirstActiveCoCardColors(companyData.id);
        setColors(companyColors);

        // Busca cliente
        const client = await getClientByPhone(phone, companyData.id);
        
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

      // Se tem apenas 1 cartão, redireciona direto para ele
      if (clientCards.length === 1) {
        const singleCard = clientCards[0];
        if (singleCard.cardcode) {
          navigate(`/card/${singleCard.cardcode}`);
          return;
        }
      }

      // Se tem apenas 1 cartão ativo (e nenhum completo/resgatado no histórico), redireciona
      const activeCards = clientCards.filter(c => !c.completed && !c.rescued);
      const completedOrRescuedCards = clientCards.filter(c => c.completed || c.rescued);
      if (activeCards.length === 1 && completedOrRescuedCards.length === 0) {
        const activeCard = activeCards[0];
        if (activeCard.cardcode) {
          navigate(`/card/${activeCard.cardcode}`);
          return;
        }
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
      const { coCards, error } = await getActiveCoCards(companyData.id);
      
      if (error || coCards.length === 0) {
        // Sem promoções ativas, cria cartão com configurações padrão da empresa
        const requiredStamps = companyData.loyaltystamps ? Number(companyData.loyaltystamps) : 10;
        const newCard = await createCard(cardId, companyData.id, requiredStamps);
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

      // Filtra promoções disponíveis (exclui não-renováveis já completadas)
      const availableIds = await filterAvailablePromotions(cardId, coCards);
      const availableCoCards = coCards.filter(c => availableIds.includes(c.id));

      if (availableCoCards.length === 0) {
        // Todas as promoções não-renováveis já foram completadas
        toast.info("Você já completou todas as promoções disponíveis!");
        setIsLoading(false);
        return;
      }

      if (availableCoCards.length === 1) {
        // Apenas uma promoção disponível, cria automaticamente
        const coCard = availableCoCards[0];
        const newCard = await createCardFromCoCard(cardId, coCard);
        toast.success(`Cartão "${coCard.name}" criado!`);
        navigate(`/card/${newCard.cardcode}`);
        return;
      }

      // Múltiplas promoções disponíveis, mostra seleção
      setActivePromotions(availableCoCards);
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
      const newClient = await createClient(phone, company!.id, clientName.trim());
      setShowNameForm(false);
      setClientCardId(newClient.cardid!);
      
      const companyData = await getCompany(company!.id);
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

      // Filtra promoções disponíveis (exclui não-renováveis já completadas)
      const availableIds = await filterAvailablePromotions(clientCardId, coCards);
      const availableCoCards = coCards.filter(c => availableIds.includes(c.id));

      if (availableCoCards.length === 0) {
        toast.info("Você já completou todas as promoções disponíveis!");
        setIsCreating(false);
        return;
      }

      if (availableCoCards.length === 1) {
        // Uma promoção disponível, cria automaticamente
        const coCard = availableCoCards[0];
        const newCard = await createCardFromCoCard(clientCardId, coCard);
        toast.success(`Cartão "${coCard.name}" criado!`);
        navigate(`/card/${newCard.cardcode}`);
        return;
      }

      // Múltiplas promoções disponíveis, mostra seleção
      setActivePromotions(availableCoCards);
      setShowPromotionSelection(true);
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Erro ao criar novo cartão");
    } finally {
      setIsCreating(false);
    }
  };

  const activeCard = cards.find(c => !c.completed);
  const completedCardsRaw = cards.filter(c => c.completed && !c.rescued);
  const rescuedCardsRaw = cards.filter(c => c.rescued);
  const canCreateNew = !activeCard || activeCard.completed;

  // Sort function
  const sortCards = (cardsToSort: CardItem[], sortType: SortType) => {
    return [...cardsToSort].sort((a, b) => {
      switch (sortType) {
        case 'date-desc':
          return new Date(b.completedat || b.created_at).getTime() - new Date(a.completedat || a.created_at).getTime();
        case 'date-asc':
          return new Date(a.completedat || a.created_at).getTime() - new Date(b.completedat || b.created_at).getTime();
        case 'alpha-asc':
          return (a.cardcode || '').localeCompare(b.cardcode || '');
        case 'alpha-desc':
          return (b.cardcode || '').localeCompare(a.cardcode || '');
        default:
          return 0;
      }
    });
  };

  const completedCards = sortCards(completedCardsRaw, completedSort);
  const rescuedCards = sortCards(rescuedCardsRaw, rescuedSort);

  const cycleSortType = (current: SortType): SortType => {
    const order: SortType[] = ['date-desc', 'date-asc', 'alpha-asc', 'alpha-desc'];
    const currentIndex = order.indexOf(current);
    return order[(currentIndex + 1) % order.length];
  };

  const getSortIcon = (sortType: SortType) => {
    switch (sortType) {
      case 'date-desc':
      case 'date-asc':
        return Calendar;
      case 'alpha-asc':
      case 'alpha-desc':
        return SortAsc;
      default:
        return ArrowUpDown;
    }
  };

  const getSortLabel = (sortType: SortType) => {
    switch (sortType) {
      case 'date-desc':
        return 'Mais recente';
      case 'date-asc':
        return 'Mais antigo';
      case 'alpha-asc':
        return 'A-Z';
      case 'alpha-desc':
        return 'Z-A';
      default:
        return '';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="min-h-[100dvh] flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: colors.bgColor }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.fontColor }} />
        <p className="mt-4 font-light" style={{ color: colors.fontColor, opacity: 0.6 }}>
          Carregando seus cartões...
        </p>
      </div>
    );
  }

  // Name form for new clients
  if (showNameForm) {
    return (
      <div 
        className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-8 overflow-hidden"
        style={{ backgroundColor: colors.bgColor }}
      >
        {/* Logo */}
        <div className="mb-6">
          {company?.elogo ? (
            <img
              src={company.elogo}
              alt={company.name || "Logo"}
              className="w-[clamp(60px,15vw,80px)] h-[clamp(60px,15vw,80px)] rounded-full object-cover"
              style={{ border: `2px solid ${colors.fontColor}20` }}
            />
          ) : (
            <div 
              className="w-[clamp(60px,15vw,80px)] h-[clamp(60px,15vw,80px)] rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.fontColor, color: colors.bgColor }}
            >
              <span className="text-[clamp(24px,6vw,32px)] font-bold">{company?.name?.charAt(0) || "E"}</span>
            </div>
          )}
        </div>

        {/* Company Name */}
        <h1 
          className="text-[clamp(24px,6vw,36px)] font-light tracking-tight text-center mb-1"
          style={{ color: colors.fontColor, fontFamily: "'Playfair Display', serif" }}
        >
          {company?.name}
        </h1>

        {/* Subtitle */}
        <p 
          className="text-[clamp(12px,3vw,14px)] font-light tracking-[1.5px] uppercase mb-8"
          style={{ color: colors.fontColor, opacity: 0.5 }}
        >
          Cartão Fidelidade
        </p>

        {/* Separator */}
        <div 
          className="w-16 h-[1px] mb-8"
          style={{ backgroundColor: colors.fontColor, opacity: 0.2 }}
        />

        {/* Question */}
        <p 
          className="text-[clamp(16px,4vw,20px)] text-center font-light mb-2"
          style={{ color: colors.fontColor, fontFamily: "'Playfair Display', serif" }}
        >
          Como gostaria de ser chamado?
        </p>
        <p 
          className="text-[clamp(12px,3vw,14px)] text-center font-light mb-8"
          style={{ color: colors.fontColor, opacity: 0.5 }}
        >
          Digite seu nome para criar seu cartão
        </p>

        {/* Name Form */}
        <div className="w-full max-w-[280px] space-y-4">
          <Input
            type="text"
            placeholder="Seu nome"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="text-center text-[clamp(16px,4vw,18px)] h-14 border-0 rounded-2xl font-light"
            style={{ 
              backgroundColor: colors.fontColor, 
              color: colors.bgColor,
            }}
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
            className="w-full h-14 text-[clamp(14px,3.5vw,16px)] font-medium rounded-2xl border-0 transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: colors.fontColor, 
              color: colors.bgColor,
            }}
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

        {/* Footer */}
        <p 
          className="absolute bottom-6 text-[clamp(9px,2.2vw,10px)] tracking-[1.5px] uppercase font-light"
          style={{ color: colors.fontColor, opacity: 0.3 }}
        >
          FIDELICARD ®
        </p>
      </div>
    );
  }

  // Promotion selection screen
  if (showPromotionSelection) {
    return (
      <div 
        className="min-h-[100dvh] flex flex-col items-center px-6 py-8 overflow-y-auto"
        style={{ backgroundColor: colors.bgColor }}
      >
        {/* Logo */}
        <div className="mt-8 mb-6">
          {company?.elogo ? (
            <img
              src={company.elogo}
              alt={company.name || "Logo"}
              className="w-[clamp(50px,12vw,70px)] h-[clamp(50px,12vw,70px)] rounded-full object-cover"
              style={{ border: `2px solid ${colors.fontColor}20` }}
            />
          ) : (
            <div 
              className="w-[clamp(50px,12vw,70px)] h-[clamp(50px,12vw,70px)] rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.fontColor, color: colors.bgColor }}
            >
              <span className="text-[clamp(20px,5vw,28px)] font-bold">{company?.name?.charAt(0) || "E"}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 
          className="text-[clamp(20px,5vw,28px)] font-light tracking-tight text-center mb-1"
          style={{ color: colors.fontColor, fontFamily: "'Playfair Display', serif" }}
        >
          {company?.name}
        </h1>
        <p 
          className="text-[clamp(11px,2.8vw,13px)] font-light tracking-[1.5px] uppercase mb-8"
          style={{ color: colors.fontColor, opacity: 0.5 }}
        >
          Escolha sua Promoção
        </p>

        {/* Promotion Cards */}
        <div className="w-full max-w-md space-y-4 flex-1">
          {loadingPromotions ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: colors.fontColor }} />
              <p className="mt-2 font-light" style={{ color: colors.fontColor, opacity: 0.6 }}>
                Carregando promoções...
              </p>
            </div>
          ) : (
            activePromotions.map((promo) => (
              <button
                key={promo.id}
                className="w-full p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: `${colors.fontColor}10`,
                  border: `1px solid ${colors.fontColor}20`
                }}
                onClick={() => handleSelectPromotion(promo)}
                disabled={creatingFromPromotion === promo.id}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${promo.pricolour || colors.bgColor}, ${promo.seccolour || colors.fontColor})` 
                    }}
                  >
                    <Megaphone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-medium text-[clamp(14px,3.5vw,16px)] mb-1"
                      style={{ color: colors.fontColor }}
                    >
                      {promo.name}
                    </h3>
                    <p 
                      className="text-[clamp(12px,3vw,13px)] mb-3 line-clamp-2 font-light"
                      style={{ color: colors.fontColor, opacity: 0.6 }}
                    >
                      {promo.text}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span 
                        className="text-[clamp(10px,2.5vw,11px)] px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${colors.fontColor}15`, color: colors.fontColor }}
                      >
                        {promo.stamps} selos
                      </span>
                      <span 
                        className="text-[clamp(10px,2.5vw,11px)] px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${colors.fontColor}10`, color: colors.fontColor, opacity: 0.7 }}
                      >
                        {promo.days} dias
                      </span>
                    </div>
                  </div>
                  {creatingFromPromotion === promo.id ? (
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" style={{ color: colors.fontColor }} />
                  ) : (
                    <Gift className="w-5 h-5 shrink-0" style={{ color: colors.fontColor, opacity: 0.5 }} />
                  )}
                </div>
              </button>
            ))
          )}

          {/* Back button */}
          <Button
            variant="ghost"
            className="w-full mt-4 hover:bg-transparent"
            style={{ color: colors.fontColor, opacity: 0.6 }}
            onClick={() => {
              setShowPromotionSelection(false);
              navigate(`/empresa/${companyId}`);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Footer */}
        <p 
          className="mt-8 text-[clamp(9px,2.2vw,10px)] tracking-[1.5px] uppercase font-light"
          style={{ color: colors.fontColor, opacity: 0.3 }}
        >
          FIDELICARD ®
        </p>
      </div>
    );
  }

  // Main cards view
  return (
    <div 
      className="min-h-[100dvh] flex flex-col items-center px-6 py-8 overflow-y-auto"
      style={{ backgroundColor: colors.bgColor }}
    >
      {/* Back button */}
      <div className="w-full max-w-md mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-transparent"
          style={{ color: colors.fontColor, opacity: 0.6 }}
          onClick={() => navigate(`/empresa/${companyId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        {company?.elogo ? (
          <img
            src={company.elogo}
            alt={company.name || "Logo"}
            className="w-[clamp(50px,12vw,70px)] h-[clamp(50px,12vw,70px)] rounded-full object-cover mx-auto mb-4"
            style={{ border: `2px solid ${colors.fontColor}20` }}
          />
        ) : (
          <div 
            className="w-[clamp(50px,12vw,70px)] h-[clamp(50px,12vw,70px)] rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.fontColor, color: colors.bgColor }}
          >
            <span className="text-[clamp(20px,5vw,28px)] font-bold">{company?.name?.charAt(0) || "E"}</span>
          </div>
        )}
        <h1 
          className="text-[clamp(20px,5vw,28px)] font-light tracking-tight"
          style={{ color: colors.fontColor, fontFamily: "'Playfair Display', serif" }}
        >
          {company?.name}
        </h1>
        <p 
          className="text-[clamp(11px,2.8vw,13px)] font-light tracking-[1.5px] uppercase"
          style={{ color: colors.fontColor, opacity: 0.5 }}
        >
          Seus Cartões Fidelidade
        </p>
      </div>

      {/* Active Card */}
      {activeCard && (
        <button
          className="w-full max-w-md p-5 rounded-2xl mb-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ 
            backgroundColor: `${colors.fontColor}10`,
            border: `1px solid ${colors.fontColor}20`
          }}
          onClick={() => navigate(`/card/${activeCard.cardcode}`)}
        >
          <div className="flex items-center justify-between mb-3">
            <span 
              className="text-[clamp(11px,2.8vw,12px)] font-medium tracking-wide uppercase"
              style={{ color: colors.fontColor }}
            >
              Cartão Ativo
            </span>
            <span 
              className="text-[clamp(10px,2.5vw,11px)] px-2 py-1 rounded-full"
              style={{ backgroundColor: `${colors.fontColor}15`, color: colors.fontColor }}
            >
              Em andamento
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="font-mono text-[clamp(16px,4vw,20px)] font-bold tracking-[3px]"
                style={{ color: colors.fontColor }}
              >
                {activeCard.cardcode}
              </p>
              <p 
                className="text-[clamp(12px,3vw,13px)] font-light"
                style={{ color: colors.fontColor, opacity: 0.6 }}
              >
                {activeCard.custamp} de {activeCard.reqstamp} selos
              </p>
            </div>
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.fontColor}15` }}
            >
              <span 
                className="text-[clamp(18px,4.5vw,24px)] font-bold"
                style={{ color: colors.fontColor }}
              >
                {activeCard.custamp}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div 
            className="mt-3 h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: `${colors.fontColor}15` }}
          >
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${(activeCard.custamp / activeCard.reqstamp) * 100}%`,
                backgroundColor: colors.fontColor
              }}
            />
          </div>
        </button>
      )}

      {/* Create New Card Button */}
      {canCreateNew && (
        <Button
          onClick={handleCreateNewCard}
          disabled={isCreating}
          className="w-full max-w-md mb-6 h-14 text-[clamp(14px,3.5vw,16px)] font-medium rounded-2xl border-0 transition-opacity hover:opacity-90"
          style={{ 
            backgroundColor: colors.fontColor, 
            color: colors.bgColor,
          }}
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
        <div className="w-full max-w-md mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
              <span 
                className="text-[clamp(28px,7vw,36px)] font-bold"
                style={{ color: colors.fontColor }}
              >
                {completedCards.length}
              </span>
              <span 
                className="text-[clamp(12px,3vw,14px)] font-medium tracking-wide uppercase"
                style={{ color: colors.fontColor, opacity: 0.7 }}
              >
                Aguardando resgate
              </span>
            </div>
            <button
              onClick={() => setCompletedSort(cycleSortType(completedSort))}
              className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
              style={{ backgroundColor: `${colors.fontColor}10` }}
            >
              {(() => {
                const SortIconComponent = getSortIcon(completedSort);
                return <SortIconComponent className="w-3 h-3" style={{ color: colors.fontColor, opacity: 0.6 }} />;
              })()}
              <span 
                className="text-[clamp(9px,2.2vw,10px)] font-medium"
                style={{ color: colors.fontColor, opacity: 0.6 }}
              >
                {getSortLabel(completedSort)}
              </span>
            </button>
          </div>
          <div className="space-y-3">
            {completedCards.map((card) => {
              // Invert colors for completed cards
              const completedBgColor = colors.fontColor;
              const completedFontColor = colors.bgColor;
              return (
                <button
                  key={card.id}
                  className="w-full p-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ 
                    backgroundColor: completedBgColor,
                    border: `1px solid ${completedFontColor}20`
                  }}
                  onClick={() => navigate(`/card/${card.cardcode}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p 
                        className="font-mono text-[clamp(14px,3.5vw,16px)] font-bold tracking-[2px]"
                        style={{ color: completedFontColor }}
                      >
                        {card.cardcode}
                      </p>
                      <p 
                        className="text-[clamp(10px,2.5vw,11px)] font-light"
                        style={{ color: completedFontColor, opacity: 0.6 }}
                      >
                        Completado em {card.completedat 
                          ? format(new Date(card.completedat), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : format(new Date(card.created_at), "dd/MM/yyyy", { locale: ptBR })
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" style={{ color: completedFontColor }} />
                      <span 
                        className="text-[clamp(12px,3vw,13px)] font-medium"
                        style={{ color: completedFontColor }}
                      >
                        {card.reqstamp}/{card.reqstamp}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rescued Cards */}
      {rescuedCards.length > 0 && (
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5" style={{ color: colors.fontColor, opacity: 0.6 }} />
              <span 
                className="text-[clamp(28px,7vw,36px)] font-bold"
                style={{ color: colors.fontColor, opacity: 0.6 }}
              >
                {rescuedCards.length}
              </span>
              <span 
                className="text-[clamp(12px,3vw,14px)] font-medium tracking-wide uppercase"
                style={{ color: colors.fontColor, opacity: 0.5 }}
              >
                Resgatados
              </span>
            </div>
            <button
              onClick={() => setRescuedSort(cycleSortType(rescuedSort))}
              className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
              style={{ backgroundColor: `${colors.fontColor}10` }}
            >
              {(() => {
                const SortIconComponent = getSortIcon(rescuedSort);
                return <SortIconComponent className="w-3 h-3" style={{ color: colors.fontColor, opacity: 0.6 }} />;
              })()}
              <span 
                className="text-[clamp(9px,2.2vw,10px)] font-medium"
                style={{ color: colors.fontColor, opacity: 0.6 }}
              >
                {getSortLabel(rescuedSort)}
              </span>
            </button>
          </div>
          <div className="space-y-3">
            {rescuedCards.map((card) => (
              <button
                key={card.id}
                className="w-full p-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ 
                  backgroundColor: `${colors.fontColor}05`,
                  border: `1px solid ${colors.fontColor}10`
                }}
                onClick={() => navigate(`/card/${card.cardcode}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-mono text-[clamp(14px,3.5vw,16px)] font-bold tracking-[2px]"
                      style={{ color: colors.fontColor, opacity: 0.5 }}
                    >
                      {card.cardcode}
                    </p>
                    <p 
                      className="text-[clamp(10px,2.5vw,11px)] font-light"
                      style={{ color: colors.fontColor, opacity: 0.4 }}
                    >
                      Completado em {card.completedat 
                        ? format(new Date(card.completedat), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : format(new Date(card.created_at), "dd/MM/yyyy", { locale: ptBR })
                      }
                    </p>
                  </div>
                  <span 
                    className="text-[clamp(9px,2.2vw,10px)] px-2 py-1 rounded-full font-medium uppercase tracking-wide"
                    style={{ backgroundColor: `${colors.fontColor}20`, color: colors.fontColor }}
                  >
                    Resgatado
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="text-center">
          <p 
            className="font-light mb-4"
            style={{ color: colors.fontColor, opacity: 0.6 }}
          >
            Nenhum cartão encontrado
          </p>
          <Button
            onClick={handleCreateNewCard}
            disabled={isCreating}
            className="h-12 px-8 text-[clamp(14px,3.5vw,16px)] font-medium rounded-2xl border-0 transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: colors.fontColor, 
              color: colors.bgColor,
            }}
          >
            {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Criar Primeiro Cartão
          </Button>
        </div>
      )}

      {/* Footer */}
      <p 
        className="mt-8 text-[clamp(9px,2.2vw,10px)] tracking-[1.5px] uppercase font-light"
        style={{ color: colors.fontColor, opacity: 0.3 }}
      >
        FIDELICARD ®
      </p>
    </div>
  );
};

export default ClientCards;
