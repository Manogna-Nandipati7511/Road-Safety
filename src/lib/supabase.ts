import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Intervention = {
  id: string;
  report_name: string;
  report_date: string;
  uploaded_at: string;
  status: string;
  total_interventions: number;
  metadata: Record<string, unknown>;
};

export type InterventionItem = {
  id: string;
  intervention_id: string;
  item_number: number;
  description: string;
  location: string;
  quantity: number;
  unit: string;
  irc_standard: string;
  irc_clause: string;
};

export type CostEstimate = {
  id: string;
  intervention_item_id: string;
  material_name: string;
  specification: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_cost: number;
  source: string;
  source_reference: string;
  irc_clause_used: string;
  assumptions: string;
};

export type IRCStandard = {
  id: string;
  standard_code: string;
  clause_number: string;
  title: string;
  specification: string;
  material_category: string;
  content: string;
};

export type PriceReference = {
  id: string;
  material_name: string;
  specification: string;
  unit: string;
  price: number;
  source: string;
  source_url: string;
  document_reference: string;
  valid_from: string;
  valid_until: string;
};
