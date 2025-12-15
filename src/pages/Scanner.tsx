import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, ArrowLeft, Camera, Search } from "lucide-react";

const Scanner = () => {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      navigate(`/admin/add-stamp/${manualCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
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
            <h1 className="text-xl font-bold">Escanear QR Code</h1>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          {/* Camera placeholder */}
          <div className="aspect-square rounded-xl bg-secondary/50 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center mb-6">
            <Camera className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center px-4">
              Câmera será ativada quando conectar ao Supabase
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Manual code input */}
          <form onSubmit={handleManualSearch} className="space-y-3">
            <Input
              placeholder="Digite o código (ex: H6KQWA)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg tracking-widest border-primary/30"
              maxLength={6}
            />
            <Button
              type="submit"
              variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-primary/10"
              disabled={!manualCode.trim()}
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar Cartão
            </Button>
          </form>

          {/* Demo buttons */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Demonstração - Clientes fictícios:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["H6KQWA", "K9PLMX", "N2RTWS"].map((code) => (
                <Button
                  key={code}
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/admin/add-stamp/${code}`)}
                  className="font-mono"
                >
                  {code}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Scanner;
