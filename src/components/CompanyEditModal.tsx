import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Building, Scissors, UtensilsCrossed, Car, Gift, Loader2, Palette } from "lucide-react";

interface CompanyDataForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  urlsite: string;
  loyaltytext: string;
  primarycolour: string;
  icon: string;
}

interface CompanyEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyDataForm: CompanyDataForm;
  setCompanyDataForm: React.Dispatch<React.SetStateAction<CompanyDataForm>>;
  onSave: () => void;
  saving: boolean;
}

type TabType = 'dados' | 'visual';

export const CompanyEditModal = ({
  open,
  onOpenChange,
  companyDataForm,
  setCompanyDataForm,
  onSave,
  saving,
}: CompanyEditModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('dados');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[100dvh] sm:h-auto sm:max-h-[85vh] flex flex-col bg-[#1a1a1a] border-white/10 text-white p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Building className="w-5 h-5" />
            Editar Empresa
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'dados'
                ? 'text-orange-500 border-orange-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            DADOS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'visual'
                ? 'text-orange-500 border-orange-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            VISUAL
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-4 py-3">
          {activeTab === 'dados' ? (
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Nome</Label>
                <Input
                  value={companyDataForm.name}
                  onChange={(e) => setCompanyDataForm({...companyDataForm, name: e.target.value})}
                  placeholder="Nome da empresa"
                  className="bg-[#252525] border-0 text-white h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Telefone</Label>
                <Input
                  value={companyDataForm.phone}
                  onChange={(e) => setCompanyDataForm({...companyDataForm, phone: e.target.value})}
                  placeholder="Telefone"
                  className="bg-[#252525] border-0 text-white h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Email</Label>
                <Input
                  type="email"
                  value={companyDataForm.email}
                  onChange={(e) => setCompanyDataForm({...companyDataForm, email: e.target.value})}
                  placeholder="Email"
                  className="bg-[#252525] border-0 text-white h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Endereço</Label>
                <Input
                  value={companyDataForm.address}
                  onChange={(e) => setCompanyDataForm({...companyDataForm, address: e.target.value})}
                  placeholder="Endereço"
                  className="bg-[#252525] border-0 text-white h-10"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Icon Selector */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Ícone da Empresa</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'scissors', label: 'Tesoura', Icon: Scissors },
                    { value: 'utensils', label: 'Prato', Icon: UtensilsCrossed },
                    { value: 'car', label: 'Carro', Icon: Car },
                    { value: 'gift', label: 'Presente', Icon: Gift },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCompanyDataForm({...companyDataForm, icon: value})}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        companyDataForm.icon === value 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-[#252525] text-gray-400 hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-[10px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  Cor da Empresa
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={companyDataForm.primarycolour}
                    onChange={(e) => setCompanyDataForm({...companyDataForm, primarycolour: e.target.value})}
                    className="bg-[#252525] border-0 text-white flex-1 font-mono text-xs h-10"
                    placeholder="#121212"
                  />
                  <input
                    type="color"
                    value={companyDataForm.primarycolour || "#121212"}
                    onChange={(e) => setCompanyDataForm({...companyDataForm, primarycolour: e.target.value})}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Presentation Text */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Texto de Apresentação</Label>
                <Textarea
                  value={companyDataForm.loyaltytext}
                  onChange={(e) => setCompanyDataForm({...companyDataForm, loyaltytext: e.target.value})}
                  placeholder="Junte 10 selos e ganhe um prêmio!"
                  rows={3}
                  className="bg-[#252525] border-0 text-white resize-none"
                />
              </div>

              {/* Custom URL */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Link Personalizado</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap">/empresa/</span>
                  <Input
                    value={companyDataForm.urlsite}
                    onChange={(e) => setCompanyDataForm({
                      ...companyDataForm, 
                      urlsite: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '')
                    })}
                    placeholder="NOME"
                    className="bg-[#252525] border-0 text-white uppercase h-10"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Preview</Label>
                <div 
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: companyDataForm.primarycolour || '#121212' }}
                >
                  {(() => {
                    const iconProps = { className: "w-6 h-6 text-white" };
                    switch (companyDataForm.icon) {
                      case 'utensils': return <UtensilsCrossed {...iconProps} />;
                      case 'car': return <Car {...iconProps} />;
                      case 'gift': return <Gift {...iconProps} />;
                      default: return <Scissors {...iconProps} />;
                    }
                  })()}
                  <span className="text-white font-semibold">
                    {companyDataForm.name || 'Nome da Empresa'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 py-3 border-t border-white/10 gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white hover:bg-white/10 flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onSave} 
            disabled={saving} 
            className="bg-orange-500 hover:bg-orange-600 text-white flex-1 sm:flex-none"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
