import { supabase } from "@/integrations/supabase/client";

export interface Company {
  id: number;
  name: string | null;
  email: string | null;
  user: string | null;
  elogo: string | null;
  loyaltystamps: string | null;
  phone: string | null;
  address: string | null;
  loyaltytext: string | null;
  exchangeproducts: string | null;
  primarycolour: string | null;
  urlsite: string | null;
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
  rescued: boolean | null;
}

// Authenticate company by email/user and password
export const authenticateCompany = async (login: string, password: string) => {
  const { data, error } = await supabase
    .from("CRF-Companies")
    .select("id, name, email, user, elogo, loyaltystamps, phone, address, loyaltytext, exchangeproducts, primarycolour, urlsite")
    .or(`email.eq.${login},user.eq.${login}`)
    .eq("password", password)
    .single();

  if (error || !data) {
    return { company: null, error: "Credenciais inválidas" };
  }

  return { company: data as Company, error: null };
};

// Get company by ID
export const getCompanyById = async (companyId: number) => {
  const { data, error } = await supabase
    .from("CRF-Companies")
    .select("id, name, email, user, elogo, loyaltystamps, phone, address, loyaltytext, exchangeproducts, primarycolour, urlsite")
    .eq("id", companyId)
    .single();

  if (error || !data) {
    return { company: null, error: error?.message || "Empresa não encontrada" };
  }

  return { company: data as Company, error: null };
};

// Update company data
export const updateCompanyData = async (
  companyId: number,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    urlsite?: string;
  }
) => {
  const { error } = await supabase
    .from("CRF-Companies")
    .update(data)
    .eq("id", companyId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

// Update company card settings
export const updateCompanyCardSettings = async (
  companyId: number,
  data: {
    loyaltystamps?: string;
    loyaltytext?: string;
    exchangeproducts?: string;
    primarycolour?: string;
    elogo?: string;
  }
) => {
  const { error } = await supabase
    .from("CRF-Companies")
    .update(data)
    .eq("id", companyId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
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
    .select("id, idclient, cardcode, custamp, reqstamp, completed, rescued")
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
      rescued: card?.rescued || false,
    };
  });

  return { clients: clientsWithCards, error: null };
};

// Format date to Brazilian format DD/MM/YYYY | HH:mm
const formatEventDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} | ${hours}:${minutes}`;
};

// Add stamp to a card
export const addStampToCard = async (cardId: number, currentStamps: number, requiredStamps: number) => {
  // First, get current events from the card
  const { data: cardData } = await supabase
    .from("CRF-Cards")
    .select("events")
    .eq("id", cardId)
    .single();

  const newStamps = currentStamps + 1;
  const isCompleted = newStamps >= requiredStamps;
  
  // Format new event entry
  const eventDate = formatEventDate(new Date());
  const newEvent = `${newStamps}carimbo='${eventDate}'`;
  
  // Append to existing events or start new
  const currentEvents = cardData?.events || '';
  const updatedEvents = currentEvents ? `${currentEvents};${newEvent}` : newEvent;

  const { error } = await supabase
    .from("CRF-Cards")
    .update({ 
      custamp: newStamps,
      completed: isCompleted,
      completedat: isCompleted ? new Date().toISOString() : null,
      events: updatedEvents
    })
    .eq("id", cardId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, newStamps, isCompleted, error: null };
};

// Update client and card data
export const updateClientAndCard = async (
  cardId: number,
  data: {
    nome: string;
    phone: string;
    cardcode: string;
    custamp: number;
    completed: boolean;
  }
) => {
  // First update the card
  const { error: cardError } = await supabase
    .from("CRF-Cards")
    .update({
      cardcode: data.cardcode,
      custamp: data.custamp,
      completed: data.completed,
      completedat: data.completed ? new Date().toISOString() : null
    })
    .eq("id", cardId);

  if (cardError) {
    return { success: false, error: cardError.message };
  }

  // Get the card to find the client
  const { data: card } = await supabase
    .from("CRF-Cards")
    .select("idclient")
    .eq("id", cardId)
    .single();

  if (card?.idclient) {
    // Update the client
    const { error: clientError } = await supabase
      .from("CRF-Clients")
      .update({
        nome: data.nome,
        phone: data.phone.replace(/\D/g, "")
      })
      .eq("cardid", card.idclient);

    if (clientError) {
      return { success: false, error: clientError.message };
    }
  }

  return { success: true, error: null };
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

// Rescue a completed card
export const rescueCard = async (cardId: number) => {
  const { error } = await supabase
    .from("CRF-Cards")
    .update({ rescued: true })
    .eq("id", cardId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};
