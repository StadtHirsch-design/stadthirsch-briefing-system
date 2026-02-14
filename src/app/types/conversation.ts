/**
 * TYPES: Conversation Memory System
 */

export interface ConversationMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    intent?: string;
    entities?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

export interface BriefingContext {
  projectType?: 'logo' | 'social' | 'branding' | 'video' | 'other';
  industry?: string;
  targetAudience?: string;
  style?: string;
  colors?: string[];
  budget?: string;
  timeline?: string;
  competitors?: string[];
  likes?: string[];
  dislikes?: string[];
  uniqueSellingPoints?: string[];
  additionalInfo?: string;
}

export interface ConversationMemory {
  messages: ConversationMessage[];
  briefing: BriefingContext;
  stage: 'initial' | 'exploring' | 'deep_dive' | 'confirmation' | 'complete';
  missingFields: string[];
  confidence: number; // 0-1
  lastUpdated: number;
}

export interface AgentTask {
  id: string;
  agentType: 'research' | 'creative' | 'production' | 'delivery';
  status: 'pending' | 'running' | 'complete' | 'error';
  description: string;
  dependencies?: string[];
  output?: any;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'briefing' | 'research' | 'creative' | 'production' | 'review' | 'complete';
  memory: ConversationMemory;
  tasks: AgentTask[];
  createdAt: number;
  updatedAt: number;
}
