/**
 * HOOK: useConversationMemory
 * Advanced conversation management with context awareness
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  ConversationMessage, 
  ConversationMemory, 
  BriefingContext,
  Project 
} from '../types/conversation';

const STORAGE_KEY = 'stadthirsch_conversation_memory';

const INITIAL_MEMORY: ConversationMemory = {
  messages: [],
  briefing: {},
  stage: 'initial',
  missingFields: [
    'projectType',
    'industry',
    'targetAudience',
    'style',
    'timeline'
  ],
  confidence: 0,
  lastUpdated: Date.now()
};

// Extract information from message using simple NLP
function extractInformation(content: string, currentBriefing: BriefingContext): Partial<BriefingContext> {
  const updates: Partial<BriefingContext> = {};
  const lower = content.toLowerCase();
  
  // Project Type Detection
  if (!currentBriefing.projectType) {
    if (lower.includes('logo') || lower.includes('zeichen') || lower.includes('symbol')) {
      updates.projectType = 'logo';
    } else if (lower.includes('social') || lower.includes('instagram') || lower.includes('linkedin') || lower.includes('post')) {
      updates.projectType = 'social';
    } else if (lower.includes('branding') || lower.includes('corporate identity') || lower.includes('ci')) {
      updates.projectType = 'branding';
    } else if (lower.includes('video') || lower.includes('film') || lower.includes('werbespot')) {
      updates.projectType = 'video';
    }
  }
  
  // Industry Detection
  if (!currentBriefing.industry) {
    const industries = [
      'yoga', 'fitness', 'gesundheit', 'technologie', 'tech', 'it', 'software',
      'beratung', 'consulting', 'finanzen', 'bank', 'versicherung', 'immobilien',
      'gastronomie', 'restaurant', 'cafe', 'handel', 'e-commerce', 'shop',
      'bildung', 'coaching', 'schule', 'universität',
      'bau', 'handwerk', 'produktion', 'industrie'
    ];
    
    for (const industry of industries) {
      if (lower.includes(industry)) {
        updates.industry = industry;
        break;
      }
    }
  }
  
  // Target Audience
  if (!currentBriefing.targetAudience && 
      (lower.includes('zielgruppe') || lower.includes('kunden') || lower.includes('kundin') || 
       lower.includes('zielkunde') || lower.includes('nutzer'))) {
    // Extract sentence about target audience
    const sentences = content.split(/[.!?]/);
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes('zielgruppe') || 
          sentence.toLowerCase().includes('kunden') ||
          sentence.toLowerCase().includes('nutzer')) {
        updates.targetAudience = sentence.trim();
        break;
      }
    }
  }
  
  // Style Detection
  if (!currentBriefing.style) {
    const styles = [
      ['modern', 'modern', 'zeitgemäß', 'aktuell'],
      ['klassisch', 'klassisch', 'traditionell', 'elegant'],
      ['minimalistisch', 'minimalistisch', 'schlicht', 'reduziert', 'clean'],
      ['verspielt', 'verspielt', 'kreativ', 'bunt', 'fröhlich'],
      ['professionell', 'professionell', 'seriös', 'business'],
      ['natürlich', 'natürlich', 'organisch', 'nachhaltig', 'grün']
    ];
    
    for (const [styleName, ...keywords] of styles) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          updates.style = styleName;
          break;
        }
      }
      if (updates.style) break;
    }
  }
  
  // Colors
  if (!currentBriefing.colors || currentBriefing.colors.length === 0) {
    const colorMap: Record<string, string[]> = {
      'blau': ['blau', 'blue', 'türkis', 'cyan'],
      'grün': ['grün', 'green', 'oliv', 'lime'],
      'rot': ['rot', 'red', 'bordeaux', 'kirsch'],
      'orange': ['orange', 'peach', 'apricot'],
      'gelb': ['gelb', 'yellow', 'gold'],
      'lila': ['lila', 'violett', 'purple', 'lavendel'],
      'rosa': ['rosa', 'pink', 'magenta'],
      'schwarz': ['schwarz', 'black'],
      'weiß': ['weiß', 'weiss', 'white'],
      'grau': ['grau', 'grey', 'gray', 'silber']
    };
    
    const foundColors: string[] = [];
    for (const [color, variants] of Object.entries(colorMap)) {
      for (const variant of variants) {
        if (lower.includes(variant)) {
          foundColors.push(color);
          break;
        }
      }
    }
    
    if (foundColors.length > 0) {
      updates.colors = foundColors;
    }
  }
  
  // Timeline
  if (!currentBriefing.timeline && 
      (lower.includes('zeit') || lower.includes('termin') || lower.includes('deadline') || 
       lower.includes('woche') || lower.includes('monat') || lower.includes('tag'))) {
    const timePatterns = [
      /(\d+)\s*woche/i,
      /(\d+)\s*monat/i,
      /(\d+)\s*tag/i,
      /(\d+)\s*wochen/i,
      /(\d+)\s*monate/i,
      /(\d+)\s*tage/i,
      /(dringend|eilig|schnell|sofort)/i
    ];
    
    for (const pattern of timePatterns) {
      const match = content.match(pattern);
      if (match) {
        updates.timeline = match[0];
        break;
      }
    }
  }
  
  // Competitors
  if (!currentBriefing.competitors) {
    const competitorPatterns = [
      /wettbewerber[:\s]+([^,.]+)/i,
      /konkurrent[:\s]+([^,.]+)/i,
      /vergleichbar mit[:\s]+([^,.]+)/i,
      /ähnlich wie[:\s]+([^,.]+)/i
    ];
    
    for (const pattern of competitorPatterns) {
      const match = content.match(pattern);
      if (match) {
        updates.competitors = [match[1].trim()];
        break;
      }
    }
  }
  
  // Likes/Dislikes
  if (lower.includes('gefällt') || lower.includes('mag ich') || lower.includes('gut')) {
    const likeMatch = content.match(/(?:gefällt|mag ich|finde gut|gut finde)[:\s]+([^,.]+)/i);
    if (likeMatch) {
      updates.likes = [...(currentBriefing.likes || []), likeMatch[1].trim()];
    }
  }
  
  if (lower.includes('nicht') && (lower.includes('gefällt') || lower.includes('mag'))) {
    const dislikeMatch = content.match(/(?:nicht gefällt|mag ich nicht|nicht gut)[:\s]+([^,.]+)/i);
    if (dislikeMatch) {
      updates.dislikes = [...(currentBriefing.dislikes || []), dislikeMatch[1].trim()];
    }
  }
  
  return updates;
}

// Determine conversation stage and missing fields
function analyzeProgress(memory: ConversationMemory): { stage: ConversationMemory['stage'], missingFields: string[], confidence: number } {
  const { briefing, messages } = memory;
  const filledFields = Object.entries(briefing).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  }).map(([key]) => key);
  
  const allFields = ['projectType', 'industry', 'targetAudience', 'style', 'timeline'];
  const missingFields = allFields.filter(f => !filledFields.includes(f));
  
  const confidence = filledFields.length / allFields.length;
  
  let stage: ConversationMemory['stage'] = 'initial';
  
  if (messages.length === 0) {
    stage = 'initial';
  } else if (messages.length <= 2) {
    stage = 'exploring';
  } else if (missingFields.length > 0) {
    stage = 'deep_dive';
  } else if (confidence >= 0.8) {
    stage = 'confirmation';
  } else {
    stage = 'complete';
  }
  
  return { stage, missingFields, confidence };
}

export function useConversationMemory(projectId?: string) {
  const [memory, setMemory] = useState<ConversationMemory>(INITIAL_MEMORY);
  const [isInitialized, setIsInitialized] = useState(false);
  const projectIdRef = useRef(projectId || `project_${Date.now()}`);
  
  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${projectIdRef.current}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMemory(parsed);
      }
    } catch (e) {
      console.error('Failed to load conversation memory:', e);
    }
    setIsInitialized(true);
  }, []);
  
  // Save to localStorage on changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(`${STORAGE_KEY}_${projectIdRef.current}`, JSON.stringify(memory));
    } catch (e) {
      console.error('Failed to save conversation memory:', e);
    }
  }, [memory, isInitialized]);
  
  const addMessage = useCallback((role: ConversationMessage['role'], content: string) => {
    const newMessage: ConversationMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now()
    };
    
    setMemory(prev => {
      // If user message, extract information
      let updatedBriefing = prev.briefing;
      if (role === 'user') {
        const extracted = extractInformation(content, prev.briefing);
        updatedBriefing = { ...prev.briefing, ...extracted };
      }
      
      const updatedMemory: ConversationMemory = {
        ...prev,
        messages: [...prev.messages, newMessage],
        briefing: updatedBriefing,
        lastUpdated: Date.now()
      };
      
      // Re-analyze progress
      const analysis = analyzeProgress(updatedMemory);
      updatedMemory.stage = analysis.stage;
      updatedMemory.missingFields = analysis.missingFields;
      updatedMemory.confidence = analysis.confidence;
      
      return updatedMemory;
    });
    
    return newMessage;
  }, []);
  
  const getContextForAI = useCallback(() => {
    const { messages, briefing, stage, missingFields, confidence } = memory;
    
    // Build context summary
    const recentMessages = messages.slice(-10); // Last 10 messages
    const messageHistory = recentMessages.map(m => 
      `${m.role === 'user' ? 'KUNDE' : 'KI'}: ${m.content}`
    ).join('\n\n');
    
    const briefingSummary = Object.entries(briefing)
      .filter(([_, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== '';
      })
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n');
    
    return {
      messageHistory,
      briefingSummary: briefingSummary || 'Noch keine Informationen erfasst',
      stage,
      missingFields,
      confidence,
      totalMessages: messages.length
    };
  }, [memory]);
  
  const isBriefingComplete = useCallback(() => {
    return memory.confidence >= 0.8 && memory.missingFields.length === 0;
  }, [memory]);
  
  const resetMemory = useCallback(() => {
    setMemory(INITIAL_MEMORY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_KEY}_${projectIdRef.current}`);
    }
  }, []);
  
  const getFullBriefing = useCallback(() => {
    return memory.briefing;
  }, [memory]);

  return {
    memory,
    addMessage,
    getContextForAI,
    isBriefingComplete,
    resetMemory,
    getFullBriefing,
    isInitialized
  };
}
