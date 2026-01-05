import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Settings, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getCompanyByIdOrSlug } from "@/hooks/useLoyalty";
import { getFirstActiveCoCardColors, CompanyColors } from "@/hooks/useCoCards";

interface CompanyData {
  id: number;
  name: string | null;
  loyaltytext: string | null;
  loyaltystamps: string | null;
  elogo: string | null;
}

const CompanyPage = () => {
  const { companyId } = useParams();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [colors, setColors] = useState<CompanyColors>({ bgColor: '#121212', fontColor: '#dcd0c0' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        navigate("/");
        return;
      }

      try {
        const data = await getCompanyByIdOrSlug(companyId);
        if (!data) {
          toast.error("Empresa não encontrada");
          navigate("/");
          return;
        }
        setCompany({
          id: data.id,
          name: data.name,
          loyaltytext: data.loyaltytext,
          loyaltystamps: data.loyaltystamps,
          elogo: data.elogo,
        });

        // Fetch colors from first active CoCard
        const companyColors = await getFirstActiveCoCardColors(data.id);
        setColors(companyColors);
      } catch (error) {
        console.error("Error fetching company:", error);
        toast.error("Erro ao carregar empresa");
        navigate("/");
      } finally {
        setIsLoadingCompany(false);
      }
    };

    fetchCompany();
  }, [companyId, navigate]);

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
    if (!company) return;
    
    setIsLoading(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      navigate(`/empresa/${company.id}/cartoes?phone=${cleanedPhone}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao acessar o cartão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidPhone = phone.replace(/\D/g, "").length === 11;

  if (isLoadingCompany) {
    return (
      <div 
        className="min-h-[100dvh] flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: colors.bgColor }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.fontColor }} />
        <p className="mt-4 font-light" style={{ color: colors.fontColor, opacity: 0.6 }}>Carregando...</p>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  const loyaltyText = company.loyaltytext || "Junte 10 selos e ganhe um prêmio!";

  return (
    <div 
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-8 overflow-hidden"
      style={{ backgroundColor: colors.bgColor }}
    >
      {/* Top Buttons */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        {/* Left side buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hover:bg-white/10 h-12 px-4 text-base"
            style={{ color: colors.fontColor, opacity: 0.8 }}
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <Button
            variant="ghost"
            className="hover:bg-white/10 h-12 px-4 text-base border"
            style={{ color: colors.fontColor, opacity: 0.8, borderColor: `${colors.fontColor}30` }}
            onClick={() => navigate("/seja-parceiro")}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Seja um Parceiro
          </Button>
        </div>

        {/* Admin Button */}
        <Button
          variant="ghost"
          className="hover:bg-white/10 h-12 px-4 text-base"
          style={{ color: colors.fontColor, opacity: 0.8 }}
          onClick={() => navigate("/admin")}
        >
          <Settings className="w-5 h-5 mr-2" />
          Admin
        </Button>
      </div>

      {/* Logo - only show if company has an elogo */}
      {company.elogo && (
        <div className="mb-6">
          <img
            src={company.elogo}
            alt={company.name || "Logo"}
            className="w-[clamp(60px,15vw,80px)] h-[clamp(60px,15vw,80px)] rounded-full object-cover"
            style={{ border: `2px solid ${colors.fontColor}20` }}
          />
        </div>
      )}

      {/* Company Name */}
      <h1 
        className="text-[clamp(24px,6vw,36px)] font-light tracking-tight text-center mb-1"
        style={{ color: colors.fontColor, fontFamily: "'Playfair Display', serif" }}
      >
        {company.name || "Empresa"}
      </h1>

      {/* Subtitle */}
      <p 
        className="text-[clamp(12px,3vw,14px)] font-light tracking-[1.5px] uppercase mb-8"
        style={{ color: colors.fontColor, opacity: 0.5 }}
      >
        Programa de Fidelidade
      </p>

      {/* Separator */}
      <div 
        className="w-16 h-[1px] mb-8"
        style={{ backgroundColor: colors.fontColor, opacity: 0.2 }}
      />

      {/* Loyalty Text */}
      <p 
        className="text-[clamp(14px,3.5vw,16px)] text-center font-light mb-10 max-w-[280px] leading-relaxed"
        style={{ color: colors.fontColor, opacity: 0.8 }}
      >
        {loyaltyText}
      </p>

      {/* Phone Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-[280px] space-y-4">
        <div className="space-y-2">
          <label 
            htmlFor="phone" 
            className="text-[clamp(11px,2.8vw,12px)] font-medium tracking-wide uppercase block text-center"
            style={{ color: colors.fontColor, opacity: 0.6 }}
          >
            Seu número de telefone
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={16}
            disabled={isLoading}
            className="text-center text-[clamp(16px,4vw,18px)] h-14 border-0 rounded-2xl font-light"
            style={{ 
              backgroundColor: colors.fontColor, 
              color: colors.bgColor,
            }}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-14 text-[clamp(14px,3.5vw,16px)] font-medium rounded-2xl border-0 transition-opacity hover:opacity-90"
          style={{ 
            backgroundColor: colors.fontColor, 
            color: colors.bgColor,
          }}
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

      {/* Help text */}
      <p 
        className="text-[clamp(10px,2.5vw,11px)] text-center mt-6 font-light"
        style={{ color: colors.fontColor, opacity: 0.4 }}
      >
        Se você ainda não tem um cartão, criaremos um automaticamente.
      </p>

      {/* Footer */}
      <p 
        className="absolute bottom-6 text-[clamp(9px,2.2vw,10px)] tracking-[1.5px] uppercase font-light"
        style={{ color: colors.fontColor, opacity: 0.3 }}
      >
        FIDELICARD ®
      </p>
    </div>
  );
};

export default CompanyPage;
