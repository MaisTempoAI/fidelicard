import { supabase } from "@/integrations/supabase/client";

export interface CoCard {
  id: number;
  card: string | null;
  company: string | null;
  name: string | null;
  text: string | null;
  prod: string | null;
  stamps: number | null;
  days: number | null;
  pricolour: string | null;
  seccolour: string | null;
  icon: string | null;
  active: boolean | null;
  created_at: string;
}

// Convert company ID to a valid UUID format
const companyIdToUuid = (companyId: number): string => {
  return `00000000-0000-0000-0000-${companyId.toString().padStart(12, '0')}`;
};

// Get all CoCards for a company
export const getCompanyCoCards = async (companyId: number) => {
  const companyUuid = companyIdToUuid(companyId);

  const { data, error } = await supabase
    .from("CRF-CoCards")
    .select("*")
    .eq("company", companyUuid)
    .order("created_at", { ascending: false });

  return { coCards: data as CoCard[] || [], error: error?.message };
};

// Get only active CoCards for a company
export const getActiveCoCards = async (companyId: number) => {
  const companyUuid = companyIdToUuid(companyId);

  const { data, error } = await supabase
    .from("CRF-CoCards")
    .select("*")
    .eq("company", companyUuid)
    .eq("active", true)
    .order("created_at", { ascending: false });

  return { coCards: data as CoCard[] || [], error: error?.message };
};

// Get CoCard by UUID
export const getCoCardByUuid = async (cardUuid: string) => {
  const { data, error } = await supabase
    .from("CRF-CoCards")
    .select("*")
    .eq("card", cardUuid)
    .single();

  return { coCard: data as CoCard | null, error: error?.message };
};

// Create new CoCard
export const createCoCard = async (
  companyId: number,
  data: {
    name: string;
    text: string;
    prod?: string;
    stamps: number;
    days: number;
    pricolour?: string;
    seccolour?: string;
    icon?: string;
    active?: boolean;
  }
) => {
  const companyUuid = companyIdToUuid(companyId);

  const { data: newCoCard, error } = await supabase
    .from("CRF-CoCards")
    .insert({
      company: companyUuid,
      name: data.name,
      text: data.text,
      prod: data.prod || null,
      stamps: data.stamps,
      days: data.days,
      pricolour: data.pricolour || null,
      seccolour: data.seccolour || null,
      icon: data.icon || 'armchair',
      active: data.active ?? true,
    })
    .select()
    .single();

  if (error) {
    return { coCard: null, error: error.message };
  }

  return { coCard: newCoCard as CoCard, error: null };
};

// Update CoCard
export const updateCoCard = async (
  coCardId: number,
  data: {
    name?: string;
    text?: string;
    prod?: string;
    stamps?: number;
    days?: number;
    pricolour?: string;
    seccolour?: string;
    icon?: string;
    active?: boolean;
  }
) => {
  const { error } = await supabase
    .from("CRF-CoCards")
    .update(data)
    .eq("id", coCardId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

// Delete CoCard
export const deleteCoCard = async (coCardId: number) => {
  const { error } = await supabase
    .from("CRF-CoCards")
    .delete()
    .eq("id", coCardId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

// Toggle CoCard active status
export const toggleCoCardActive = async (coCardId: number, active: boolean) => {
  const { error } = await supabase
    .from("CRF-CoCards")
    .update({ active })
    .eq("id", coCardId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};
