import { supabase } from "@/integrations/supabase/client";

export interface Company {
  id: number;
  name: string | null;
  email: string | null;
  user: string | null;
  elogo: string | null;
  loyaltystamps: string | null;
}

export interface ClientWithCard {
  clientId: number;
  cardId: number;
  nome: string | null;
  phone: string | null;
  cardcode: string | null;
  custamp: number | null;
  reqstamp: number | null;
  completed: boolean | null;
}

// Authenticate company by email/user and password
export const authenticateCompany = async (login: string, password: string) => {
  const { data, error } = await supabase
    .from("CRF-Companies")
    .select("id, name, email, user, elogo, loyaltystamps")
    .or(`email.eq.${login},user.eq.${login}`)
    .eq("password", password)
    .single();

  if (error || !data) {
    return { company: null, error: "Credenciais inválidas" };
  }

  return { company: data as Company, error: null };
};

// Get all clients with their cards for a company
export const getCompanyClientsWithCards = async (companyId: number) => {
  // First get all clients for this company
  const { data: clients, error: clientsError } = await supabase
    .from("CRF-Clients")
    .select("id, nome, phone, cardid")
    .eq("eid", companyId);

  if (clientsError || !clients) {
    return { clients: [], error: clientsError?.message };
  }

  // Get all cards for these clients
  const clientCardIds = clients.map(c => c.cardid).filter(Boolean);
  
  const { data: cards, error: cardsError } = await supabase
    .from("CRF-Cards")
    .select("id, idclient, cardcode, custamp, reqstamp, completed")
    .in("idclient", clientCardIds);

  if (cardsError) {
    return { clients: [], error: cardsError.message };
  }

  // Merge clients with their cards
  const clientsWithCards: ClientWithCard[] = clients.map(client => {
    const card = cards?.find(c => c.idclient === client.cardid);
    return {
      clientId: client.id,
      cardId: card?.id || 0,
      nome: client.nome,
      phone: client.phone,
      cardcode: card?.cardcode || null,
      custamp: card?.custamp || 0,
      reqstamp: card?.reqstamp || 10,
      completed: card?.completed || false,
    };
  });

  return { clients: clientsWithCards, error: null };
};

// Add stamp to a card
export const addStampToCard = async (cardId: number, currentStamps: number, requiredStamps: number) => {
  const newStamps = currentStamps + 1;
  const isCompleted = newStamps >= requiredStamps;

  const { error } = await supabase
    .from("CRF-Cards")
    .update({ 
      custamp: newStamps,
      completed: isCompleted,
      completedat: isCompleted ? new Date().toISOString() : null
    })
    .eq("id", cardId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, newStamps, isCompleted, error: null };
};

// Search clients by phone or cardcode
export const searchClients = (clients: ClientWithCard[], searchTerm: string) => {
  if (!searchTerm) return clients;
  
  const term = searchTerm.toLowerCase();
  return clients.filter(c => 
    c.phone?.includes(term) ||
    c.cardcode?.toLowerCase().includes(term) ||
    c.nome?.toLowerCase().includes(term)
  );
};
