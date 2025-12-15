import { useState } from "react";
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
import { QrCode, Search, UtensilsCrossed, Users } from "lucide-react";

// Mock data
const mockCustomers = [
  { id: 1, name: "João Silva", phone: "(11) 99999-1111", stamps: 4, external_code: "H6KQWA", is_completed: false },
  { id: 2, name: "Maria Santos", phone: "(11) 98888-2222", stamps: 10, external_code: "K9PLMX", is_completed: true },
  { id: 3, name: "Pedro Oliveira", phone: "(11) 97777-3333", stamps: 7, external_code: "N2RTWS", is_completed: false },
  { id: 4, name: "Ana Costa", phone: "(11) 96666-4444", stamps: 2, external_code: "B5YGZV", is_completed: false },
  { id: 5, name: "Carlos Lima", phone: "(11) 95555-5555", stamps: 9, external_code: "T8HCFJ", is_completed: false },
];

const Admin = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredCustomers = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleScanQR = () => {
    navigate("/admin/scanner");
  };

  const handleRowClick = (code: string) => {
    navigate(`/admin/add-stamp/${code}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full gradient-warm flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meu Restaurante</h1>
            <p className="text-muted-foreground text-sm">Painel Administrativo</p>
          </div>
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
                  <p className="text-2xl font-bold text-foreground">{mockCustomers.length}</p>
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
                  <p className="text-2xl font-bold text-foreground">
                    {mockCustomers.reduce((acc, c) => acc + c.stamps, 0)}
                  </p>
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
                  <p className="text-2xl font-bold text-foreground">
                    {mockCustomers.filter((c) => c.is_completed).length}
                  </p>
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
                  placeholder="Buscar por nome ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full md:w-64 border-primary/30"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-center">Carimbos</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer hover:bg-primary/5"
                      onClick={() => handleRowClick(customer.external_code)}
                    >
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-primary">{customer.stamps}</span>
                        <span className="text-muted-foreground">/10</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {customer.is_completed ? (
                          <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                            Completo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Em andamento</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
