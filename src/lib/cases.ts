import { BriefingCase } from '@/types';

export const CASE_CONFIGS: Record<BriefingCase, {
  name: string;
  description: string;
  keywords: string[];
  initial_questions: string[];
  document_template: string;
}> = {
  ci: {
    name: 'Corporate Identity & Branding',
    description: 'Entwicklung oder Überarbeitung der gesamten Markenidentität',
    keywords: ['ci', 'corporate identity', 'branding', 'markenführung', 'corporate design', 'markenidentität'],
    initial_questions: [
      'Existiert bereits eine Website oder bestehende Markenmaterialien?',
      'Handelt es sich um eine Neuentwicklung oder ein Redesign?',
      'Welche Markenwerte sollen kommuniziert werden?',
      'Gibt es bestehende Logo-Elemente, die erhalten bleiben sollen?',
      'Welche Touchpoints sind besonders wichtig? (Website, Print, Social Media, Events)'
    ],
    document_template: 'ci_template'
  },
  logo: {
    name: 'Logo-Entwicklung',
    description: 'Neuentwicklung, Redesign oder Evolution des Logos',
    keywords: ['logo', 'wortmarke', 'bildmarke', 'signet', 'markenzeichen', 'redesign'],
    initial_questions: [
      'Ist dies eine Neuentwicklung oder ein Redesign?',
      'Gibt es eine bestehende Website, die berücksichtigt werden muss?',
      'Welche Logo-Varianten werden benötigt? (Standard, Negativ, App-Icon, etc.)',
      'Welche Mindestgrössen sind wichtig?',
      'Gibt es gestalterische No-Gos?'
    ],
    document_template: 'logo_template'
  },
  bildwelt: {
    name: 'Bildwelt-Entwicklung',
    description: 'Entwicklung einer konsistenten visuellen Bildsprache',
    keywords: ['bildwelt', 'fotografie', 'bildsprache', 'visual identity', 'imagery', 'fotokonzept'],
    initial_questions: [
      'Existiert bereits eine Website mit bestehenden Bildern?',
      'Sollen bestehende Bilder weiterverwendet oder ersetzt werden?',
      'Welcher Bildtyp passt zur Marke? (Fotografie, Illustration, 3D, Hybrid)',
      'Welche Stimmung soll vermittelt werden?',
      'Werden die Bilder primär digital oder in Print verwendet?'
    ],
    document_template: 'bildwelt_template'
  },
  piktogramme: {
    name: 'Piktogramm-Systeme',
    description: 'Entwicklung konsistenter Icon- und Piktogramm-Sets',
    keywords: ['piktogramme', 'icons', 'icon-system', 'ui-icons', 'leitsystem', 'piktogrammsystem'],
    initial_questions: [
      'Wo werden die Piktogramme eingesetzt? (Website, App, Leitsystem, Print)',
      'Gibt es bereits bestehende Icons, die angepasst werden müssen?',
      'Welche Strichstärke und Formensprache ist gewünscht?',
      'Wie klein müssen die Icons funktionieren?',
      'Sind Animationen geplant?'
    ],
    document_template: 'piktogramme_template'
  },
  social: {
    name: 'Social Media Content',
    description: 'Content-Strategie und Erstellung von Social-Media-Beiträgen',
    keywords: ['social media', 'content', 'instagram', 'linkedin', 'posts', 'content-strategie'],
    initial_questions: [
      'Auf welchen Plattformen soll die Kampagne laufen?',
      'Was ist das Hauptziel? (Reichweite, Engagement, Leads, Verkauf)',
      'Gibt es bestehende Social-Media-Kanäle?',
      'Wie oft sollen Beiträge veröffentlicht werden?',
      'Gibt es bereits bestehende Bildmaterialien?'
    ],
    document_template: 'social_template'
  }
};

export function detectCase(input: string): BriefingCase | null {
  const lowerInput = input.toLowerCase();
  
  for (const [caseType, config] of Object.entries(CASE_CONFIGS)) {
    if (config.keywords.some(keyword => lowerInput.includes(keyword))) {
      return caseType as BriefingCase;
    }
  }
  
  return null;
}
