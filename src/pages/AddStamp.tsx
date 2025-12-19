import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowLeft, Check, PartyPopper, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCardByCode, getClientByCardId, getCompany } from "@/hooks/useLoyalty";
import { addStampToCard } from "@/hooks/useAdmin";

interface CardData {
  id: number;
  cardcode: string;
  custamp: number;
  reqstamp: number;
  completed: boolean;
}

interface ClientData {
  nome: string | null;
  phone: string | null;
}

const AddStamp = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      if (!code) {
        setError("Código do cartão não fornecido");
        setIsLoading(false);
        return;
      }

      try {
        const card = await getCardByCode(code);
        
        if (!card) {
          setError("Cartão não encontrado");
          setIsLoading(false);
          return;
        }

        setCardData({
          id: card.id,
          cardcode: card.cardcode || code,
          custamp: Number(card.custamp) || 0,
          reqstamp: Number(card.reqstamp) || 10,
          completed: card.completed || false,
        });

        if (card.idclient) {
          const client = await getClientByCardId(card.idclient);
          if (client) {
            setClientData({
              nome: client.nome,
              phone: client.phone,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching card:", err);
        setError("Erro ao carregar dados do cartão");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardData();
  }, [code]);

  const handleAddStamp = async () => {
    if (!cardData || cardData.completed) return;

    setIsAdding(true);

    const { success, newStamps, isCompleted, error } = await addStampToCard(
      cardData.id,
      cardData.custamp,
      cardData.reqstamp
    );

    if (success) {
      setCardData(prev => prev ? {
        ...prev,
        custamp: newStamps || prev.custamp + 1,
        completed: isCompleted || false,
      } : null);

      if (isCompleted) {
        setShowConfetti(true);
        toast.success("🎉 Parabéns! Cartão completo!", {
          description: `${clientData?.nome || "Cliente"} ganhou a recompensa!`
        });
      } else {
        toast.success("Selo adicionado!", {
          description: `${newStamps}/${cardData.reqstamp} selos`
        });
      }
    } else {
      toast.error("Erro ao adicionar selo", {
        description: error || "Tente novamente"
      });
    }

    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4">Carregando cartão...</p>
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
              onClick={() => navigate("/admin/scanner")}
              className="mt-4"
              variant="outline"
            >
              Voltar ao Scanner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stamps = Array.from({ length: cardData.reqstamp }, (_, i) => i < cardData.custamp);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <PartyPopper className="w-32 h-32 text-primary animate-bounce" />
        </div>
      )}

      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/scanner")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-sm relative z-10 border-primary/20 shadow-xl overflow-hidden">
        {/* Header */}
        <CardHeader className="gradient-warm text-primary-foreground text-center pb-4">
          <div className="flex items-center justify-center gap-2">
            <UtensilsCrossed className="w-6 h-6" />
            <h1 className="text-xl font-bold">Adicionar Selo</h1>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          {/* Customer Info */}
          <div className="text-center mb-6 p-4 bg-secondary/50 rounded-xl">
            <p className="text-lg font-semibold text-foreground">{clientData?.nome || "Cliente"}</p>
            <p className="text-muted-foreground text-sm">{clientData?.phone || "-"}</p>
            <p className="font-mono text-primary font-bold mt-2">{cardData.cardcode}</p>
          </div>

          {/* Current stamps */}
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-primary">
              Selos: {cardData.custamp}/{cardData.reqstamp}
            </p>
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
                <span className={filled ? "" : "opacity-40"}>🍽️</span>
              </div>
            ))}
          </div>

          {/* Add Stamp Button */}
          <Button
            onClick={handleAddStamp}
            disabled={isAdding || cardData.completed}
            className={`w-full h-14 text-lg ${
              cardData.completed
                ? "bg-green-500 hover:bg-green-600"
                : "gradient-warm hover:opacity-90"
            }`}
          >
            {cardData.completed ? (
              <>
                <PartyPopper className="w-5 h-5 mr-2" />
                Cartão Completo!
              </>
            ) : isAdding ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Adicionar Selo
              </>
            )}
          </Button>

          {cardData.completed && (
            <Button
              variant="outline"
              className="w-full mt-3 border-primary/30"
              onClick={() => navigate("/admin")}
            >
              Voltar ao Painel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStamp;