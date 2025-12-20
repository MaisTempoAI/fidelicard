import { supabase } from "@/integrations/supabase/client";

// Gera código aleatório de 6 caracteres (letras maiúsculas e números)
export const generateCardCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Formata telefone para apenas números
export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

// Busca empresa por ID
export const getCompany = async (companyId: number) => {
  const { data, error } = await supabase
    .from("CRF-Companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Busca empresa por ID (número) ou urlsite (slug)
export const getCompanyByIdOrSlug = async (identifier: string) => {
  // Se for número, busca por ID
  const numericId = Number(identifier);
  if (!isNaN(numericId) && identifier === String(numericId)) {
    const { data, error } = await supabase
      .from("CRF-Companies")
      .select("*")
      .eq("id", numericId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  // Se não for número, busca por urlsite (case-insensitive)
  const { data, error } = await supabase
    .from("CRF-Companies")
    .select("*")
    .ilike("urlsite", identifier)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Busca cliente por telefone e empresa
export const getClientByPhone = async (phone: string, companyId: number) => {
  const cleanedPhone = cleanPhone(phone);
  const { data, error } = await supabase
    .from("CRF-Clients")
    .select("*")
    .eq("phone", cleanedPhone)
    .eq("eid", companyId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Busca cartão por código
export const getCardByCode = async (cardCode: string) => {
  const { data, error } = await supabase
    .from("CRF-Cards")
    .select("*")
    .eq("cardcode", cardCode)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Busca cliente por cardid (uuid)
export const getClientByCardId = async (cardId: string) => {
  const { data, error } = await supabase
    .from("CRF-Clients")
    .select("*")
    .eq("cardid", cardId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Cria novo cliente
export const createClient = async (phone: string, companyId: number, nome?: string) => {
  const cleanedPhone = cleanPhone(phone);
  const { data, error } = await supabase
    .from("CRF-Clients")
    .insert({
      phone: cleanedPhone,
      eid: companyId,
      nome: nome || null,
      stamps: 0,
      ultimavisita: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Cria novo cartão
export const createCard = async (clientCardId: string, companyId: number, requiredStamps: number = 10) => {
  const cardCode = generateCardCode();
  
  const { data, error } = await supabase
    .from("CRF-Cards")
    .insert({
      idclient: clientCardId,
      cardcode: cardCode,
      custamp: 0,
      reqstamp: requiredStamps,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Cria cartão baseado em template CoCard
export const createCardFromCoCard = async (
  clientCardId: string,
  coCard: {
    card: string | null;
    stamps: number | null;
    days: number | null;
  }
) => {
  const cardCode = generateCardCode();
  
  // Calcula data de expiração baseado nos dias do CoCard
  let expireDate: string | null = null;
  if (coCard.days && coCard.days > 0) {
    const expire = new Date();
    expire.setDate(expire.getDate() + coCard.days);
    expireDate = expire.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  const { data, error } = await supabase
    .from("CRF-Cards")
    .insert({
      idclient: clientCardId,
      cardcode: cardCode,
      custamp: 0,
      reqstamp: coCard.stamps || 10,
      completed: false,
      expiredate: expireDate,
      idemp: coCard.card, // Referência ao CoCard (template da promoção)
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Busca TODOS os cartões de um cliente
export const getAllCardsByClient = async (clientCardId: string) => {
  const { data, error } = await supabase
    .from("CRF-Cards")
    .select("*")
    .eq("idclient", clientCardId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Busca ou cria cliente e retorna todos os cartões
export const findOrCreateClientWithAllCards = async (phone: string, companyId: number) => {
  // Primeiro, busca a empresa para obter loyaltystamps
  const company = await getCompany(companyId);
  const requiredStamps = company?.loyaltystamps ? Number(company.loyaltystamps) : 10;

  // Verifica se já existe um cliente com esse telefone para essa empresa
  let client = await getClientByPhone(phone, companyId);

  // Se não existe, cria um novo cliente
  if (!client) {
    client = await createClient(phone, companyId);
  }

  // Busca TODOS os cartões do cliente
  const allCards = await getAllCardsByClient(client.cardid!);

  // Se não existe nenhum cartão, cria um novo
  if (allCards.length === 0) {
    const newCard = await createCard(client.cardid!, companyId, requiredStamps);
    return { client, cards: [newCard], company };
  }

  return { client, cards: allCards, company };
};

// Cria um novo cartão para o cliente (para quando completa o anterior)
export const createNewCardForClient = async (clientCardId: string, companyId: number) => {
  const company = await getCompany(companyId);
  const requiredStamps = company?.loyaltystamps ? Number(company.loyaltystamps) : 10;
  return await createCard(clientCardId, companyId, requiredStamps);
};

// Busca ou cria cliente e cartão (mantido para compatibilidade)
export const findOrCreateClientAndCard = async (phone: string, companyId: number) => {
  const { client, cards, company } = await findOrCreateClientWithAllCards(phone, companyId);
  // Retorna o cartão ativo (não completado) ou o mais recente
  const activeCard = cards.find(c => !c.completed) || cards[0];
  return { client, card: activeCard };
};

// Verifica se cliente pode criar cartão de uma promoção não renovável
export const canClientCreateCardFromCoCard = async (
  clientCardId: string,
  coCard: { card: string | null; renewable: boolean | null }
): Promise<boolean> => {
  // Se a promoção é renovável (ou não definida), sempre pode criar
  if (coCard.renewable !== false) return true;
  
  // Busca se o cliente já tem um cartão COMPLETADO desta promoção específica
  const { data } = await supabase
    .from("CRF-Cards")
    .select("id")
    .eq("idclient", clientCardId)
    .eq("idemp", coCard.card) // Mesma promoção (CoCard UUID)
    .eq("completed", true)
    .limit(1);
  
  // Se encontrou cartão completado, NÃO pode criar outro
  return !data || data.length === 0;
};

// Filtra promoções disponíveis para o cliente (exclui não-renováveis já completadas)
export const filterAvailablePromotions = async (
  clientCardId: string,
  coCards: Array<{ id: number; card: string | null; renewable: boolean | null }>
): Promise<number[]> => {
  const availableIds: number[] = [];
  
  for (const coCard of coCards) {
    const canCreate = await canClientCreateCardFromCoCard(clientCardId, coCard);
    if (canCreate) {
      availableIds.push(coCard.id);
    }
  }
  
  return availableIds;
};
