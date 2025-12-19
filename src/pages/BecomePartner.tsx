import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Gift, Clock, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const BecomePartner = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    businessType: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Solicitação enviada com sucesso! Entraremos em contato em breve.");
    setIsSubmitting(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center p-4 pt-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-600/5 blur-3xl" />
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 z-20 text-white/50 hover:text-white hover:bg-amber-500/10 transition-all"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="w-full max-w-lg relative z-10 mt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Seja um Parceiro
          </h1>
          <p className="text-white/60 mt-2">
            Ganhe <span className="text-amber-400 font-semibold">30 dias grátis</span> para testar nossa plataforma
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#252540] border border-amber-500/20 rounded-xl p-3 text-center">
            <Gift className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-white/80 text-xs font-medium">30 Dias Grátis</p>
          </div>
          <div className="bg-[#252540] border border-amber-500/20 rounded-xl p-3 text-center">
            <Users className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-white/80 text-xs font-medium">Clientes Fiéis</p>
          </div>
          <div className="bg-[#252540] border border-amber-500/20 rounded-xl p-3 text-center">
            <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-white/80 text-xs font-medium">Fácil de Usar</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-[#252540] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">Preencha seus dados</CardTitle>
            <CardDescription className="text-white/50">
              Nossa equipe entrará em contato para ativar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-white/80">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50"
                  placeholder="Ex: Barbearia do João"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-white/80">Seu Nome *</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80">Telefone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-white/80">Tipo de Negócio *</Label>
                <Input
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50"
                  placeholder="Ex: Barbearia, Restaurante, Cafeteria..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-white/80">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white/80">Mensagem (opcional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 min-h-[80px]"
                  placeholder="Conte-nos mais sobre seu negócio..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-xl transition-all"
              >
                {isSubmitting ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 animate-pulse" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Quero ser Parceiro
                  </>
                )}
              </Button>

              <p className="text-white/40 text-xs text-center mt-4">
                Ao enviar, você concorda com nossos termos de uso e política de privacidade.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <p className="text-white/30 mt-10 text-center relative z-10 text-xs tracking-[0.15em] uppercase font-light">
        FIDELICARD ®
      </p>
    </div>
  );
};

export default BecomePartner;
