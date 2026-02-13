export interface Project {
  id: string;
  customer_name: string;
  customer_email?: string;
  project_type: 'ci' | 'logo' | 'bildwelt' | 'piktogramme' | 'social' | null;
  status: 'briefing' | 'research' | 'strategy' | 'document' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  message: string;
  role: 'user' | 'assistant' | 'system';
  metadata?: {
    case_detected?: string;
    insights_extracted?: string[];
    next_questions?: string[];
  };
  created_at: string;
}

export interface Insight {
  id: string;
  project_id: string;
  category: 'brand_values' | 'target_audience' | 'competitors' | 'usp' | 'touchpoints' | 'goals' | 'restrictions';
  content: string;
  confidence: number;
  created_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  file_url?: string;
  file_name?: string;
  version: number;
  created_at: string;
}

export interface CaseConfig {
  id: string;
  name: string;
  description: string;
  initial_questions: string[];
  required_info: string[];
  document_sections: string[];
}

export type BriefingCase = 'ci' | 'logo' | 'bildwelt' | 'piktogramme' | 'social';
