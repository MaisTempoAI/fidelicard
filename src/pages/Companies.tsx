import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UtensilsCrossed, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: number;
  name: string | null;
  slug: string | null;
  elogo: string | null;
  active: boolean | null;
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
          .select("id, name, slug, elogo, active")
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4">Carregando empresas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-8">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full gradient-warm flex items-center justify-center mb-4 shadow-lg">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cartão Fidelidade</h1>
          <p className="text-muted-foreground mt-2">Escolha o estabelecimento</p>
        </div>

        {/* Companies List */}
        <div className="space-y-3">
          {companies.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Nenhuma empresa cadastrada.</p>
              </CardContent>
            </Card>
          ) : (
            companies.map((company) => (
              <Card
                key={company.id}
                className="border-primary/20 shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleSelectCompany(company.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Company Logo/Icon */}
                  <div className="w-14 h-14 rounded-full gradient-warm flex items-center justify-center shadow-sm flex-shrink-0">
                    {company.elogo ? (
                      <img
                        src={company.elogo}
                        alt={company.name || "Logo"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-foreground text-lg truncate">
                      {company.name || "Empresa"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Programa de Fidelidade
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-8 text-center relative z-10">
        Cartão Fidelidade Digital
      </p>
    </div>
  );
};

export default Companies;
