import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Scissors, Star, X, Circle, Armchair, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: number;
  name: string | null;
  slug: string | null;
  elogo: string | null;
  active: boolean | null;
  phone: string | null;
  address: string | null;
  primarycolour: string | null;
  secundarycolour: string | null;
}

interface CoCard {
  id: number;
  name: string | null;
  text: string | null;
  pricolour: string | null;
  seccolour: string | null;
  stamps: number | null;
  icon: string | null;
  company: string | null;
  active: boolean | null;
}

interface CompanyWithCard extends Company {
  coCard: CoCard | null;
}

const Companies = () => {
  const [companiesWithCards, setCompaniesWithCards] = useState<CompanyWithCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompaniesAndCards = async () => {
      try {
        // Fetch active companies
        const { data: companies, error: companiesError } = await supabase
          .from("CRF-Companies")
          .select("id, name, slug, elogo, active, phone, address, primarycolour, secundarycolour")
          .eq("active", true)
          .order("name");

        if (companiesError) throw companiesError;

        // Fetch CoCards for each company
        const companiesWithCardsData: CompanyWithCard[] = await Promise.all(
          (companies || []).map(async (company) => {
            const { data: coCards } = await supabase
              .from("CRF-CoCards")
              .select("*")
              .eq("company", company.id.toString())
              .eq("active", true)
              .limit(1);

            return {
              ...company,
              coCard: coCards && coCards.length > 0 ? coCards[0] : null,
            };
          })
        );

        setCompaniesWithCards(companiesWithCardsData);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompaniesAndCards();
  }, []);

  const handleSelectCompany = (companyId: number) => {
    navigate(`/empresa/${companyId}`);
  };

  // Helper function to get the stamp icon component
  const getStampIcon = (iconType: string, filled: boolean, bgColor: string) => {
    const baseClass = `w-[clamp(22px,5vw,28px)] h-[clamp(22px,5vw,28px)] transition-transform duration-200`;
    const colorStyle = filled 
      ? { color: bgColor }
      : { color: '#a89f91', opacity: 0.35 };
    const scaleClass = filled ? 'scale-110' : '';

    switch (iconType) {
      case 'star':
        return <Star className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      case 'x':
        return <X className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      case 'circle':
        return <Circle className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
      default:
        return <Armchair className={`${baseClass} ${scaleClass}`} style={colorStyle} />;
    }
  };

  // Get base URL for QR code
  const baseUrl = window.location.origin;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-white/70 mt-4 font-light tracking-wide">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center p-4 pt-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-600/5 blur-3xl" />
      </div>

      {/* Top Buttons */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        {/* Seja um Parceiro Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all border border-amber-500/30 hover:border-amber-500/50"
          onClick={() => navigate("/seja-parceiro")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Seja um Parceiro
        </Button>

        {/* Admin Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white/50 hover:text-white hover:bg-amber-500/10 transition-all"
          onClick={() => navigate("/admin")}
        >
          <Settings className="w-4 h-4 mr-2" />
          Admin
        </Button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header - with more space */}
        <div className="text-center mb-16 mt-12">
          {/* Title with elegant typography */}
          <h1 className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            FIDELICARD
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
            <p className="text-white/80 text-sm tracking-[0.2em] uppercase font-light">
              Parceiros
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-6">
          {companiesWithCards.length === 0 ? (
            <div className="bg-[#252540] border border-amber-500/20 rounded-xl p-6 text-center">
              <p className="text-white/60">Nenhuma empresa cadastrada.</p>
            </div>
          ) : (
            companiesWithCards.map((company) => {
              const coCard = company.coCard;
              const cardBgColor = coCard?.pricolour || company.primarycolour || "#121212";
              const fontColor = coCard?.seccolour || company.secundarycolour || "#dcd0c0";
              const cardIcon = coCard?.icon || "armchair";
              const requiredStamps = coCard?.stamps || 10;
              const loyaltyText = coCard?.text || "Complete os selos e ganhe um brinde!";
              const companyName = company.name || "Empresa";
              
              // Sample stamps (3 filled for demo)
              const sampleFilledStamps = 3;
              const stamps = Array.from({ length: Math.min(requiredStamps, 10) }, (_, i) => i < sampleFilledStamps);

              return (
                <div
                  key={company.id}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  onClick={() => handleSelectCompany(company.id)}
                >
                  {/* Card Preview - Exact replica of Card.tsx design */}
                  <div 
                    className="w-full max-w-[380px] mx-auto rounded-[35px] py-[clamp(18px,2.5vh,28px)] px-[clamp(18px,4vw,22px)] shadow-[0_40px_80px_rgba(0,0,0,0.5)] flex flex-col items-center gap-[clamp(10px,1.8vh,18px)]"
                    style={{ backgroundColor: cardBgColor }}
                  >
                    
                    {/* Header */}
                    <header className="w-full text-center">
                      <div 
                        className="flex items-center justify-center gap-2.5 text-[clamp(22px,5.5vw,30px)] font-light tracking-tight mb-[clamp(5px,1vh,10px)]"
                        style={{ color: fontColor }}
                      >
                        <Scissors className="w-[clamp(18px,4.5vw,24px)] h-[clamp(18px,4.5vw,24px)]" style={{ color: fontColor }} />
                        <span className="font-light">{companyName.split(' ')[0]}<span className="font-extrabold">{companyName.split(' ').slice(1).join(' ') || ''}</span></span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1">
                        <div 
                          className="text-[clamp(15px,4vw,19px)] font-bold"
                          style={{ color: fontColor }}
                        >
                          Cliente
                        </div>
                        <div 
                          className="flex flex-wrap justify-center gap-2.5 text-[clamp(10px,2.5vw,12px)] font-medium py-1 px-3 rounded-[20px]"
                          style={{ backgroundColor: `${fontColor}10`, color: `${fontColor}88` }}
                        >
                          <span>#DEMO</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> 365 dias
                          </span>
                        </div>
                      </div>
                    </header>

                    {/* Stamps Area */}
                    <div 
                      className="w-full rounded-[25px] p-[clamp(16px,2.5vh,28px)_14px] flex flex-col items-center shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]"
                      style={{ backgroundColor: fontColor }}
                    >
                      <div className="grid grid-cols-5 gap-[clamp(8px,1.8vh,14px)_8px] w-full justify-items-center mb-[clamp(8px,1.5vh,16px)]">
                        {stamps.map((filled, i) => (
                          <div key={i} className="stamp">
                            {getStampIcon(cardIcon, filled, cardBgColor)}
                          </div>
                        ))}
                      </div>
                      <p 
                        className="text-[clamp(10px,2.5vw,12px)] font-semibold text-center tracking-wide px-2"
                        style={{ color: `${cardBgColor}99` }}
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
                        <span 
                          className="text-[clamp(9px,2vw,11px)] uppercase tracking-[1.5px] mb-0.5"
                          style={{ color: `${fontColor}88` }}
                        >
                          Faltam
                        </span>
                        <div className="text-[clamp(18px,4.5vw,24px)] font-extrabold" style={{ color: fontColor }}>
                          {requiredStamps - sampleFilledStamps} <span className="text-[clamp(10px,2.5vw,12px)] font-normal ml-0.5" style={{ color: `${fontColor}cc` }}>selos</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center py-1.5">
                        <span 
                          className="text-[clamp(9px,2vw,11px)] uppercase tracking-[1.5px] mb-0.5"
                          style={{ color: `${fontColor}88` }}
                        >
                          Total
                        </span>
                        <div 
                          className="text-[clamp(18px,4.5vw,24px)] font-extrabold"
                          style={{ color: fontColor }}
                        >
                          {sampleFilledStamps} <span className="text-[clamp(10px,2.5vw,12px)] font-normal ml-0.5" style={{ color: `${fontColor}cc` }}>selos</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex flex-col items-center gap-[clamp(6px,1.2vh,10px)] w-full">
                      <div 
                        className="font-space-mono text-[clamp(14px,4vw,20px)] font-bold tracking-[clamp(3px,1vw,5px)] opacity-90"
                        style={{ color: fontColor }}
                      >
                        DEMO123
                      </div>
                      
                      <div className="bg-white p-2 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-[clamp(80px,20vw,100px)] h-[clamp(80px,20vw,100px)] flex items-center justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl)}`}
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
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-white/30 mt-10 text-center relative z-10 text-xs tracking-[0.15em] uppercase font-light">
        FIDELICARD ®
      </p>
    </div>
  );
};

export default Companies;
