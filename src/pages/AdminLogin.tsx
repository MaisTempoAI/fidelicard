import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";
import { authenticateCompany } from "@/hooks/useAdmin";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    const { company, error } = await authenticateCompany(email, password);

    if (error || !company) {
      toast.error(error || "Credenciais inválidas");
      setIsLoading(false);
      return;
    }

    // Store company info in localStorage
    localStorage.setItem("admin_logged_in", "true");
    localStorage.setItem("admin_company_id", String(company.id));
    localStorage.setItem("admin_company_name", company.name || "");
    localStorage.setItem("admin_company_logo", company.elogo || "");
    localStorage.setItem("admin_company_stamps", company.loyaltystamps || "10");

    toast.success("Login realizado com sucesso!");
    navigate("/admin");
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#2a2a2a] shadow-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#b8860b]" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display text-white">
              Área Administrativa
            </CardTitle>
            <CardDescription className="text-[#888] mt-2">
              Acesso restrito para funcionários
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#aaa]">
                Email ou Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <Input
                  id="email"
                  type="text"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-[#555] focus:border-[#b8860b] focus:ring-[#b8860b]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#aaa]">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-[#555] focus:border-[#b8860b] focus:ring-[#b8860b]/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#b8860b] hover:bg-[#a07608] text-white font-medium py-6 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-xs text-[#666] mt-6">
            Sistema de fidelidade
          </p>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminLogin;
