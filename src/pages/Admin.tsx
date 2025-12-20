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
  Settings, Download, FileText, ChevronRight, Phone, Calendar, Eye
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { CompanyEditModal } from "@/components/CompanyEditModal";
import { supabase } from "@/integrations/supabase/client";

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
  primarycolour: string;
  icon: string;
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

type ActiveView = 'menu' | 'clients' | 'cards' | 'company' | 'settings' | 'export' | 'stamps' | 'completed';

interface StampEvent {
  cardId: number;
  clientName: string;
  clientPhone: string;
  stampNumber: number;
  date: string;
  time: string;
}

interface CompletedCard {
  cardId: number;
  clientName: string;
  clientPhone: string;
  events: { stampNumber: number; date: string; time: string }[];
  completed: boolean;
  rescued: boolean;
  completedAt?: string;
}

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
    primarycolour: "#121212",
    icon: "scissors",
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

  // Stamps view
  const [stampsData, setStampsData] = useState<StampEvent[]>([]);
  const [loadingStamps, setLoadingStamps] = useState(false);

  // Completed cards view
  const [completedCards, setCompletedCards] = useState<CompletedCard[]>([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [showRescuedOnly, setShowRescuedOnly] = useState(false);

  // Client history popup
  const [showClientHistory, setShowClientHistory] = useState(false);
  const [clientHistoryData, setClientHistoryData] = useState<{ stampNumber: number; date: string; time: string }[]>([]);
  const [clientHistoryName, setClientHistoryName] = useState("");
  const [loadingClientHistory, setLoadingClientHistory] = useState(false);

  // Delete client
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingClient, setDeletingClient] = useState<ClientWithCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        primarycolour: company.primarycolour || "#121212",
        icon: company.icon || "scissors",
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

  // Stamps history handlers
  const parseStampEvents = (): StampEvent[] => {
    const events: StampEvent[] = [];
    
    clients.forEach(client => {
      // We need to get events from cards - but we don't have events in ClientWithCard
      // For now, we'll need to fetch the cards with events
    });
    
    return events;
  };

  const loadStampsData = async () => {
    if (!companyId) return;
    setLoadingStamps(true);
    
    try {
      // Get all cards with events for this company's clients
      const { data: cards, error } = await supabase
        .from("CRF-Cards")
        .select("id, events, idclient");
      
      if (error) throw error;
      
      const allEvents: StampEvent[] = [];
      
      for (const card of cards || []) {
        if (!card.events) continue;
        
        // Find client for this card
        const client = clients.find(c => c.cardId === card.id);
        
        // Parse events: "1selo='19/12/2025 | 14:17';2selo='19/12/2025 | 14:18'"
        // Also support old format with "carimbo"
        const entries = card.events.split(';');
        
        for (const entry of entries) {
          const match = entry.match(/(\d+)(?:selo|carimbo)='(\d{2}\/\d{2}\/\d{4}) \| (\d{2}:\d{2})'/);
          if (match) {
            allEvents.push({
              cardId: card.id,
              clientName: client?.nome || 'Cliente',
              clientPhone: client?.phone || '',
              stampNumber: parseInt(match[1]),
              date: match[2],
              time: match[3],
            });
          }
        }
      }
      
      // Sort by date and time (most recent first)
      allEvents.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA, ...a.time.split(':').map(Number));
        const dateB = new Date(yearB, monthB - 1, dayB, ...b.time.split(':').map(Number));
        return dateB.getTime() - dateA.getTime();
      });
      
      setStampsData(allEvents);
    } catch (err) {
      console.error('Error loading stamps:', err);
      toast.error('Erro ao carregar selos');
    }
    
    setLoadingStamps(false);
  };

  const handleOpenStampsView = async () => {
    setActiveView('stamps');
    await loadStampsData();
  };

  const loadCompletedCards = async () => {
    if (!companyId) return;
    setLoadingCompleted(true);
    
    try {
      // Get all completed cards for this company's clients
      const { data: cards, error } = await supabase
        .from("CRF-Cards")
        .select("id, events, idclient, completed, rescued, completedat")
        .eq("completed", true);
      
      if (error) throw error;
      
      const completedList: CompletedCard[] = [];
      
      for (const card of cards || []) {
        // Find client for this card
        const client = clients.find(c => c.cardId === card.id);
        if (!client) continue;
        
        // Parse events: "1selo='19/12/2025 | 14:17';2selo='19/12/2025 | 14:18'"
        const events: { stampNumber: number; date: string; time: string }[] = [];
        
        if (card.events) {
          const entries = card.events.split(';');
          for (const entry of entries) {
            const match = entry.match(/(\d+)(?:selo|carimbo)='(\d{2}\/\d{2}\/\d{4}) \| (\d{2}:\d{2})'/);
            if (match) {
              events.push({
                stampNumber: parseInt(match[1]),
                date: match[2],
                time: match[3],
              });
            }
          }
        }
        
        // Sort events by stamp number
        events.sort((a, b) => a.stampNumber - b.stampNumber);
        
        completedList.push({
          cardId: card.id,
          clientName: client.nome || 'Cliente',
          clientPhone: client.phone || '',
          events,
          completed: card.completed || false,
          rescued: card.rescued || false,
          completedAt: card.completedat || undefined,
        });
      }
      
      // Sort by completedAt (most recent first)
      completedList.sort((a, b) => {
        if (!a.completedAt && !b.completedAt) return 0;
        if (!a.completedAt) return 1;
        if (!b.completedAt) return -1;
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      });
      
      setCompletedCards(completedList);
    } catch (err) {
      console.error('Error loading completed cards:', err);
      toast.error('Erro ao carregar cartões completos');
    }
    
    setLoadingCompleted(false);
  };

  const handleOpenCompletedView = async () => {
    setActiveView('completed');
    await loadCompletedCards();
  };

  const getGroupedStamps = () => {
    const groups: { [key: string]: StampEvent[] } = {};
    const today = new Date();
    const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
    
    stampsData.forEach(stamp => {
      let groupKey = stamp.date;
      if (stamp.date === todayStr) groupKey = 'HOJE';
      else if (stamp.date === yesterdayStr) groupKey = 'ONTEM';
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(stamp);
    });
    
    return groups;
  };

  const filteredCompletedCards = showRescuedOnly 
    ? completedCards.filter(c => c.rescued) 
    : completedCards.filter(c => !c.rescued);

  // Load client history (stamps)
  const loadClientHistory = async (client: ClientWithCard) => {
    setClientHistoryName(client.nome || "Cliente");
    setShowClientHistory(true);
    setLoadingClientHistory(true);
    setClientHistoryData([]);

    try {
      const { data: cardData, error } = await supabase
        .from("CRF-Cards")
        .select("events")
        .eq("id", client.cardId)
        .maybeSingle();

      if (error) throw error;

      if (cardData?.events) {
        const eventsArray = cardData.events.split(",").filter(Boolean);
        const parsedEvents = eventsArray.map((event: string, index: number) => {
          const eventDate = new Date(event.trim());
          return {
            stampNumber: index + 1,
            date: eventDate.toLocaleDateString('pt-BR'),
            time: eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
        });
        setClientHistoryData(parsedEvents);
      }
    } catch (error) {
      console.error("Error loading client history:", error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoadingClientHistory(false);
    }
  };

  // Delete client
  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    setIsDeleting(true);

    try {
      // Delete the card
      const { error: cardError } = await supabase
        .from("CRF-Cards")
        .delete()
        .eq("id", deletingClient.cardId);

      if (cardError) throw cardError;

      // Delete the client
      const { error: clientError } = await supabase
        .from("CRF-Clients")
        .delete()
        .eq("id", deletingClient.clientId);

      if (clientError) throw clientError;

      toast.success("Cliente excluído com sucesso");
      setShowDeleteConfirm(false);
      setDeletingClient(null);
      setEditingClient(null);
      
      // Reload clients
      loadClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
    } finally {
      setIsDeleting(false);
    }
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
              <div 
                className="bg-[#1a1a1a] rounded-2xl p-4 text-center cursor-pointer hover:bg-[#252525] transition-colors"
                onClick={() => setActiveView('clients')}
              >
                <Users className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <p className="text-xl font-bold text-white">{clients.length}</p>
                <p className="text-[10px] text-gray-400">Clientes</p>
              </div>
            <div 
              className="bg-[#1a1a1a] rounded-2xl p-4 text-center cursor-pointer hover:bg-[#252525] transition-colors"
              onClick={() => handleOpenStampsView()}
            >
              <Star className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-xl font-bold text-white">{totalStamps}</p>
              <p className="text-[10px] text-gray-400">Selos</p>
            </div>
              <div 
                className="bg-[#1a1a1a] rounded-2xl p-4 text-center cursor-pointer hover:bg-[#252525] transition-colors"
                onClick={() => handleOpenCompletedView()}
              >
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
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setDeletingClient(client);
                              setShowDeleteConfirm(true);
                            }}
                            disabled={saving || isDeleting}
                            className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                            <p className={`font-bold ${client.completed ? 'text-green-400' : 'text-orange-500'}`}>
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
                              className="h-9 w-9 text-blue-400 hover:text-blue-500 hover:bg-blue-500/10"
                              onClick={() => loadClientHistory(client)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
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
              <div className="space-y-4">
                {coCards.map((coCard) => {
                  const IconComponent = coCard.icon === 'star' ? Star : coCard.icon === 'circle' ? Circle : coCard.icon === 'x' ? X : Armchair;
                  return (
                    <div 
                      key={coCard.id} 
                      className="relative group"
                    >
                      {/* Card Preview */}
                      <div 
                        className="rounded-2xl p-5 min-h-[180px] relative overflow-hidden shadow-xl"
                        style={{ 
                          backgroundColor: coCard.pricolour || '#121212',
                        }}
                      >
                        {/* Status badge */}
                        <div className="absolute top-3 right-3">
                          {coCard.active ? (
                            <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px]">Ativo</Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-0 text-[10px]">Inativo</Badge>
                          )}
                        </div>

                        {/* Card header */}
                        <div className="mb-4">
                          <h3 
                            className="text-lg font-bold mb-1"
                            style={{ color: coCard.seccolour || '#dcd0c0' }}
                          >
                            {coCard.name || 'Nome do Cartão'}
                          </h3>
                          <p 
                            className="text-sm opacity-80 line-clamp-2"
                            style={{ color: coCard.seccolour || '#dcd0c0' }}
                          >
                            {coCard.text || 'Texto do cartão'}
                          </p>
                        </div>

                        {/* Stamps preview */}
                        <div className="flex gap-2 flex-wrap mb-3">
                          {Array.from({ length: Math.min(coCard.stamps || 10, 6) }).map((_, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full flex items-center justify-center opacity-60"
                              style={{ 
                                backgroundColor: `${coCard.seccolour || '#dcd0c0'}20`,
                                border: `1px dashed ${coCard.seccolour || '#dcd0c0'}40`
                              }}
                            >
                              <IconComponent 
                                className="w-4 h-4" 
                                style={{ color: coCard.seccolour || '#dcd0c0' }} 
                              />
                            </div>
                          ))}
                          {(coCard.stamps || 10) > 6 && (
                            <span 
                              className="text-xs self-center opacity-60"
                              style={{ color: coCard.seccolour || '#dcd0c0' }}
                            >
                              +{(coCard.stamps || 10) - 6}
                            </span>
                          )}
                        </div>

                        {/* Card footer info */}
                        <div className="flex gap-2 mt-auto">
                          <span 
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{ 
                              backgroundColor: `${coCard.seccolour || '#dcd0c0'}15`,
                              color: coCard.seccolour || '#dcd0c0'
                            }}
                          >
                            {coCard.stamps} selos
                          </span>
                          <span 
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{ 
                              backgroundColor: `${coCard.seccolour || '#dcd0c0'}15`,
                              color: coCard.seccolour || '#dcd0c0'
                            }}
                          >
                            {coCard.days} dias
                          </span>
                        </div>

                        {/* Edit overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <Button
                            onClick={() => handleOpenCoCardForm(coCard)}
                            className="bg-[#b8860b] hover:bg-[#a07608] text-white px-6"
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stamps History View */}
        {activeView === 'stamps' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Histórico de Selos</h2>
              <Badge className="bg-orange-500/20 text-orange-500 border-0">
                {totalStamps} total
              </Badge>
            </div>

            {loadingStamps ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                <p className="text-gray-400 mt-2">Carregando selos...</p>
              </div>
            ) : stampsData.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400">Nenhum selo registrado</p>
                <p className="text-xs text-gray-500">Os selos aparecerão aqui quando adicionados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(getGroupedStamps()).map(([date, stamps]) => (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {date}
                      </span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* Stamps for this date */}
                    <div className="space-y-2">
                      {stamps.map((stamp, idx) => (
                        <div 
                          key={`${stamp.cardId}-${stamp.stampNumber}-${idx}`}
                          className="bg-[#1a1a1a] rounded-xl p-3 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <Star className="w-4 h-4 text-orange-500" />
                          </div>
                          <p className="text-white font-medium truncate min-w-0">{stamp.clientName}</p>
                          {stamp.clientPhone && (
                            <a 
                              href={`https://api.whatsapp.com/send/?phone=55${stamp.clientPhone.replace(/\D/g, '')}&text=Mensagem&type=phone_number&app_absent=0`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-500 font-bold flex items-center gap-1 flex-shrink-0 hover:text-green-400"
                            >
                              <Phone className="w-3 h-3" />
                              {stamp.clientPhone}
                            </a>
                          )}
                          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                            <span className="text-sm text-gray-400">{stamp.time}</span>
                            <span className="text-orange-500 font-bold">({stamp.stampNumber}º)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completed Cards View */}
        {activeView === 'completed' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">Cartões Completos</h2>
                <Badge className="bg-green-500/20 text-green-500 border-0">
                  {completedCount}
                </Badge>
              </div>
              <Button
                onClick={() => setShowRescuedOnly(!showRescuedOnly)}
                className={`${showRescuedOnly 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
                } rounded-xl px-4 py-2 text-sm font-bold`}
              >
                {showRescuedOnly ? 'AGUARDANDO' : 'RESGATADOS'}
              </Button>
            </div>

            {loadingCompleted ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                <p className="text-gray-400 mt-2">Carregando...</p>
              </div>
            ) : filteredCompletedCards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400">
                  {showRescuedOnly ? "Nenhum cartão resgatado" : "Nenhum cartão aguardando"}
                </p>
                <p className="text-xs text-gray-500">
                  {showRescuedOnly 
                    ? "Os cartões resgatados aparecerão aqui" 
                    : "Os cartões aguardando resgate aparecerão aqui"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompletedCards.map((card) => (
                  <div 
                    key={card.cardId}
                    className="bg-[#1a1a1a] rounded-2xl p-4 space-y-4"
                  >
                    {/* Client Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Gift className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{card.clientName}</p>
                          {card.clientPhone && (
                            <a 
                              href={`https://api.whatsapp.com/send/?phone=55${card.clientPhone.replace(/\D/g, '')}&text=Mensagem&type=phone_number&app_absent=0`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-500 font-bold flex items-center gap-1 hover:text-green-400"
                            >
                              <Phone className="w-3 h-3" />
                              {card.clientPhone}
                            </a>
                          )}
                        </div>
                      </div>
                      <Badge className={card.rescued 
                        ? "bg-purple-500/20 text-purple-400 border-0" 
                        : "bg-yellow-500/20 text-yellow-400 border-0"
                      }>
                        {card.rescued ? "Resgatado" : "Aguardando"}
                      </Badge>
                    </div>

                    {/* Stamps History */}
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs text-gray-400 mb-3 font-medium">Histórico de selos:</p>
                      <div className="space-y-2">
                        {card.events.length > 0 ? (
                          card.events.map((event, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-3 bg-[#252525] rounded-xl p-3"
                            >
                              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                <Star className="w-5 h-5 text-orange-500" />
                              </div>
                              <span className="text-white font-bold text-base">{event.stampNumber}º selo</span>
                              <div className="ml-auto flex items-center gap-3 text-right">
                                <span className="text-gray-300 text-sm">{event.date}</span>
                                <span className="text-gray-400 text-sm">{event.time}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-2">
                            Sem histórico de selos
                          </p>
                        )}
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
      <CompanyEditModal
        open={showCompanyDataModal}
        onOpenChange={setShowCompanyDataModal}
        companyDataForm={companyDataForm}
        setCompanyDataForm={setCompanyDataForm}
        onSave={handleSaveCompanyData}
        saving={savingCompany}
      />

      {/* CoCard Form Modal */}
      <CoCardFormModal
        open={showCoCardForm}
        onOpenChange={setShowCoCardForm}
        coCardForm={coCardForm}
        setCoCardForm={setCoCardForm}
        onSave={handleSaveCoCard}
        saving={savingCoCard}
      />

      {/* Client History Dialog */}
      <Dialog open={showClientHistory} onOpenChange={setShowClientHistory}>
        <DialogContent className="bg-[#121212] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Histórico de Selos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Cliente: <span className="text-white font-medium">{clientHistoryName}</span></p>
            
            {loadingClientHistory ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                <p className="text-gray-400 mt-2 text-sm">Carregando...</p>
              </div>
            ) : clientHistoryData.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400">Nenhum selo registrado</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {clientHistoryData.map((event, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-lg">{event.stampNumber}º Selo</p>
                      <p className="text-gray-400 text-sm">{event.date} às {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-[#121212] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-center text-xl">
              ⚠️ Atenção
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-center text-base">
              Deseja excluir esse cliente?
              <br />
              <span className="text-white font-medium">{deletingClient?.nome || "Cliente"}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:gap-3">
            <AlertDialogCancel 
              className="flex-1 bg-[#252525] text-gray-400 border-0 hover:bg-[#2a2a2a] hover:text-white"
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClient}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
