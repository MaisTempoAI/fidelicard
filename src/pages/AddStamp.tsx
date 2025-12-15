import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowLeft, Check, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AddStamp = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock data
  const [mockData, setMockData] = useState({
    external_code: code || "H6KQWA",
    current_stamps: 4,
    customer_name: "João Silva",
    customer_phone: "(11) 99999-1111",
    is_completed: false,
  });

  const stamps = Array.from({ length: 10 }, (_, i) => i < mockData.current_stamps);

  const handleAddStamp = async () => {
    if (mockData.is_completed) {
      toast({
        title: "Cartão já completo",
        description: "Este cliente já completou o cartão fidelidade.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newStamps = mockData.current_stamps + 1;
    const completed = newStamps >= 10;

    setMockData((prev) => ({
      ...prev,
      current_stamps: newStamps,
      is_completed: completed,
    }));

    if (completed) {
      setShowConfetti(true);
      toast({
        title: "🎉 Parabéns!",
        description: "O cliente completou o cartão e ganhou um almoço grátis!",
      });
    } else {
      toast({
        title: "Carimbo adicionado!",
        description: `${newStamps}/10 carimbos`,
      });
    }

    setIsAdding(false);
  };

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
          onClick={() => navigate("/admin")}
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
            <h1 className="text-xl font-bold">Adicionar Carimbo</h1>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          {/* Customer Info */}
          <div className="text-center mb-6 p-4 bg-secondary/50 rounded-xl">
            <p className="text-lg font-semibold text-foreground">{mockData.customer_name}</p>
            <p className="text-muted-foreground text-sm">{mockData.customer_phone}</p>
            <p className="font-mono text-primary font-bold mt-2">{mockData.external_code}</p>
          </div>

          {/* Current stamps */}
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-primary">
              Carimbos: {mockData.current_stamps}/10
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
            disabled={isAdding || mockData.is_completed}
            className={`w-full h-14 text-lg ${
              mockData.is_completed
                ? "bg-green-500 hover:bg-green-600"
                : "gradient-warm hover:opacity-90"
            }`}
          >
            {mockData.is_completed ? (
              <>
                <PartyPopper className="w-5 h-5 mr-2" />
                Cartão Completo!
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                {isAdding ? "Adicionando..." : "Adicionar Carimbo"}
              </>
            )}
          </Button>

          {mockData.is_completed && (
            <Button
              variant="outline"
              className="w-full mt-3 border-primary/30"
              onClick={() => {
                setMockData((prev) => ({ ...prev, current_stamps: 0, is_completed: false }));
                setShowConfetti(false);
                toast({
                  title: "Cartão resetado",
                  description: "Novo ciclo iniciado para o cliente.",
                });
              }}
            >
              Iniciar Novo Ciclo
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStamp;
