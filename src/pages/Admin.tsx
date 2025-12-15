import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, QrCode, Search, UtensilsCrossed, Users, LogOut } from "lucide-react";
import { toast } from "sonner";
import { 
  getCompanyClientsWithCards, 
  addStampToCard, 
  searchClients,
  ClientWithCard 
} from "@/hooks/useAdmin";

const Admin = () => {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientWithCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingStamp, setAddingStamp] = useState<number | null>(null);
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
      // Reload clients to update UI
      await loadClients();
    } else {
      toast.error(error || "Erro ao adicionar carimbo");
    }
    
    setAddingStamp(null);
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

        {/* Customers Table */}
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead className="text-center">Carimbos</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.clientId}>
                        <TableCell className="font-medium">{client.nome || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{client.phone || "-"}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {client.cardcode || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-primary">{client.custamp || 0}</span>
                          <span className="text-muted-foreground">/{client.reqstamp || requiredStamps}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {client.completed ? (
                            <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                              Completo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Em andamento</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/50 hover:bg-primary hover:text-primary-foreground"
                            onClick={() => handleAddStamp(client)}
                            disabled={client.completed || addingStamp === client.cardId}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
