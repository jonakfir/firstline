export interface Profile {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  plan: "free" | "pro" | "agency";
  leads_used_this_month: number;
  created_at: string;
}

export interface LeadList {
  id: string;
  user_id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  total_leads: number;
  processed_leads: number;
  created_at: string;
}

export interface Lead {
  id: string;
  list_id: string;
  name: string;
  company: string;
  linkedin_url: string | null;
  email: string | null;
  enriched_data: Record<string, unknown> | null;
  generated_line: string | null;
  feedback: string | null;
  created_at: string;
}

export interface CSVRow {
  name: string;
  company: string;
  linkedin_url?: string;
  email?: string;
  [key: string]: string | undefined;
}

export interface ColumnMapping {
  name: string;
  company: string;
  linkedin_url: string;
  email: string;
}
