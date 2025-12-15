import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, QrCode, Search, UtensilsCrossed, Users, LogOut, Pencil, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  getCompanyClientsWithCards, 
  addStampToCard, 
  searchClients,
  updateClientAndCard,
  ClientWithCard 
} from "@/hooks/useAdmin";

interface EditingClient {
  cardId: number;
  nome: string;
  phone: string;
  cardcode: string;
  custamp: number;
  completed: boolean;
}

const Admin = () => {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientWithCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingStamp, setAddingStamp] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<EditingClient | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

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
                className="w-full h-full gradient-warm hover:opacity-90"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Escanear QR
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
                              {client.completed ? (
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary/50 hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleAddStamp(client)}
                              disabled={client.completed || addingStamp === client.cardId}
                            >
                              {addingStamp === client.cardId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Button>
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
    </div>
  );
};

export default Admin;
