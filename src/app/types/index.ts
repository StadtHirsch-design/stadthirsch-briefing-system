/**
 * TYPES - Central type definitions
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Project {
  id: string;
  title: string;
  date: string;
  unread?: number;
}
