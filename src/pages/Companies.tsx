import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, Settings, Phone, MapPin, Scissors } from "lucide-react";
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
}

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from("CRF-Companies")
          .select("id, name, slug, elogo, active, phone, address, primarycolour")
          .eq("active", true)
          .order("name");

        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSelectCompany = (companyId: number) => {
    navigate(`/empresa/${companyId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-amber-200/70 mt-4 font-light tracking-wide">Carregando...</p>
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

      {/* Admin Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-20 text-amber-200/50 hover:text-amber-200 hover:bg-amber-500/10 transition-all"
        onClick={() => navigate("/admin")}
      >
        <Settings className="w-4 h-4 mr-2" />
        Admin
      </Button>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20">
            <Scissors className="w-9 h-9 text-white" />
          </div>
          
          {/* Title with elegant typography */}
          <h1 className="text-3xl font-bold text-amber-100 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            FIDELICARD
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
            <p className="text-amber-200/60 text-sm tracking-[0.2em] uppercase font-light">
              Seu Cartão Digital
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
        </div>

        {/* Section title */}
        <div className="mb-6">
          <p className="text-amber-200/80 text-center text-sm font-medium tracking-wide">
            Escolha o estabelecimento
          </p>
        </div>

        {/* Companies List */}
        <div className="space-y-4">
          {companies.length === 0 ? (
            <Card className="bg-[#252540] border-amber-500/20 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <p className="text-amber-200/60">Nenhuma empresa cadastrada.</p>
              </CardContent>
            </Card>
          ) : (
            companies.map((company) => {
              const primaryColor = company.primarycolour || "#d4a853";
              
              return (
                <Card
                  key={company.id}
                  className="bg-[#252540] border-amber-500/10 hover:border-amber-500/30 shadow-lg hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => handleSelectCompany(company.id)}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    {/* Company Logo/Icon */}
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                        boxShadow: `0 4px 20px ${primaryColor}30`
                      }}
                    >
                      {company.elogo ? (
                        <img
                          src={company.elogo}
                          alt={company.name || "Logo"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Scissors className="w-7 h-7 text-white" />
                      )}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <h2 
                        className="font-semibold text-amber-100 text-lg truncate tracking-wide"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {company.name || "Empresa"}
                      </h2>
                      {company.phone && (
                        <p className="text-sm text-amber-200/60 flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="font-light">{company.phone}</span>
                        </p>
                      )}
                      {company.address && (
                        <p className="text-xs text-amber-200/40 flex items-center gap-1.5 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="font-light">{company.address}</span>
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-amber-200/30 mt-10 text-center relative z-10 text-xs tracking-[0.15em] uppercase font-light">
        FIDELICARD ®
      </p>
    </div>
  );
};

export default Companies;
