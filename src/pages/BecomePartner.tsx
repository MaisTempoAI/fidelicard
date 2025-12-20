import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Mail, Phone, Loader2, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 2) {
    return numbers.length > 0 ? `(${numbers}` : "";
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)})${numbers.slice(2)}`;
  } else {
    return `(${numbers.slice(0, 2)})${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

const BecomePartner = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactType, setContactType] = useState<"email" | "telefone" | null>(null);
  const [contactValue, setContactValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    ownerName: "",
    companyName: "",
    businessType: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setContactValue(formatted);
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

  const validateStep3 = () => {
    if (!formData.username.trim()) {
      toast.error("Informe o usuário");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("Informe a senha");
      return false;
    }
    if (formData.password.length < 4) {
      toast.error("A senha deve ter no mínimo 4 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      // Pre-fill username with contact value
      setFormData(prev => ({
        ...prev,
        username: prev.username || contactValue.trim()
      }));
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("CRF-Companies")
        .insert({
          name: formData.companyName.trim(),
          email: contactType === "email" ? contactValue.trim() : null,
          phone: contactType === "telefone" ? contactValue.trim() : null,
          slug: formData.businessType.trim(),
          type: "DEFAULT",
          address: formData.address.trim(),
          user: formData.username.trim(),
          password: formData.password,
          active: true,
        });

      if (error) {
        console.error("Error creating company:", error);
        toast.error("Erro ao cadastrar. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      toast.success("🎉 Parabéns! Agora você é um Parceiro!", {
        duration: 3000,
      });

      // Redirect to login with credentials pre-filled
      setTimeout(() => {
        navigate(`/admin-login?user=${encodeURIComponent(formData.username.trim())}&pass=${encodeURIComponent(formData.password)}`);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao cadastrar. Tente novamente.");
      setIsSubmitting(false);
    }
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
          <p className="text-white/50 text-sm mt-1">
            Ganhe <span className="text-amber-400 font-medium">30 dias grátis</span>
          </p>
        </div>

        {/* Progress Indicator - 3 steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 1 ? "bg-amber-500" : "bg-white/20"}`} />
          <div className={`w-6 h-0.5 transition-all ${step >= 2 ? "bg-amber-500" : "bg-white/20"}`} />
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 2 ? "bg-amber-500" : "bg-white/20"}`} />
          <div className={`w-6 h-0.5 transition-all ${step >= 3 ? "bg-amber-500" : "bg-white/20"}`} />
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 3 ? "bg-amber-500" : "bg-white/20"}`} />
        </div>

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
                  onChange={contactType === "telefone" ? handlePhoneChange : (e) => setContactValue(e.target.value)}
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 h-12"
                  placeholder={contactType === "email" ? "seu@email.com" : "(00)00000-0000"}
                  maxLength={contactType === "telefone" ? 14 : undefined}
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
                className="flex-1 h-12 rounded-xl border-amber-500/30 text-white bg-transparent hover:bg-amber-500/10 hover:border-amber-500/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 rounded-xl"
              >
                Avançar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 - Create Credentials */}
        {step === 3 && (
          <div className="bg-[#252540] border border-amber-500/20 rounded-2xl p-6 space-y-5">
            <div className="text-center mb-2">
              <p className="text-white/70 text-sm">Crie seu acesso ao painel</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/80 text-sm">Usuário *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 h-12 pl-10"
                  placeholder="Email ou telefone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-sm">Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 h-12 pl-10 pr-10"
                  placeholder="Mínimo 4 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80 text-sm">Confirmar Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-[#1a1a2e] border-amber-500/20 text-white placeholder:text-white/30 focus:border-amber-500/50 h-12 pl-10 pr-10"
                  placeholder="Repita a senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-amber-500/30 text-white bg-transparent hover:bg-amber-500/10 hover:border-amber-500/50"
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
                    Finalizando...
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
      </div>

      {/* Footer */}
      <p className="text-white/30 mt-8 text-center relative z-10 text-xs tracking-[0.15em] uppercase font-light">
        FIDELICARD ®
      </p>
    </div>
  );
};

export default BecomePartner;