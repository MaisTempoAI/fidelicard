import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Plus, Loader2 } from "lucide-react";
import { getCardByCode, getClientByCardId, getCompany } from "@/hooks/useLoyalty";

interface CardData {
  cardcode: string;
  custamp: number;
  reqstamp: number;
  completed: boolean;
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
}

const CardPage = () => {
  const { code } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        });

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

  const handleAddToHome = () => {
    alert("Para adicionar ao início:\n\niPhone: Toque em Compartilhar → Adicionar à Tela de Início\n\nAndroid: Menu ⋮ → Adicionar à tela inicial");
  };

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
              onClick={() => window.location.href = "/"}
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
  const loyaltyText = companyData?.loyaltytext || `Junte ${requiredStamps} carimbos e ganhe um almoço gratuito!`;

  const stamps = Array.from({ length: requiredStamps }, (_, i) => i < currentStamps);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-sm relative z-10 border-primary/20 shadow-xl overflow-hidden">
        {/* Header */}
        <CardHeader className="gradient-warm text-primary-foreground text-center pb-4">
          <div className="flex items-center justify-center gap-2">
            <UtensilsCrossed className="w-6 h-6" />
            <h1 className="text-xl font-bold">{companyName}</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm">Fidelidade</p>
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              {loyaltyText}
            </h2>
            <p className="text-3xl font-bold text-primary mt-2">
              Carimbos: {currentStamps}
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
          <p className="text-center text-muted-foreground text-sm mb-4">
            {cardData.completed
              ? "🎉 Parabéns! Você ganhou um almoço grátis!"
              : `Faltam ${requiredStamps - currentStamps} carimbos para o almoço grátis`}
          </p>

          {/* Add to Home Button */}
          <Button
            onClick={handleAddToHome}
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar ao Início
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Mostre este QR Code ao atendente para ganhar seu carimbo
      </p>
    </div>
  );
};

export default CardPage;
