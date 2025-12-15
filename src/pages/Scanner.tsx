import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, ArrowLeft, Camera, Search, Loader2, CheckCircle, XCircle, Check, Gift } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { getCardByCode, getClientByCardId, getCompany } from "@/hooks/useLoyalty";
import { addStampToCard, rescueCard } from "@/hooks/useAdmin";

interface ScannedCard {
  cardId: number;
  cardcode: string;
  custamp: number;
  reqstamp: number;
  completed: boolean;
  rescued: boolean;
  clientName: string | null;
  clientPhone: string | null;
  companyName: string | null;
}

const Scanner = () => {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCard, setScannedCard] = useState<ScannedCard | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const companyId = localStorage.getItem("admin_company_id");

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    setScanError(null);
    setScannedCard(null);
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Extract card code from URL or direct code
          const cardCode = extractCardCode(decodedText);
          if (cardCode) {
            await stopScanner();
            await searchCard(cardCode);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (happens when no QR code is detected)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      setScanError(err.message || "Não foi possível acessar a câmera");
      toast.error("Erro ao acessar câmera", {
        description: "Verifique as permissões do navegador"
      });
    }
  };

  const extractCardCode = (text: string): string | null => {
    // Try to extract code from URL like /card/QDGXAC or full URL
    const urlMatch = text.match(/\/card\/([A-Z0-9]{6})/i);
    if (urlMatch) {
      return urlMatch[1].toUpperCase();
    }
    
    // Check if it's a direct 6-character code
    const codeMatch = text.match(/^[A-Z0-9]{6}$/i);
    if (codeMatch) {
      return text.toUpperCase();
    }

    return null;
  };

  const searchCard = async (code: string) => {
    setIsSearching(true);
    setScanError(null);
    
    try {
      const card = await getCardByCode(code);
      
      if (!card) {
        setScanError("Cartão não encontrado");
        setScannedCard(null);
        setIsSearching(false);
        return;
      }

      let clientName: string | null = null;
      let clientPhone: string | null = null;
      let companyName: string | null = null;

      if (card.idclient) {
        const client = await getClientByCardId(card.idclient);
        if (client) {
          clientName = client.nome;
          clientPhone = client.phone;
          
          if (client.eid) {
            const company = await getCompany(Number(client.eid));
            companyName = company?.name || null;
          }
        }
      }

      setScannedCard({
        cardId: card.id,
        cardcode: card.cardcode || code,
        custamp: Number(card.custamp) || 0,
        reqstamp: Number(card.reqstamp) || 10,
        completed: card.completed || false,
        rescued: card.rescued || false,
        clientName,
        clientPhone,
        companyName,
      });
    } catch (err) {
      console.error("Error searching card:", err);
      setScanError("Erro ao buscar cartão");
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      await searchCard(manualCode.toUpperCase());
    }
  };

  const [isAddingStamp, setIsAddingStamp] = useState(false);
  const [stampAdded, setStampAdded] = useState(false);
  const [isRescuing, setIsRescuing] = useState(false);
  const [rescued, setRescued] = useState(false);

  const handleAddStamp = async () => {
    if (!scannedCard || scannedCard.completed) return;
    
    setIsAddingStamp(true);
    try {
      await addStampToCard(scannedCard.cardId, scannedCard.custamp, scannedCard.reqstamp);
      
      const newStamps = scannedCard.custamp + 1;
      const isCompleted = newStamps >= scannedCard.reqstamp;
      
      setScannedCard({
        ...scannedCard,
        custamp: newStamps,
        completed: isCompleted,
      });
      
      setStampAdded(true);
      toast.success("Carimbo adicionado!", {
        description: `${scannedCard.clientName || "Cliente"} agora tem ${newStamps}/${scannedCard.reqstamp} carimbos`
      });
    } catch (err) {
      console.error("Error adding stamp:", err);
      toast.error("Erro ao adicionar carimbo");
    } finally {
      setIsAddingStamp(false);
    }
  };

  const handleRescue = async () => {
    if (!scannedCard || !scannedCard.completed || scannedCard.rescued) return;
    
    setIsRescuing(true);
    try {
      const { success, error } = await rescueCard(scannedCard.cardId);
      
      if (success) {
        setScannedCard({
          ...scannedCard,
          rescued: true,
        });
        setRescued(true);
        toast.success("Cartão resgatado!", {
          description: `${scannedCard.clientName || "Cliente"} resgatou seu prêmio!`
        });
      } else {
        toast.error(error || "Erro ao resgatar cartão");
      }
    } catch (err) {
      console.error("Error rescuing card:", err);
      toast.error("Erro ao resgatar cartão");
    } finally {
      setIsRescuing(false);
    }
  };

  const handleReset = () => {
    setScannedCard(null);
    setScanError(null);
    setManualCode("");
    setStampAdded(false);
    setRescued(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            stopScanner();
            navigate("/admin");
          }}
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
          {/* Scanned Card Result */}
          {scannedCard ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-700">Cartão Encontrado!</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Nome:</span>{" "}
                    <span className="font-medium">{scannedCard.clientName || "-"}</span>
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Telefone:</span>{" "}
                    <span className="font-medium">{scannedCard.clientPhone || "-"}</span>
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Código:</span>{" "}
                    <span className="font-mono font-bold text-primary">{scannedCard.cardcode}</span>
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Carimbos:</span>{" "}
                    <span className="font-bold text-primary text-lg">{scannedCard.custamp}</span>
                    <span className="text-muted-foreground">/{scannedCard.reqstamp}</span>
                  </p>
                  {scannedCard.rescued ? (
                    <p className="text-purple-600 font-medium">🎁 Já Resgatado!</p>
                  ) : scannedCard.completed && (
                    <p className="text-green-600 font-medium">✓ Cartão Completo!</p>
                  )}
                </div>
              </div>

              {rescued ? (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-center">
                    <Gift className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <p className="font-semibold text-purple-700">Prêmio Resgatado!</p>
                    <p className="text-sm text-purple-600">
                      {scannedCard.clientName || "Cliente"} resgatou seu prêmio
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                  >
                    Escanear Outro Cartão
                  </Button>
                </div>
              ) : stampAdded ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
                    <Check className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="font-semibold text-green-700">Carimbo Adicionado!</p>
                    <p className="text-sm text-green-600">
                      Agora: <span className="font-bold">{scannedCard.custamp}/{scannedCard.reqstamp}</span> carimbos
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                  >
                    Escanear Outro Cartão
                  </Button>
                </div>
              ) : scannedCard.rescued ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  Escanear Outro Cartão
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleReset}
                  >
                    Novo Scan
                  </Button>
                  {scannedCard.completed ? (
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={handleRescue}
                      disabled={isRescuing}
                    >
                      {isRescuing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Gift className="w-4 h-4 mr-2" />
                      )}
                      RESGATAR
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 gradient-warm"
                      onClick={handleAddStamp}
                      disabled={isAddingStamp}
                    >
                      {isAddingStamp ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Adicionar Carimbo
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : scanError ? (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="font-medium text-destructive">{scanError}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <>
              {/* Camera View */}
              <div 
                ref={scannerContainerRef}
                className="aspect-square rounded-xl bg-secondary/50 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center mb-6 overflow-hidden relative"
              >
                <div id="qr-reader" className="w-full h-full" />
                
                {!isScanning && !isSearching && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80">
                    <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                    <Button
                      onClick={startScanner}
                      className="gradient-warm"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Iniciar Câmera
                    </Button>
                  </div>
                )}

                {isSearching && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                    <p className="text-muted-foreground">Buscando cartão...</p>
                  </div>
                )}
              </div>

              {isScanning && (
                <Button
                  variant="outline"
                  className="w-full mb-6"
                  onClick={stopScanner}
                >
                  Parar Scanner
                </Button>
              )}

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
                  disabled={!manualCode.trim() || isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Buscar Cartão
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Scanner;