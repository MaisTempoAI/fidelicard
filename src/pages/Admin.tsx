import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { 
  Plus, QrCode, Search, Users, LogOut, Pencil, X, Check, Loader2, 
  Building, Gift, Trash2, CreditCard, Armchair, Star, Circle, 
  Settings, Download, FileText, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";
import { 
  getCompanyClientsWithCards, 
  addStampToCard, 
  searchClients,
  updateClientAndCard,
  getCompanyById,
  updateCompanyData,
  rescueCard,
  ClientWithCard,
  Company
} from "@/hooks/useAdmin";
import {
  getCompanyCoCards,
  createCoCard,
  updateCoCard,
  deleteCoCard,
  CoCard
} from "@/hooks/useCoCards";
import { CoCardFormModal } from "@/components/CoCardFormModal";

interface EditingClient {
  cardId: number;
  nome: string;
  phone: string;
  cardcode: string;
  custamp: number;
  reqstamp: number;
  completed: boolean;
}

interface CompanyDataForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  urlsite: string;
  loyaltytext: string;
}

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
}

type ActiveView = 'menu' | 'clients' | 'cards' | 'company' | 'settings' | 'export';

const Admin = () => {
  const [activeView, setActiveView] = useState<ActiveView>('menu');
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientWithCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingStamp, setAddingStamp] = useState<number | null>(null);
  const [rescuing, setRescuing] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<EditingClient | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Company edit modals
  const [showCompanyDataModal, setShowCompanyDataModal] = useState(false);
  const [companyDataForm, setCompanyDataForm] = useState<CompanyDataForm>({
    name: "",
    phone: "",
    email: "",
    address: "",
    urlsite: "",
    loyaltytext: "",
  });
  const [savingCompany, setSavingCompany] = useState(false);

  // Promotions (CoCards) management
  const [showCoCardForm, setShowCoCardForm] = useState(false);
  const [coCards, setCoCards] = useState<CoCard[]>([]);
  const [loadingCoCards, setLoadingCoCards] = useState(false);
  const [savingCoCard, setSavingCoCard] = useState(false);
  const [deletingCoCard, setDeletingCoCard] = useState<number | null>(null);
  const [coCardForm, setCoCardForm] = useState<CoCardForm>({
    name: "",
    text: "",
    prod: "",
    stamps: 10,
    days: 365,
    pricolour: "#121212",
    seccolour: "#dcd0c0",
    icon: "armchair",
    active: true,
  });

  // Export
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const companyId = localStorage.getItem("admin_company_id");
  const companyName = localStorage.getItem("admin_company_name") || "Minha Empresa";
  const requiredStamps = parseInt(localStorage.getItem("admin_company_stamps") || "10");

  useEffect(() => {
    if (!companyId) {
      navigate("/admin/login");
      return;
    }
    loadClients();
  }, [companyId]);

  const loadClients = async () => {
    if (!companyId) return;
    
    setLoading(true);
    const { clients: data, error } = await getCompanyClientsWithCards(parseInt(companyId));
    
    if (error) {
      toast.error("Erro ao carregar clientes");
    } else {
      setClients(data);
    }
    setLoading(false);
  };

  const loadCompanyData = async () => {
    if (!companyId) return;
    
    const { company, error } = await getCompanyById(parseInt(companyId));
    if (company) {
      setCompanyDataForm({
        name: company.name || "",
        phone: company.phone || "",
        email: company.email || "",
        address: company.address || "",
        urlsite: company.urlsite || "",
        loyaltytext: company.loyaltytext || "",
      });
    }
  };

  const handleOpenCompanyView = async () => {
    await loadCompanyData();
    setShowCompanyDataModal(true);
  };

  // Promotions (CoCards) handlers
  const loadCoCards = async () => {
    if (!companyId) return;
    setLoadingCoCards(true);
    const { coCards: data, error } = await getCompanyCoCards(parseInt(companyId));
    if (error) {
      toast.error("Erro ao carregar cartões");
    } else {
      setCoCards(data);
    }
    setLoadingCoCards(false);
  };

  const handleOpenCardsView = async () => {
    await loadCoCards();
    setActiveView('cards');
  };

  const handleOpenCoCardForm = (coCard?: CoCard) => {
    if (coCard) {
      setCoCardForm({
        id: coCard.id,
        name: coCard.name || "",
        text: coCard.text || "",
        prod: coCard.prod || "",
        stamps: coCard.stamps || 10,
        days: coCard.days || 365,
        pricolour: coCard.pricolour || "#121212",
        seccolour: coCard.seccolour || "#dcd0c0",
        icon: coCard.icon || "armchair",
        active: coCard.active ?? true,
      });
    } else {
      setCoCardForm({
        name: "",
        text: "",
        prod: "",
        stamps: 10,
        days: 365,
        pricolour: "#121212",
        seccolour: "#dcd0c0",
        icon: "armchair",
        active: true,
      });
    }
    setShowCoCardForm(true);
  };

  const handleSaveCoCard = async () => {
    if (!companyId) return;
    if (!coCardForm.name.trim() || !coCardForm.text.trim()) {
      toast.error("Nome e texto são obrigatórios");
      return;
    }

    setSavingCoCard(true);
    try {
      if (coCardForm.id) {
        const { success, error } = await updateCoCard(coCardForm.id, {
          name: coCardForm.name,
          text: coCardForm.text,
          prod: coCardForm.prod,
          stamps: coCardForm.stamps,
          days: coCardForm.days,
          pricolour: coCardForm.pricolour,
          seccolour: coCardForm.seccolour,
          icon: coCardForm.icon,
          active: coCardForm.active,
        });
        if (success) {
          toast.success("Cartão atualizado!");
        } else {
          toast.error(error || "Erro ao atualizar");
        }
      } else {
        const { coCard, error } = await createCoCard(parseInt(companyId), {
          name: coCardForm.name,
          text: coCardForm.text,
          prod: coCardForm.prod,
          stamps: coCardForm.stamps,
          days: coCardForm.days,
          pricolour: coCardForm.pricolour,
          seccolour: coCardForm.seccolour,
          icon: coCardForm.icon,
          active: coCardForm.active,
        });
        if (coCard) {
          toast.success("Cartão criado!");
        } else {
          toast.error(error || "Erro ao criar");
        }
      }
      await loadCoCards();
      setShowCoCardForm(false);
    } catch (err) {
      toast.error("Erro ao salvar cartão");
    }
    setSavingCoCard(false);
  };

  const handleDeleteCoCard = async (coCardId: number) => {
    setDeletingCoCard(coCardId);
    const { success, error } = await deleteCoCard(coCardId);
    if (success) {
      toast.success("Cartão excluído!");
      await loadCoCards();
    } else {
      toast.error(error || "Erro ao excluir");
    }
    setDeletingCoCard(null);
  };

  const handleSaveCompanyData = async () => {
    if (!companyId) return;
    
    setSavingCompany(true);
    const { success, error } = await updateCompanyData(parseInt(companyId), companyDataForm);
    
    if (success) {
      toast.success("Dados da empresa atualizados!");
      localStorage.setItem("admin_company_name", companyDataForm.name);
      setShowCompanyDataModal(false);
    } else {
      toast.error(error || "Erro ao salvar dados");
    }
    setSavingCompany(false);
  };

  const handleAddStamp = async (client: ClientWithCard) => {
    if (!client.cardId || client.completed) return;
    
    setAddingStamp(client.cardId);
    
    const { success, newStamps, isCompleted, error } = await addStampToCard(
      client.cardId,
      client.custamp || 0,
      client.reqstamp || requiredStamps
    );

    if (success) {
      toast.success(
        isCompleted 
          ? `Parabéns! ${client.nome || "Cliente"} completou o cartão!` 
          : `Selo adicionado! ${newStamps}/${client.reqstamp || requiredStamps}`
      );
      await loadClients();
    } else {
      toast.error(error || "Erro ao adicionar selo");
    }
    
    setAddingStamp(null);
  };

  const handleRescueCard = async (client: ClientWithCard) => {
    if (!client.cardId || !client.completed || client.rescued) return;
    
    setRescuing(client.cardId);
    
    const { success, error } = await rescueCard(client.cardId);

    if (success) {
      toast.success(`Cartão de ${client.nome || "Cliente"} foi resgatado!`);
      await loadClients();
    } else {
      toast.error(error || "Erro ao resgatar cartão");
    }
    
    setRescuing(null);
  };

  const handleEditClick = (client: ClientWithCard) => {
    setEditingClient({
      cardId: client.cardId,
      nome: client.nome || "",
      phone: client.phone || "",
      cardcode: client.cardcode || "",
      custamp: client.custamp || 0,
      reqstamp: client.reqstamp || requiredStamps,
      completed: client.completed || false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;
    
    setSaving(true);
    try {
      const isCompleted = editingClient.custamp >= editingClient.reqstamp;
      
      const { success, error } = await updateClientAndCard(
        editingClient.cardId,
        {
          nome: editingClient.nome,
          phone: editingClient.phone,
          cardcode: editingClient.cardcode,
          custamp: editingClient.custamp,
          completed: isCompleted,
        }
      );
      
      if (success) {
        toast.success("Cliente atualizado com sucesso!");
        setEditingClient(null);
        await loadClients();
      } else {
        toast.error(error || "Erro ao atualizar cliente");
      }
    } catch (err) {
      toast.error("Erro ao atualizar cliente");
    }
    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_company_id");
    localStorage.removeItem("admin_company_name");
    localStorage.removeItem("admin_company_logo");
    localStorage.removeItem("admin_company_stamps");
    navigate("/admin/login");
  };

  const handleScanQR = () => {
    navigate("/admin/scanner");
  };

  // Export functions
  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Nome', 'Telefone', 'Código', 'Selos', 'Status'];
      const rows = clients.map(client => [
        client.nome || '',
        client.phone || '',
        client.cardcode || '',
        `${client.custamp || 0}/${client.reqstamp || requiredStamps}`,
        client.rescued ? 'Resgatado' : client.completed ? 'Completo' : 'Em andamento'
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `clientes_${companyName}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success("Arquivo CSV exportado!");
    } catch (err) {
      toast.error("Erro ao exportar CSV");
    }
    setExporting(false);
    setShowExportModal(false);
  };

  const exportToVCard = () => {
    setExporting(true);
    try {
      const vcards = clients.map(client => {
        return `BEGIN:VCARD
VERSION:3.0
FN:${client.nome || 'Cliente'}
TEL:${client.phone || ''}
NOTE:Selos: ${client.custamp || 0}/${client.reqstamp || requiredStamps} - ${companyName}
END:VCARD`;
      }).join('\n');
      
      const blob = new Blob([vcards], { type: 'text/vcard;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `contatos_${companyName}_${new Date().toISOString().split('T')[0]}.vcf`;
      link.click();
      toast.success("Contatos exportados!");
    } catch (err) {
      toast.error("Erro ao exportar contatos");
    }
    setExporting(false);
    setShowExportModal(false);
  };

  const filteredClients = searchClients(clients, search);
  const totalStamps = clients.reduce((acc, c) => acc + (c.custamp || 0), 0);
  const completedCount = clients.filter(c => c.completed).length;

  const menuItems = [
    { 
      id: 'qrcode', 
      label: 'QR CODE', 
      icon: QrCode, 
      action: handleScanQR, 
      primary: true,
      description: 'Escanear cartão'
    },
    { 
      id: 'clients', 
      label: 'Clientes', 
      icon: Users, 
      action: () => setActiveView('clients'),
      description: `${clients.length} cadastrados`
    },
    { 
      id: 'cards', 
      label: 'Gerenciar Cartões', 
      icon: CreditCard, 
      action: handleOpenCardsView,
      description: 'Tipos de cartão'
    },
    { 
      id: 'company', 
      label: 'Editar Empresa', 
      icon: Building, 
      action: handleOpenCompanyView,
      description: 'Dados do estabelecimento'
    },
    { 
      id: 'settings', 
      label: 'Configurações', 
      icon: Settings, 
      action: () => toast.info("Em breve"),
      description: 'Preferências'
    },
    { 
      id: 'export', 
      label: 'Exportar Clientes', 
      icon: Download, 
      action: () => setShowExportModal(true),
      description: 'CSV ou Contatos'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeView !== 'menu' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setActiveView('menu')}
                  className="text-white hover:bg-white/10 -ml-2"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
              )}
              <div>
                <h1 className="text-lg font-semibold text-white">{companyName}</h1>
                <p className="text-xs text-gray-400">Painel Administrativo</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Main Menu View */}
        {activeView === 'menu' && (
          <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#1a1a1a] rounded-2xl p-4 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <p className="text-xl font-bold text-white">{clients.length}</p>
                <p className="text-[10px] text-gray-400">Clientes</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl p-4 text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <p className="text-xl font-bold text-white">{totalStamps}</p>
                <p className="text-[10px] text-gray-400">Selos</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl p-4 text-center">
                <Gift className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <p className="text-xl font-bold text-white">{completedCount}</p>
                <p className="text-[10px] text-gray-400">Completos</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] ${
                    item.primary 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.primary ? 'bg-white/20' : 'bg-[#252525]'
                  }`}>
                    <item.icon className={`w-6 h-6 ${item.primary ? 'text-white' : 'text-orange-500'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-base">{item.label}</p>
                    <p className={`text-xs ${item.primary ? 'text-white/70' : 'text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${item.primary ? 'text-white/70' : 'text-gray-500'}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clients View */}
        {activeView === 'clients' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por telefone ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-0 text-white placeholder:text-gray-500 h-12 rounded-xl"
              />
            </div>

            {/* Client List */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                <p className="text-gray-400 mt-2">Carregando...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400">
                  {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClients.map((client) => (
                  <div 
                    key={client.clientId} 
                    className="bg-[#1a1a1a] rounded-2xl p-4"
                  >
                    {editingClient?.cardId === client.cardId ? (
                      // Edit mode
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 mb-1 block">Nome</label>
                            <Input
                              value={editingClient.nome}
                              onChange={(e) => setEditingClient({...editingClient, nome: e.target.value})}
                              className="bg-[#252525] border-0 text-white h-10 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 mb-1 block">Telefone</label>
                            <Input
                              value={editingClient.phone}
                              onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                              className="bg-[#252525] border-0 text-white h-10 rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 mb-1 block">Código</label>
                            <Input
                              value={editingClient.cardcode}
                              onChange={(e) => setEditingClient({...editingClient, cardcode: e.target.value.toUpperCase()})}
                              className="bg-[#252525] border-0 text-white h-10 rounded-xl font-mono"
                              maxLength={6}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 mb-1 block">Selos</label>
                            <Input
                              type="number"
                              value={editingClient.custamp}
                              onChange={(e) => setEditingClient({...editingClient, custamp: parseInt(e.target.value) || 0})}
                              className="bg-[#252525] border-0 text-white h-10 rounded-xl"
                              min={0}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingClient(null)}
                            disabled={saving}
                            className="flex-1 text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-white">{client.nome || "Sem nome"}</p>
                            <p className="text-sm text-gray-400">{client.phone || "-"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Selos</p>
                            <p className="font-bold text-orange-500">
                              {client.custamp || 0}
                              <span className="text-gray-400 font-normal">/{client.reqstamp || requiredStamps}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500">{client.cardcode || "-"}</span>
                            {client.rescued ? (
                              <Badge className="bg-purple-500/20 text-purple-400 border-0 text-[10px]">
                                Resgatado
                              </Badge>
                            ) : client.completed ? (
                              <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px]">
                                Completo
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-500/20 text-gray-400 border-0 text-[10px]">
                                Em andamento
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10"
                              onClick={() => handleEditClick(client)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {client.completed && !client.rescued ? (
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white h-9 px-3"
                                onClick={() => handleRescueCard(client)}
                                disabled={rescuing === client.cardId}
                              >
                                {rescuing === client.cardId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Gift className="w-4 h-4 mr-1" />
                                    Resgatar
                                  </>
                                )}
                              </Button>
                            ) : !client.rescued ? (
                              <Button
                                size="icon"
                                className="h-9 w-9 bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={() => handleAddStamp(client)}
                                disabled={addingStamp === client.cardId}
                              >
                                {addingStamp === client.cardId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cards Management View */}
        {activeView === 'cards' && (
          <div className="space-y-4">
            <Button
              onClick={() => handleOpenCoCardForm()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cartão
            </Button>

            {loadingCoCards ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                <p className="text-gray-400 mt-2">Carregando cartões...</p>
              </div>
            ) : coCards.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400">Nenhum cartão cadastrado</p>
                <p className="text-xs text-gray-500">Crie seu primeiro cartão</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coCards.map((coCard) => (
                  <div 
                    key={coCard.id} 
                    className="bg-[#1a1a1a] rounded-2xl overflow-hidden"
                  >
                    <div
                      className="h-2"
                      style={{ background: `linear-gradient(135deg, ${coCard.pricolour || '#FF6B35'}, ${coCard.seccolour || '#F7931E'})` }}
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{coCard.name}</span>
                            {coCard.active ? (
                              <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px]">Ativo</Badge>
                            ) : (
                              <Badge className="bg-gray-500/20 text-gray-400 border-0 text-[10px]">Inativo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-1 mb-2">{coCard.text}</p>
                          <div className="flex gap-2">
                            <span className="bg-[#252525] px-2 py-1 rounded-lg text-xs text-gray-300">{coCard.stamps} selos</span>
                            <span className="bg-[#252525] px-2 py-1 rounded-lg text-xs text-gray-300">{coCard.days} dias</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10"
                            onClick={() => handleOpenCoCardForm(coCard)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleDeleteCoCard(coCard.id)}
                            disabled={deletingCoCard === coCard.id}
                          >
                            {deletingCoCard === coCard.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-sm bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Exportar Clientes</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={exportToCSV}
              disabled={exporting}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#252525] hover:bg-[#2a2a2a] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Arquivo CSV</p>
                <p className="text-xs text-gray-400">Planilha para Excel/Sheets</p>
              </div>
            </button>
            <button
              onClick={exportToVCard}
              disabled={exporting}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#252525] hover:bg-[#2a2a2a] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Contatos (VCF)</p>
                <p className="text-xs text-gray-400">Importar nos contatos do telefone</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Data Modal */}
      <Dialog open={showCompanyDataModal} onOpenChange={setShowCompanyDataModal}>
        <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Building className="w-5 h-5" />
              Editar Dados da Empresa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome</Label>
              <Input
                value={companyDataForm.name}
                onChange={(e) => setCompanyDataForm({...companyDataForm, name: e.target.value})}
                placeholder="Nome da empresa"
                className="bg-[#252525] border-0 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Telefone</Label>
              <Input
                value={companyDataForm.phone}
                onChange={(e) => setCompanyDataForm({...companyDataForm, phone: e.target.value})}
                placeholder="Telefone"
                className="bg-[#252525] border-0 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={companyDataForm.email}
                onChange={(e) => setCompanyDataForm({...companyDataForm, email: e.target.value})}
                placeholder="Email"
                className="bg-[#252525] border-0 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Endereço</Label>
              <Input
                value={companyDataForm.address}
                onChange={(e) => setCompanyDataForm({...companyDataForm, address: e.target.value})}
                placeholder="Endereço"
                className="bg-[#252525] border-0 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Link Personalizado</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">/empresa/</span>
                <Input
                  value={companyDataForm.urlsite}
                  onChange={(e) => setCompanyDataForm({
                    ...companyDataForm, 
                    urlsite: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '')
                  })}
                  placeholder="NOME"
                  className="bg-[#252525] border-0 text-white uppercase"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Texto de Apresentação</Label>
              <Textarea
                value={companyDataForm.loyaltytext}
                onChange={(e) => setCompanyDataForm({...companyDataForm, loyaltytext: e.target.value})}
                placeholder="Junte 10 selos e ganhe um prêmio!"
                rows={3}
                className="bg-[#252525] border-0 text-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setShowCompanyDataModal(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveCompanyData} 
              disabled={savingCompany} 
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {savingCompany ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CoCard Form Modal */}
      <CoCardFormModal
        open={showCoCardForm}
        onOpenChange={setShowCoCardForm}
        coCardForm={coCardForm}
        setCoCardForm={setCoCardForm}
        onSave={handleSaveCoCard}
        saving={savingCoCard}
      />
    </div>
  );
};

export default Admin;
