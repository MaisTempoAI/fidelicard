import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Scissors, Star, X, Circle, Armchair, Sparkles } from "lucide-react";
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
    const baseClass = "w-4 h-4 transition-transform duration-200";
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
                  {/* Card Preview - Replica of the actual card design */}
                  <div 
                    className="rounded-[25px] py-5 px-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col items-center gap-3"
                    style={{ backgroundColor: cardBgColor }}
                  >
                    {/* Header */}
                    <header className="w-full text-center">
                      <div 
                        className="flex items-center justify-center gap-2 text-xl font-light tracking-tight"
                        style={{ color: fontColor }}
                      >
                        <Scissors className="w-5 h-5" style={{ color: fontColor }} />
                        <span className="font-light">{companyName.split(' ')[0]}<span className="font-extrabold">{companyName.split(' ').slice(1).join(' ') || ''}</span></span>
                      </div>
                    </header>

                    {/* Stamps Area */}
                    <div 
                      className="w-full rounded-[18px] p-4 flex flex-col items-center shadow-[inset_0_0_30px_rgba(0,0,0,0.1)]"
                      style={{ backgroundColor: fontColor }}
                    >
                      <div className="grid grid-cols-5 gap-2 w-full justify-items-center mb-2">
                        {stamps.map((filled, i) => (
                          <div key={i} className="stamp">
                            {getStampIcon(cardIcon, filled, cardBgColor)}
                          </div>
                        ))}
                      </div>
                      <p 
                        className="text-[10px] font-semibold text-center tracking-wide px-2 line-clamp-2"
                        style={{ color: `${cardBgColor}99` }}
                      >
                        {loyaltyText}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between w-full px-2">
                      <div 
                        className="text-[9px] tracking-[1px] font-medium"
                        style={{ color: `${fontColor}88` }}
                      >
                        {requiredStamps} SELOS
                      </div>
                      <div className="text-[7px] tracking-[1.5px] font-bold" style={{ color: `${fontColor}66` }}>
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
