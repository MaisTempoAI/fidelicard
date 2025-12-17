import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Loader2, ArrowLeft, Gift, RotateCcw, Scissors, Armchair, Clock } from "lucide-react";
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
  const primaryColor = coCardData?.pricolour || companyData?.primarycolour || "#f97316";
  const secondaryColor = coCardData?.seccolour || companyData?.secundarycolour || "#ea580c";
  const companyLogo = companyData?.elogo;
  const companyType = companyData?.type?.toUpperCase() || "DEFAULT";

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
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;

  // BARBER Layout
  if (companyType === 'BARBER') {
    return (
      <div className="bg-[#e5e5e5] min-h-[100dvh] flex items-center justify-center p-2.5 md:bg-gradient-to-br md:from-[#1a1a1a] md:to-[#2d2d2d] font-outfit">
        <div className="bg-[#121212] w-[calc(100vw-20px)] max-w-[400px] min-w-[320px] max-h-[calc(100dvh-20px)] rounded-[40px] py-[30px] px-[25px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] flex flex-col items-center gap-[clamp(15px,3vh,30px)] text-white md:shadow-[0_50px_100px_rgba(0,0,0,0.7)] overflow-auto">
          
          {/* Header */}
          <header className="w-full text-center mb-[clamp(5px,1vh,10px)]">
            <div className="flex items-center justify-center gap-3 text-[clamp(32px,8vw,42px)] font-light tracking-tight mb-[clamp(8px,1.5vh,15px)]">
              <Scissors className="text-[#dcd0c0] w-[clamp(26px,6.5vw,32px)] h-[clamp(26px,6.5vw,32px)]" />
              <span className="font-light">{companyName.split(' ')[0]}<span className="font-extrabold">{companyName.split(' ').slice(1).join(' ') || 'Shop'}</span></span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[clamp(18px,4.5vw,22px)] font-bold text-white">{clientName}</div>
              <div className="flex flex-wrap justify-center gap-3 text-[clamp(11px,3vw,14px)] font-medium text-[#888] bg-white/5 py-1.5 px-3.5 rounded-[20px]">
                <span>#{cardData.cardcode}</span>
                {daysRemaining !== null && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {daysRemaining > 0 ? `${daysRemaining} dias` : 'Expirado'}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Stamps Area */}
          <div className="w-full bg-[#dcd0c0] rounded-[30px] p-[clamp(25px,4vh,40px)_18px] flex flex-col items-center shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]">
            <div className="grid grid-cols-5 gap-[clamp(12px,2.5vh,20px)_10px] w-full justify-items-center mb-[clamp(12px,2vh,25px)]">
              {stamps.map((filled, i) => (
                <div key={i} className="stamp">
                  <Armchair 
                    className={`w-[clamp(26px,6vw,34px)] h-[clamp(26px,6vw,34px)] transition-transform duration-200 ${
                      filled 
                        ? 'text-[#121212] scale-110' 
                        : 'text-[#a89f91] opacity-35'
                    }`} 
                  />
                </div>
              ))}
            </div>
            <p className="text-[#5a5246] text-[clamp(11px,3vw,14px)] font-semibold text-center tracking-wide px-2.5">
              {loyaltyText}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-4 py-[clamp(8px,1.5vh,10px)] border-y border-white/10">
            <div className="flex flex-col items-center justify-center py-2 border-r border-white/10">
              <span className="text-[clamp(10px,2.5vw,13px)] uppercase tracking-[2px] text-[#888] mb-1">Faltam</span>
              <div className="text-[clamp(20px,5.5vw,28px)] font-extrabold text-[#dcd0c0]">
                {remainingStamps} <span className="text-white text-[clamp(11px,3vw,14px)] font-normal ml-1">visitas</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-[clamp(10px,2.5vw,13px)] uppercase tracking-[2px] text-[#888] mb-1">Total</span>
              <div className="text-[clamp(20px,5.5vw,28px)] font-extrabold text-[#dcd0c0]">
                {String(currentStamps).padStart(2, '0')} <span className="text-white text-[clamp(11px,3vw,14px)] font-normal ml-1">selos</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex flex-col items-center gap-[clamp(10px,2vh,15px)] w-full">
            <div className="font-space-mono text-[clamp(18px,5vw,24px)] font-bold tracking-[clamp(4px,1.5vw,6px)] opacity-90 text-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {cardData.cardcode}
            </div>
            
            <div className="bg-white p-2.5 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-[clamp(110px,28vw,140px)] h-[clamp(110px,28vw,140px)] flex items-center justify-center">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-full h-auto mix-blend-multiply" 
              />
            </div>
            
            <div className="text-[clamp(8px,2vw,10px)] tracking-[2px] text-[#444] font-bold mt-1">
              FIDELICARD ®
            </div>
          </div>

        </div>
      </div>
    );
  }

  // DEFAULT Layout (existing)
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Back Button */}
      <div className="w-full max-w-sm relative z-10 mb-4">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Flip Card Container */}
      <div className="flip-card w-full max-w-sm relative z-10">
        <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front of Card */}
          <Card className={`flip-card-front w-full shadow-xl overflow-hidden ${
            cardData.rescued 
              ? "border-gray-400/30" 
              : "border-primary/20"
          }`}>
            {/* Rescued Banner */}
            {cardData.rescued && (
              <div className="bg-gray-500 text-white text-center py-2 px-4">
                <div className="flex items-center justify-center gap-2">
                  <Gift className="w-4 h-4" />
                  <span className="font-bold text-sm">CARTÃO RESGATADO</span>
                </div>
              </div>
            )}

            {/* Header */}
            <CardHeader className={`text-center pb-4 ${
              cardData.rescued 
                ? "bg-gray-400 text-white" 
                : "gradient-warm text-primary-foreground"
            }`}>
              <div className="flex items-center justify-center gap-2">
                <UtensilsCrossed className="w-6 h-6" />
                <h1 className="text-xl font-bold">{companyName}</h1>
              </div>
              <p className={`text-sm ${cardData.rescued ? "text-white/80" : "text-primary-foreground/80"}`}>
                {cardData.rescued ? "Cartão Utilizado" : "Fidelidade"}
              </p>
            </CardHeader>

            <CardContent className="pt-6 pb-6">
              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-base font-semibold text-foreground leading-relaxed text-balance max-w-[280px] mx-auto">
                  {loyaltyText}
                </h2>
                <p className="text-3xl font-bold text-primary mt-3">
                  Selos: {currentStamps}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code do cartão"
                    className="w-40 h-40"
                  />
                </div>
              </div>

              {/* External Code */}
              <div className="text-center mb-6">
                <span className="font-mono text-2xl font-bold text-primary tracking-widest">
                  {cardData.cardcode}
                </span>
              </div>

              {/* Stamps Grid */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {stamps.map((filled, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                      filled
                        ? "bg-[hsl(var(--stamp-filled))] shadow-md"
                        : "bg-[hsl(var(--stamp-empty))]"
                    }`}
                  >
                    <span className={filled ? "stamp-pulse" : "opacity-40"}>
                      🍽️
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress text */}
              <p className="text-center text-muted-foreground text-sm mb-2">
                {cardData.rescued
                  ? "✅ Este cartão já foi resgatado"
                  : cardData.completed
                  ? "🎉 Parabéns! Você completou seu cartão!"
                  : `Faltam ${remainingStamps} Selos para completar seu cartão!`}
              </p>

              {/* Exchange Products - hide if rescued */}
              {exchangeProducts && !cardData.rescued && (
                <p className="text-center text-foreground font-medium text-sm">
                  Troque por: <span className="text-primary">{exchangeProducts}</span>
                </p>
              )}

              {/* Flip Button */}
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => setIsFlipped(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Virar cartão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Back of Card */}
          <Card 
            className="flip-card-back w-full shadow-xl overflow-hidden border-primary/20"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
            }}
          >
            <div className="h-full flex flex-col items-center justify-between p-8 relative">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full" />
                <div className="absolute bottom-4 right-4 w-32 h-32 border-2 border-white rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-full" />
              </div>

              {/* Company Logo or Name */}
              <div className="relative z-10 text-center flex-1 flex flex-col items-center justify-center">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt={companyName}
                    className="w-32 h-32 object-contain mx-auto mb-6 drop-shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                    <UtensilsCrossed className="w-16 h-16 text-white" />
                  </div>
                )}
                
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                  {companyName}
                </h2>
                <p className="text-white/80 text-sm">
                  Cartão Fidelidade
                </p>

                {/* Card Code */}
                <div className="mt-6 bg-white/20 px-6 py-3 rounded-xl">
                  <span className="font-mono text-xl font-bold text-white tracking-widest">
                    {cardData.cardcode}
                  </span>
                </div>

                {/* Flip Button */}
                <Button
                  onClick={() => setIsFlipped(false)}
                  variant="secondary"
                  size="sm"
                  className="mt-6 gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Voltar
                </Button>
              </div>

              {/* Expiration Info */}
              {daysRemaining !== null && (
                <div className="relative z-10 mt-4 text-center">
                  <div className={`px-4 py-2 rounded-lg ${
                    daysRemaining <= 0 
                      ? 'bg-red-500/30' 
                      : daysRemaining <= 7 
                        ? 'bg-yellow-500/30' 
                        : 'bg-white/20'
                  }`}>
                    <p className="text-white text-sm font-medium">
                      {daysRemaining <= 0 
                        ? "⚠️ Cartão expirado" 
                        : `⏰ Faltam ${daysRemaining} dias para expirar o seu cartão`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Mostre este QR Code ao atendente para ganhar seu selo
      </p>
    </div>
  );
};

export default CardPage;
