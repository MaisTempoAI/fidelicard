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
import { Plus, QrCode, Search, UtensilsCrossed, Users, LogOut, Pencil, X, Check, Loader2, Building, Gift, Trash2, CreditCard, Armchair, Star, Circle } from "lucide-react";
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

interface EditingClient {
  cardId: number;
  nome: string;
  phone: string;
  cardcode: string;
  custamp: number;
  completed: boolean;
}

interface CompanyDataForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  urlsite: string;
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

const Admin = () => {
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
  });
  const [savingCompany, setSavingCompany] = useState(false);

  // Promotions (CoCards) management
  const [showPromotionsModal, setShowPromotionsModal] = useState(false);
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
      });
    }
  };

  const handleOpenCompanyDataModal = async () => {
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

  const handleOpenPromotionsModal = async () => {
    await loadCoCards();
    setShowPromotionsModal(true);
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
        // Update existing
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
        // Create new
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
          : `Carimbo adicionado! ${newStamps}/${client.reqstamp || requiredStamps}`
      );
      await loadClients();
    } else {
      toast.error(error || "Erro ao adicionar carimbo");
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
      completed: client.completed || false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;
    
    setSaving(true);
    try {
      const { success, error } = await updateClientAndCard(
        editingClient.cardId,
        {
          nome: editingClient.nome,
          phone: editingClient.phone,
          cardcode: editingClient.cardcode,
          custamp: editingClient.custamp,
          completed: editingClient.completed,
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

  const filteredClients = searchClients(clients, search);
  const totalStamps = clients.reduce((acc, c) => acc + (c.custamp || 0), 0);
  const completedCount = clients.filter(c => c.completed).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full gradient-warm flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{companyName}</h1>
              <p className="text-muted-foreground text-sm">Painel Administrativo</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Company Edit Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="border-primary/30 hover:bg-primary/10"
            onClick={handleOpenCompanyDataModal}
          >
            <Building className="w-4 h-4 mr-2" />
            Editar Dados Empresa
          </Button>
          <Button
            variant="outline"
            className="border-primary/30 hover:bg-primary/10"
            onClick={handleOpenPromotionsModal}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Gerenciar Cartões
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                  <p className="text-xs text-muted-foreground">Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍽️</span>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalStamps}</p>
                  <p className="text-xs text-muted-foreground">Carimbos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎉</span>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Completos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-4 pb-4">
              <Button
                onClick={handleScanQR}
                className="w-full h-16 text-lg font-bold gradient-warm hover:opacity-90"
              >
                <QrCode className="w-6 h-6 mr-2" />
                QR CODE
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Customers List */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg">Clientes</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por telefone ou código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full md:w-64 border-primary/30"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : filteredClients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <Card key={client.clientId} className="border-border/50 bg-muted/30">
                    <CardContent className="p-4">
                      {editingClient?.cardId === client.cardId ? (
                        // Edit mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
                              <Input
                                value={editingClient.nome}
                                onChange={(e) => setEditingClient({...editingClient, nome: e.target.value})}
                                placeholder="Nome do cliente"
                                className="border-primary/30"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Telefone</label>
                              <Input
                                value={editingClient.phone}
                                onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                                placeholder="Telefone"
                                className="border-primary/30"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Código</label>
                              <Input
                                value={editingClient.cardcode}
                                onChange={(e) => setEditingClient({...editingClient, cardcode: e.target.value.toUpperCase()})}
                                placeholder="Código"
                                className="border-primary/30 font-mono"
                                maxLength={6}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Carimbos</label>
                              <Input
                                type="number"
                                value={editingClient.custamp}
                                onChange={(e) => setEditingClient({...editingClient, custamp: parseInt(e.target.value) || 0})}
                                className="border-primary/30"
                                min={0}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                              <select
                                value={editingClient.completed ? "completed" : "pending"}
                                onChange={(e) => setEditingClient({...editingClient, completed: e.target.value === "completed"})}
                                className="w-full h-10 px-3 rounded-md border border-primary/30 bg-background text-foreground"
                              >
                                <option value="pending">Em andamento</option>
                                <option value="completed">Completo</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingClient(null)}
                              disabled={saving}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={saving}
                              className="gradient-warm"
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-1" />
                              )}
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Nome</p>
                              <p className="font-medium text-foreground">{client.nome || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                              <p className="text-foreground">{client.phone || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Código</p>
                              <p className="font-mono text-sm text-foreground">{client.cardcode || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Carimbos</p>
                              <p className="text-foreground">
                                <span className="font-bold text-primary text-lg">{client.custamp || 0}</span>
                                <span className="text-muted-foreground">/{client.reqstamp || requiredStamps}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Status</p>
                              {client.rescued ? (
                                <Badge className="bg-purple-500/20 text-purple-700 hover:bg-purple-500/30">
                                  Resgatado
                                </Badge>
                              ) : client.completed ? (
                                <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                                  Completo
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Em andamento</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary/50 hover:bg-primary/10"
                              onClick={() => handleEditClick(client)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {client.completed && !client.rescued ? (
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => handleRescueCard(client)}
                                disabled={rescuing === client.cardId}
                              >
                                {rescuing === client.cardId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Gift className="w-4 h-4 mr-1" />
                                    RESGATAR
                                  </>
                                )}
                              </Button>
                            ) : !client.rescued ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary/50 hover:bg-primary hover:text-primary-foreground"
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
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company Data Modal */}
      <Dialog open={showCompanyDataModal} onOpenChange={setShowCompanyDataModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Editar Dados da Empresa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome</Label>
              <Input
                id="company-name"
                value={companyDataForm.name}
                onChange={(e) => setCompanyDataForm({...companyDataForm, name: e.target.value})}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Telefone</Label>
              <Input
                id="company-phone"
                value={companyDataForm.phone}
                onChange={(e) => setCompanyDataForm({...companyDataForm, phone: e.target.value})}
                placeholder="Telefone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={companyDataForm.email}
                onChange={(e) => setCompanyDataForm({...companyDataForm, email: e.target.value})}
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Endereço</Label>
              <Input
                id="company-address"
                value={companyDataForm.address}
                onChange={(e) => setCompanyDataForm({...companyDataForm, address: e.target.value})}
                placeholder="Endereço"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-urlsite">Link Personalizado</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">/empresa/</span>
                <Input
                  id="company-urlsite"
                  value={companyDataForm.urlsite}
                  onChange={(e) => setCompanyDataForm({
                    ...companyDataForm, 
                    urlsite: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '')
                  })}
                  placeholder="BARBER_RODRI"
                  className="uppercase"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                URL final: {window.location.origin}/empresa/{companyDataForm.urlsite || '[seu-link]'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompanyDataModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCompanyData} disabled={savingCompany} className="gradient-warm">
              {savingCompany ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Cartões (CoCards) Modal */}
      <Dialog open={showPromotionsModal} onOpenChange={setShowPromotionsModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Gerenciar Cartões
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              onClick={() => handleOpenCoCardForm()}
              className="w-full gradient-warm"
            >
              <Plus className="w-4 h-4 mr-2" />
              + Novo Cartão
            </Button>

            {loadingCoCards ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Carregando cartões...</p>
              </div>
            ) : coCards.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum cartão cadastrado</p>
                <p className="text-xs text-muted-foreground">Crie seu primeiro cartão para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {coCards.map((coCard) => (
                  <Card key={coCard.id} className="border-border/50 overflow-hidden">
                    <div
                      className="h-3"
                      style={{ background: `linear-gradient(135deg, ${coCard.pricolour || '#FF6B35'}, ${coCard.seccolour || '#F7931E'})` }}
                    />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg text-foreground">{coCard.name}</span>
                            {coCard.active ? (
                              <Badge className="bg-green-500/20 text-green-700">Ativo</Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{coCard.text}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-muted px-3 py-1 rounded-full text-sm font-medium">{coCard.stamps} carimbos</span>
                            <span className="bg-muted px-3 py-1 rounded-full text-sm font-medium">{coCard.days} dias</span>
                            {coCard.prod && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">{coCard.prod}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-10 w-10"
                            onClick={() => handleOpenCoCardForm(coCard)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CoCard Form Modal */}
      <Dialog open={showCoCardForm} onOpenChange={setShowCoCardForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {coCardForm.id ? "Editar Cartão" : "Novo Cartão"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="cocard-name">📝 Nome do Cartão *</Label>
              <Input
                id="cocard-name"
                value={coCardForm.name}
                onChange={(e) => setCoCardForm({...coCardForm, name: e.target.value})}
                placeholder="Ex: Cartão Fidelidade VIP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cocard-text">📄 Texto do Cartão *</Label>
              <Textarea
                id="cocard-text"
                value={coCardForm.text}
                onChange={(e) => setCoCardForm({...coCardForm, text: e.target.value})}
                placeholder="Ex: Junte 10 selos e ganhe um corte na faixa!"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cocard-prod">🎁 Produto de Troca</Label>
              <Input
                id="cocard-prod"
                value={coCardForm.prod}
                onChange={(e) => setCoCardForm({...coCardForm, prod: e.target.value})}
                placeholder="Ex: Corte de Cabelo, Barba"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cocard-stamps">Selos Necessários</Label>
                <Input
                  id="cocard-stamps"
                  type="number"
                  value={coCardForm.stamps}
                  onChange={(e) => setCoCardForm({...coCardForm, stamps: parseInt(e.target.value) || 10})}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cocard-days">Validade (dias)</Label>
                <Input
                  id="cocard-days"
                  type="number"
                  value={coCardForm.days}
                  onChange={(e) => setCoCardForm({...coCardForm, days: parseInt(e.target.value) || 365})}
                  min={1}
                />
              </div>
            </div>

            {/* Appearance Section */}
            <div className="pt-2 border-t border-border">
              <Label className="text-base font-semibold mb-3 block">🎨 Aparência do Cartão</Label>
              
              {/* Colors */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Cor de Fundo (Primária)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={coCardForm.pricolour}
                      onChange={(e) => setCoCardForm({...coCardForm, pricolour: e.target.value})}
                      placeholder="#121212"
                      className="flex-1 font-mono"
                    />
                    <input
                      type="color"
                      value={coCardForm.pricolour || "#121212"}
                      onChange={(e) => setCoCardForm({...coCardForm, pricolour: e.target.value})}
                      className="w-12 h-10 rounded border border-input cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Cor das Fontes (Secundária)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={coCardForm.seccolour}
                      onChange={(e) => setCoCardForm({...coCardForm, seccolour: e.target.value})}
                      placeholder="#dcd0c0"
                      className="flex-1 font-mono"
                    />
                    <input
                      type="color"
                      value={coCardForm.seccolour || "#dcd0c0"}
                      onChange={(e) => setCoCardForm({...coCardForm, seccolour: e.target.value})}
                      className="w-12 h-10 rounded border border-input cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-2 mt-4">
                <Label className="text-sm text-muted-foreground">Ícone dos Selos</Label>
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
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                        coCardForm.icon === value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Preview */}
              <div className="mt-4 space-y-2">
                <Label className="text-sm text-muted-foreground">📱 Preview do Cartão</Label>
                <div 
                  className="rounded-2xl p-4 flex flex-col items-center gap-3"
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
                          className="w-5 h-5" 
                          style={{ color: i < 3 ? coCardForm.pricolour || '#121212' : '#a89f91', opacity: i < 3 ? 1 : 0.4 }}
                        />
                      );
                    })}
                  </div>
                  <span 
                    className="text-xs text-center max-w-[200px]"
                    style={{ color: `${coCardForm.seccolour || '#dcd0c0'}99` }}
                  >
                    {coCardForm.text || 'Texto do cartão aqui...'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Label htmlFor="cocard-active">Cartão Ativo</Label>
              <Switch
                id="cocard-active"
                checked={coCardForm.active}
                onCheckedChange={(checked) => setCoCardForm({...coCardForm, active: checked})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCoCardForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCoCard} disabled={savingCoCard} className="gradient-warm">
              {savingCoCard ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {coCardForm.id ? "💾 Salvar" : "✨ Criar Cartão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
