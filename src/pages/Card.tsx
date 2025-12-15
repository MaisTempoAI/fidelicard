import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Plus } from "lucide-react";

const CardPage = () => {
  const { code } = useParams();
  
  // Mock data
  const mockData = {
    external_code: code || "H6KQWA",
    current_stamps: 4,
    customer_name: "João Silva",
    is_completed: false,
  };

  const stamps = Array.from({ length: 10 }, (_, i) => i < mockData.current_stamps);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;

  const handleAddToHome = () => {
    alert("Para adicionar ao início:\n\niPhone: Toque em Compartilhar → Adicionar à Tela de Início\n\nAndroid: Menu ⋮ → Adicionar à tela inicial");
  };

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
            <h1 className="text-xl font-bold">Meu Restaurante</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm">Fidelidade</p>
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Junte 10 carimbos e ganhe um almoço gratuito!
            </h2>
            <p className="text-3xl font-bold text-primary mt-2">
              Carimbos: {mockData.current_stamps}
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
              {mockData.external_code}
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
            {mockData.is_completed
              ? "🎉 Parabéns! Você ganhou um almoço grátis!"
              : `Faltam ${10 - mockData.current_stamps} carimbos para o almoço grátis`}
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
