import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Mail, Phone, Loader2, Copy, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BecomePartner = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactType, setContactType] = useState<"email" | "telefone" | null>(null);
  const [contactValue, setContactValue] = useState("");
  const [generatedCredentials, setGeneratedCredentials] = useState<{ user: string; password: string } | null>(null);
  
  const [formData, setFormData] = useState({
    ownerName: "",
    companyName: "",
    businessType: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.ownerName.trim()) {
      toast.error("Informe seu nome");
      return false;
    }
    if (!formData.companyName.trim()) {
      toast.error("Informe o nome da empresa");
      return false;
    }
    if (!contactType) {
      toast.error("Selecione Email ou Telefone");
      return false;
    }
    if (!contactValue.trim()) {
      toast.error(`Informe seu ${contactType}`);
      return false;
    }
    if (contactType === "email" && !contactValue.includes("@")) {
      toast.error("Informe um email válido");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.businessType.trim()) {
      toast.error("Informe o tipo de negócio");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Informe o endereço");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    setIsSubmitting(true);

    try {
      const userLogin = contactValue.trim();
      const password = "1234";

      const { error } = await supabase
        .from("CRF-Companies")
        .insert({
          name: formData.companyName.trim(),
          email: contactType === "email" ? contactValue.trim() : null,
          phone: contactType === "telefone" ? contactValue.trim() : null,
          type: formData.businessType.trim(),
          address: formData.address.trim(),
          user: userLogin,
          password: password,
          active: true,
        });

      if (error) {
        console.error("Error creating company:", error);
        toast.error("Erro ao cadastrar. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      setGeneratedCredentials({ user: userLogin, password });
      setStep(3);
      toast.success("Cadastro realizado com sucesso!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao cadastrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-4 relative overflow-hidden">
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

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 mb-3">
            <Sparkles className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Seja um Parceiro
          </h1>
          {step < 3 && (
            <p className="text-white/50 text-sm mt-1">
              Ganhe <span className="text-amber-400 font-medium">30 dias grátis</span>
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 1 ? "bg-amber-500" : "bg-white/20"}`} />
            <div className={`w-8 h-0.5 transition-all ${step >= 2 ? "bg-amber-500" : "bg-white/20"}`} />
            <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 2 ? "bg-amber-500" : "bg-white/20"}`} />
          </div>
        )}

        {/* Step 1 - Contact Details */}
        {step === 1 && (
          <div className="bg-[#252540] border border-amber-500/20 rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ownerName" className="text-white/80 text-sm">Nome do Contato *</Label>
              <Input
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 h-12"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-white/80 text-sm">Empresa *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 h-12"
                placeholder="Nome da sua empresa"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-white/80 text-sm">Como prefere ser contatado? *</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setContactType("email");
                    setContactValue("");
                  }}
                  className={`flex-1 h-12 rounded-xl border-2 transition-all ${
                    contactType === "email"
                      ? "bg-amber-500/20 border-amber-500 text-amber-400"
                      : "bg-transparent border-white/20 text-white/60 hover:border-white/40"
                  }`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setContactType("telefone");
                    setContactValue("");
                  }}
                  className={`flex-1 h-12 rounded-xl border-2 transition-all ${
                    contactType === "telefone"
                      ? "bg-amber-500/20 border-amber-500 text-amber-400"
                      : "bg-transparent border-white/20 text-white/60 hover:border-white/40"
                  }`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Telefone
                </Button>
              </div>
            </div>

            {contactType && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="contactValue" className="text-white/80 text-sm">
                  {contactType === "email" ? "Seu Email *" : "Seu Telefone *"}
                </Label>
                <Input
                  id="contactValue"
                  type={contactType === "email" ? "email" : "tel"}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 h-12"
                  placeholder={contactType === "email" ? "seu@email.com" : "(00) 00000-0000"}
                />
              </div>
            )}

            <Button
              onClick={handleNext}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 rounded-xl mt-4"
            >
              Avançar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2 - Business Details */}
        {step === 2 && (
          <div className="bg-[#252540] border border-amber-500/20 rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-white/80 text-sm">Tipo de Negócio *</Label>
              <Input
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 h-12"
                placeholder="Ex: Barbearia, Restaurante, Cafeteria..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-white/80 text-sm">Endereço *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 h-12"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-white/20 text-white/70 hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 - Success / Credentials */}
        {step === 3 && generatedCredentials && (
          <div className="bg-[#252540] border border-amber-500/20 rounded-2xl p-6 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Cadastro Realizado!</h2>
              <p className="text-white/50 text-sm">Use os dados abaixo para acessar seu painel</p>
            </div>

            <div className="bg-[#1a1a2e] rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white/50 text-xs uppercase tracking-wide">Usuário</p>
                  <p className="text-amber-400 font-medium text-lg">{generatedCredentials.user}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(generatedCredentials.user, "Usuário")}
                  className="text-white/50 hover:text-white hover:bg-white/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="border-t border-white/10" />
              
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white/50 text-xs uppercase tracking-wide">Senha</p>
                  <p className="text-amber-400 font-medium text-lg">{generatedCredentials.password}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(generatedCredentials.password, "Senha")}
                  className="text-white/50 hover:text-white hover:bg-white/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-amber-400/70 text-xs">
              Guarde essas informações! Você pode alterar a senha depois no seu painel.
            </p>

            <Button
              onClick={() => navigate("/admin-login")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 rounded-xl"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Acessar meu Painel
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-white/30 mt-8 text-center relative z-10 text-xs tracking-[0.15em] uppercase font-light">
        FIDELICARD ®
      </p>
    </div>
  );
};

export default BecomePartner;
