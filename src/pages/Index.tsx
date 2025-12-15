import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UtensilsCrossed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { findOrCreateClientAndCard } from "@/hooks/useLoyalty";

// ID da empresa padrão (você pode mudar isso depois ou buscar dinamicamente)
const DEFAULT_COMPANY_ID = 1;

const Index = () => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { card } = await findOrCreateClientAndCard(phone, DEFAULT_COMPANY_ID);
      
      if (card?.cardcode) {
        navigate(`/card/${card.cardcode}`);
      } else {
        toast.error("Erro ao criar cartão. Tente novamente.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao acessar o cartão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidPhone = phone.replace(/\D/g, "").length === 11;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 rounded-full gradient-warm flex items-center justify-center mb-4 shadow-lg">
            <UtensilsCrossed className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Meu Restaurante</h1>
          <p className="text-muted-foreground mt-2">Programa de Fidelidade</p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <p className="text-foreground font-medium">
              Junte <span className="text-primary font-bold">10 carimbos</span> e ganhe um almoço grátis!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Seu número de telefone
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={16}
                className="text-center text-lg h-12 border-primary/30 focus:border-primary"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg gradient-warm hover:opacity-90 transition-opacity"
              disabled={!isValidPhone || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Acessar Meu Cartão"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Se você ainda não tem um cartão, criaremos um automaticamente.
          </p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-8 text-center">
        Cartão Fidelidade Digital • Meu Restaurante
      </p>
    </div>
  );
};

export default Index;
