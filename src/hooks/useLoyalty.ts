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
export const createCard = async (clientCardId: string, companyId: number) => {
  const cardCode = generateCardCode();
  const { data, error } = await supabase
    .from("CRF-Cards")
    .insert({
      idclient: clientCardId,
      idemp: null, // idemp é UUID, companyId é número - precisamos ajustar isso
      cardcode: cardCode,
      custamp: 0,
      reqstamp: 10,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Busca ou cria cliente e cartão
export const findOrCreateClientAndCard = async (phone: string, companyId: number) => {
  // Primeiro, verifica se já existe um cliente com esse telefone para essa empresa
  let client = await getClientByPhone(phone, companyId);

  // Se não existe, cria um novo cliente
  if (!client) {
    client = await createClient(phone, companyId);
  }

  // Agora busca o cartão pelo cardid do cliente
  const { data: existingCard, error: cardError } = await supabase
    .from("CRF-Cards")
    .select("*")
    .eq("idclient", client.cardid)
    .maybeSingle();

  if (cardError) throw cardError;

  // Se não existe cartão, cria um novo
  let card = existingCard;
  if (!card) {
    card = await createCard(client.cardid!, companyId);
  }

  return { client, card };
};
