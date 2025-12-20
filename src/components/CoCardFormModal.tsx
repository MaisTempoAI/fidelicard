import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Armchair, Star, X, Circle, Loader2, CreditCard, Palette } from "lucide-react";

interface CoCardForm {
  id?: number;
  name: string;
  text: string;
  prod: string;
  stamps: number;
  days: number;
  pricolour: string;
  seccolour: string;
  icon: string;
  active: boolean;
  renewable: boolean;
}

interface CoCardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coCardForm: CoCardForm;
  setCoCardForm: React.Dispatch<React.SetStateAction<CoCardForm>>;
  onSave: () => void;
  saving: boolean;
}

type TabType = 'dados' | 'visual';

export const CoCardFormModal = ({
  open,
  onOpenChange,
  coCardForm,
  setCoCardForm,
  onSave,
  saving,
}: CoCardFormModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('dados');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[100dvh] sm:h-auto sm:max-h-[85vh] flex flex-col bg-[#1a1a1a] border-white/10 text-white p-0 gap-0">
        {/* Header with title and active switch */}
        <DialogHeader className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-white">
              <CreditCard className="w-5 h-5" />
              {coCardForm.id ? "Editar Cartão" : "Novo Cartão"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-400">Ativo</Label>
              <Switch
                checked={coCardForm.active}
                onCheckedChange={(checked) => setCoCardForm({...coCardForm, active: checked})}
              />
            </div>
          </div>
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

        {/* Content Area - Fixed height to prevent scrolling */}
        <div className="flex-1 overflow-hidden px-4 py-3">
          {activeTab === 'dados' ? (
            <div className="h-full flex flex-col gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Nome do Cartão</Label>
                <Input
                  value={coCardForm.name}
                  onChange={(e) => setCoCardForm({...coCardForm, name: e.target.value})}
                  placeholder="Ex: Cartão Fidelidade VIP"
                  className="bg-[#252525] border-0 text-white h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Texto do Cartão</Label>
                <Textarea
                  value={coCardForm.text}
                  onChange={(e) => setCoCardForm({...coCardForm, text: e.target.value})}
                  placeholder="Ex: Junte 10 selos e ganhe um corte na faixa!"
                  rows={2}
                  className="bg-[#252525] border-0 text-white resize-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Produto de Troca</Label>
                <Input
                  value={coCardForm.prod}
                  onChange={(e) => setCoCardForm({...coCardForm, prod: e.target.value})}
                  placeholder="Ex: Corte de Cabelo"
                  className="bg-[#252525] border-0 text-white h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-400">Quantidade Selos</Label>
                  <Input
                    type="number"
                    value={coCardForm.stamps}
                    onChange={(e) => setCoCardForm({...coCardForm, stamps: parseInt(e.target.value) || 10})}
                    min={1}
                    className="bg-[#252525] border-0 text-white h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-400">Validade (dias)</Label>
                  <Input
                    type="number"
                    value={coCardForm.days}
                    onChange={(e) => setCoCardForm({...coCardForm, days: parseInt(e.target.value) || 365})}
                    min={1}
                    className="bg-[#252525] border-0 text-white h-10"
                  />
                </div>
              </div>
              
              {/* Renewable Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#252525]">
                <div className="space-y-0.5">
                  <Label className="text-sm text-white">Renovável</Label>
                  <p className="text-[10px] text-gray-500">
                    Se desativado, cliente não pode criar outro após completar
                  </p>
                </div>
                <Switch
                  checked={coCardForm.renewable}
                  onCheckedChange={(checked) => setCoCardForm({...coCardForm, renewable: checked})}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col gap-3">
              {/* Colors Section */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  Cores do Cartão
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-500">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        value={coCardForm.pricolour}
                        onChange={(e) => setCoCardForm({...coCardForm, pricolour: e.target.value})}
                        className="bg-[#252525] border-0 text-white flex-1 font-mono text-xs h-9"
                      />
                      <input
                        type="color"
                        value={coCardForm.pricolour || "#121212"}
                        onChange={(e) => setCoCardForm({...coCardForm, pricolour: e.target.value})}
                        className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-500">Cor das Fontes</Label>
                    <div className="flex gap-2">
                      <Input
                        value={coCardForm.seccolour}
                        onChange={(e) => setCoCardForm({...coCardForm, seccolour: e.target.value})}
                        className="bg-[#252525] border-0 text-white flex-1 font-mono text-xs h-9"
                      />
                      <input
                        type="color"
                        value={coCardForm.seccolour || "#dcd0c0"}
                        onChange={(e) => setCoCardForm({...coCardForm, seccolour: e.target.value})}
                        className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Ícone dos Selos</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'armchair', label: 'Poltrona', Icon: Armchair },
                    { value: 'star', label: 'Estrela', Icon: Star },
                    { value: 'x', label: 'X', Icon: X },
                    { value: 'circle', label: 'Círculo', Icon: Circle },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCoCardForm({...coCardForm, icon: value})}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        coCardForm.icon === value 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-[#252525] text-gray-400 hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2 flex-1">
                <Label className="text-xs text-gray-400">Preview</Label>
                <div 
                  className="rounded-2xl p-3 flex flex-col items-center gap-2"
                  style={{ backgroundColor: coCardForm.pricolour || '#121212' }}
                >
                  <span 
                    className="text-sm font-bold"
                    style={{ color: coCardForm.seccolour || '#dcd0c0' }}
                  >
                    {coCardForm.name || 'Nome do Cartão'}
                  </span>
                  <div 
                    className="flex gap-2 p-2 rounded-xl"
                    style={{ backgroundColor: coCardForm.seccolour || '#dcd0c0' }}
                  >
                    {[...Array(5)].map((_, i) => {
                      const IconComponent = coCardForm.icon === 'star' ? Star 
                        : coCardForm.icon === 'x' ? X 
                        : coCardForm.icon === 'circle' ? Circle 
                        : Armchair;
                      return (
                        <IconComponent 
                          key={i} 
                          className="w-4 h-4" 
                          style={{ color: i < 3 ? coCardForm.pricolour || '#121212' : '#a89f91', opacity: i < 3 ? 1 : 0.4 }}
                        />
                      );
                    })}
                  </div>
                  <span 
                    className="text-[10px] text-center max-w-[180px]"
                    style={{ color: `${coCardForm.seccolour || '#dcd0c0'}99` }}
                  >
                    {coCardForm.text || 'Texto do cartão aqui...'}
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
            {coCardForm.id ? "Salvar" : "Criar Cartão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
