import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Loader2, ArrowLeft, Gift, RotateCcw, Scissors, Armchair, Clock, Star, X, Circle, Car, Rocket, PawPrint, Beef, Settings, Square, ToyBrick, Wrench, Triangle, Glasses, Footprints, Pizza, Coffee, WashingMachine, Monitor, ShieldCheck, Bell } from "lucide-react";
import { getCardByCode, getClientByCardId, getCompany } from "@/hooks/useLoyalty";
import { getCoCardByUuid, CoCard } from "@/hooks/useCoCards";

interface CardData {
  cardcode: string;
  custamp: number;
  reqstamp: number;
  completed: boolean;
  rescued: boolean;
  expiredate: string | null;
  idemp: string | null;
}

interface ClientData {
  nome: string | null;
  phone: string | null;
  stamps: number | null;
}

interface CompanyData {
  name: string | null;
  loyaltytext: string | null;
  loyaltystamps: string | null;
  exchangeproducts: string | null;
  elogo: string | null;
  primarycolour: string | null;
  secundarycolour: string | null;
  type: string | null;
  icon: string | null;
}

const CardPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [coCardData, setCoCardData] = useState<CoCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!code) {
        setError("Código do cartão não encontrado");
        setIsLoading(false);
        return;
      }

      try {
        // Busca o cartão pelo código
        const card = await getCardByCode(code);
        if (!card) {
          setError("Cartão não encontrado");
          setIsLoading(false);
          return;
        }

        setCardData({
          cardcode: card.cardcode || code,
          custamp: Number(card.custamp) || 0,
          reqstamp: Number(card.reqstamp) || 10,
          completed: card.completed || false,
          rescued: card.rescued || false,
          expiredate: card.expiredate || null,
          idemp: card.idemp || null,
        });

        // Busca o CoCard (template da promoção) se existir referência
        if (card.idemp) {
          const { coCard } = await getCoCardByUuid(card.idemp);
          if (coCard) {
            setCoCardData(coCard);
          }
        }

        // Busca o cliente pelo cardid
        if (card.idclient) {
          const client = await getClientByCardId(card.idclient);
          if (client) {
            setClientData({
              nome: client.nome,
              phone: client.phone,
              stamps: Number(client.stamps) || 0,
            });

            // Busca a empresa pelo eid do cliente
            if (client.eid) {
              const company = await getCompany(Number(client.eid));
              if (company) {
                setCompanyData({
                  name: company.name,
                  loyaltytext: company.loyaltytext,
                  loyaltystamps: company.loyaltystamps,
                  exchangeproducts: company.exchangeproducts,
                  elogo: company.elogo,
                  primarycolour: company.primarycolour,
                  secundarycolour: company.secundarycolour,
                  type: company.type,
                  icon: company.icon,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching card data:", err);
        setError("Erro ao carregar dados do cartão");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4">Carregando seu cartão...</p>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm border-destructive/20">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive font-medium">{error || "Cartão não encontrado"}</p>
            <Button
              onClick={() => navigate("/")}
              className="mt-4"
              variant="outline"
            >
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStamps = cardData.custamp;
  const requiredStamps = cardData.reqstamp;
  const companyName = companyData?.name || "Meu Restaurante";
  const clientName = clientData?.nome || "Cliente";
  // Usa texto/cores do CoCard com fallback para empresa
  const loyaltyText = coCardData?.text || companyData?.loyaltytext || `Complete ${requiredStamps} selos e ganhe um almoço gratuito!`;
  const exchangeProducts = coCardData?.prod || companyData?.exchangeproducts;
  const remainingStamps = requiredStamps - currentStamps;
  
  // Check if card is completed
  const isCompleted = currentStamps >= requiredStamps || cardData.completed;
  
  // Card appearance from CoCard or company defaults - INVERT if completed
  const originalBgColor = coCardData?.pricolour || companyData?.primarycolour || "#121212";
  const originalFontColor = coCardData?.seccolour || companyData?.secundarycolour || "#dcd0c0";
  const cardBgColor = isCompleted ? originalFontColor : originalBgColor;
  const fontColor = isCompleted ? originalBgColor : originalFontColor;
  const cardIcon = coCardData?.icon || "armchair";
  const companyIcon = companyData?.icon || "scissors";
  const companyLogo = companyData?.elogo;

  // Helper function to get the company icon component
  const getCompanyIcon = () => {
    const iconClass = "w-[clamp(18px,4.5vw,24px)] h-[clamp(18px,4.5vw,24px)]";
    switch (companyIcon) {
      case 'utensils':
        return <UtensilsCrossed className={iconClass} style={{ color: fontColor }} />;
      case 'car':
        return <Car className={iconClass} style={{ color: fontColor }} />;
      case 'gift':
        return <Gift className={iconClass} style={{ color: fontColor }} />;
      case 'star':
        return <Star className={iconClass} style={{ color: fontColor }} />;
      case 'circle':
        return <Circle className={iconClass} style={{ color: fontColor }} />;
      case 'rocket':
        return <Rocket className={iconClass} style={{ color: fontColor }} />;
      case 'paw':
        return <PawPrint className={iconClass} style={{ color: fontColor }} />;
      case 'burger':
        return <Beef className={iconClass} style={{ color: fontColor }} />;
      case 'gear':
        return <Settings className={iconClass} style={{ color: fontColor }} />;
      case 'square':
        return <Square className={iconClass} style={{ color: fontColor }} />;
      case 'armchair':
        return <Armchair className={iconClass} style={{ color: fontColor }} />;

      // CompanyEditModal options
      case 'toy':
        return <ToyBrick className={iconClass} style={{ color: fontColor }} />;
      case 'hotdog':
        return <UtensilsCrossed className={iconClass} style={{ color: fontColor }} />;
      case 'wrench':
        return <Wrench className={iconClass} style={{ color: fontColor }} />;
      case 'pyramid':
        return <Triangle className={iconClass} style={{ color: fontColor }} />;
      case 'glasses':
        return <Glasses className={iconClass} style={{ color: fontColor }} />;
      case 'shoe':
        return <Footprints className={iconClass} style={{ color: fontColor }} />;
      case 'pizza':
        return <Pizza className={iconClass} style={{ color: fontColor }} />;
      case 'coffee':
        return <Coffee className={iconClass} style={{ color: fontColor }} />;
      case 'laundry':
        return <WashingMachine className={iconClass} style={{ color: fontColor }} />;
      case 'digital':
        return <Monitor className={iconClass} style={{ color: fontColor }} />;
      case 'protection':
        return <ShieldCheck className={iconClass} style={{ color: fontColor }} />;
      case 'alarm':
        return <Bell className={iconClass} style={{ color: fontColor }} />;

      default:
        return <Scissors className={iconClass} style={{ color: fontColor }} />;
    }
  };

  // Helper function to get the stamp icon component - always black stamps on light background
  const getStampIcon = (filled: boolean) => {
    const baseClass = `w-[clamp(22px,5vw,28px)] h-[clamp(22px,5vw,28px)] transition-transform duration-200`;
    const colorStyle = filled 
      ? { color: '#1a1a1a' }  // Fixed black for filled stamps
      : { color: '#d1d1d1' }; // Fixed light gray for empty stamps
    const scaleClass = filled ? 'scale-110' : '';

    switch (cardIcon) {
      case 'star':
        return <Star className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      case 'x':
        return <X className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      case 'circle':
        return <Circle className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      case 'rocket':
        return <Rocket className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      case 'paw':
        return <PawPrint className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      case 'burger':
        return <Beef className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      case 'gear':
        return <Settings className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      case 'square':
        return <Square className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      default:
        return <Armchair className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
    }
  };

  // Calculate days remaining until expiration
  const calculateDaysRemaining = () => {
    if (!cardData.expiredate) return null;
    const expireDate = new Date(cardData.expiredate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expireDate.setHours(0, 0, 0, 0);
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const daysRemaining = calculateDaysRemaining();

  const stamps = Array.from({ length: requiredStamps }, (_, i) => i < currentStamps);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${cardData.cardcode}`;

  // Single Layout (BARBER style) - now default for all cards
  return (
    <div className="bg-[#e5e5e5] h-[100dvh] flex items-center justify-center p-2.5 md:bg-gradient-to-br md:from-[#1a1a1a] md:to-[#2d2d2d] font-outfit overflow-hidden">
      <div 
        className="w-[calc(100vw-20px)] max-w-[380px] min-w-[300px] max-h-[calc(100dvh-20px)] rounded-[35px] py-[clamp(18px,2.5vh,28px)] px-[clamp(18px,4vw,22px)] shadow-[0_40px_80px_rgba(0,0,0,0.5)] flex flex-col items-center gap-[clamp(10px,1.8vh,18px)] md:shadow-[0_50px_100px_rgba(0,0,0,0.7)] overflow-hidden"
        style={{ backgroundColor: cardBgColor }}
      >
        
        {/* Header */}
        <header className="w-full text-center">
          <div 
            className="flex items-center justify-center gap-2.5 text-[clamp(22px,5.5vw,30px)] font-light tracking-tight mb-[clamp(5px,1vh,10px)]"
            style={{ color: fontColor }}
          >
            {getCompanyIcon()}
            <span className="font-light">{companyName.split(' ')[0]}<span className="font-extrabold">{companyName.split(' ').slice(1).join(' ') || 'Shop'}</span></span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <div 
              className="text-[clamp(15px,4vw,19px)] font-bold"
              style={{ color: fontColor }}
            >
              {clientName}
            </div>
            <div 
              className="flex flex-wrap justify-center gap-2.5 text-[clamp(10px,2.5vw,12px)] font-medium py-1 px-3 rounded-[20px]"
              style={{ backgroundColor: `${fontColor}10`, color: `${fontColor}88` }}
            >
              <span>#{cardData.cardcode}</span>
              {daysRemaining !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {daysRemaining > 0 ? `${daysRemaining} dias` : 'Expirado'}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Stamps Area - Always light background with black stamps */}
        <div 
          className="w-full rounded-[25px] p-[clamp(16px,2.5vh,28px)_14px] flex flex-col items-center shadow-[inset_0_0_40px_rgba(0,0,0,0.05)]"
          style={{ backgroundColor: '#f5f5f5' }}
        >
          <div className="grid grid-cols-5 gap-[clamp(8px,1.8vh,14px)_8px] w-full justify-items-center mb-[clamp(8px,1.5vh,16px)]">
            {stamps.map((filled, i) => (
              <div key={i} className="stamp">
                {getStampIcon(filled)}
              </div>
            ))}
          </div>
          <p 
            className="text-[clamp(10px,2.5vw,12px)] font-semibold text-center tracking-wide px-2"
            style={{ color: '#1a1a1a99' }}
          >
            {loyaltyText}
          </p>
        </div>

        {/* Stats Grid */}
        <div 
          className="w-full grid grid-cols-2 gap-3 py-[clamp(5px,1vh,8px)] border-y"
          style={{ borderColor: `${fontColor}20` }}
        >
          <div 
            className="flex flex-col items-center justify-center py-1.5 border-r"
            style={{ borderColor: `${fontColor}20` }}
          >
            {remainingStamps > 0 ? (
              <>
                <span 
                  className="text-[clamp(9px,2vw,11px)] uppercase tracking-[1.5px] mb-0.5"
                  style={{ color: `${fontColor}88` }}
                >
                  Faltam
                </span>
                <div className="text-[clamp(18px,4.5vw,24px)] font-extrabold" style={{ color: fontColor }}>
                  {remainingStamps} <span className="text-[clamp(10px,2.5vw,12px)] font-normal ml-0.5" style={{ color: `${fontColor}cc` }}>selos</span>
                </div>
              </>
            ) : cardData.rescued ? (
              <>
                <span 
                  className="text-[clamp(9px,2vw,11px)] uppercase tracking-[1.5px] mb-0.5"
                  style={{ color: `${fontColor}88` }}
                >
                  Status
                </span>
                <div 
                  className="text-[clamp(10px,2.5vw,12px)] font-extrabold uppercase tracking-wide"
                  style={{ color: fontColor }}
                >
                  Cartão Resgatado!
                </div>
              </>
            ) : (
              <>
                <span 
                  className="text-[clamp(9px,2vw,11px)] uppercase tracking-[1.5px] mb-0.5"
                  style={{ color: `${fontColor}88` }}
                >
                  Faltam
                </span>
                <div 
                  className="text-[clamp(11px,2.8vw,14px)] font-extrabold uppercase tracking-wide"
                  style={{ color: fontColor }}
                >
                  Cartão Completo
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col items-center justify-center py-1.5">
            <span 
              className="text-[clamp(9px,2vw,11px)] uppercase tracking-[1.5px] mb-0.5"
              style={{ color: `${fontColor}88` }}
            >
              Total
            </span>
            <div 
              className={`text-[clamp(18px,4.5vw,24px)] font-extrabold ${cardData.rescued ? 'line-through opacity-60' : ''}`}
              style={{ color: fontColor }}
            >
              {currentStamps} <span className={`text-[clamp(10px,2.5vw,12px)] font-normal ml-0.5 ${cardData.rescued ? '' : ''}`} style={{ color: `${fontColor}cc` }}>selos</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col items-center gap-[clamp(6px,1.2vh,10px)] w-full">
          <div 
            className="font-space-mono text-[clamp(14px,4vw,20px)] font-bold tracking-[clamp(3px,1vw,5px)] opacity-90"
            style={{ color: fontColor }}
          >
            {cardData.cardcode}
          </div>
          
          <div className="bg-white p-2 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-[clamp(80px,20vw,100px)] h-[clamp(80px,20vw,100px)] flex items-center justify-center">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-full h-auto" 
            />
          </div>
          
          <div className="text-[clamp(7px,1.8vw,9px)] tracking-[1.5px] text-[#444] font-bold">
            FIDELICARD ®
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardPage;
