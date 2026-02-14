/**
 * HOOK: useAgentSystem
 * Manages agent states, projects, and workflow orchestration
 */

import { useState, useCallback, useEffect } from 'react';

export interface Agent {
  id: string;
  name: string;
  role: string;
  type: 'research' | 'creative' | 'production' | 'delivery';
  status: 'idle' | 'working' | 'complete' | 'error';
  currentTask?: string;
  progress: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: 'social' | 'logo' | 'branding' | 'video';
  status: 'research' | 'creative' | 'production' | 'review' | 'delivery' | 'complete';
  createdAt: Date;
  briefing?: string;
  assets?: string[];
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'research',
    name: 'Research-Agent',
    role: 'Markt- & Wettbewerbsanalyse',
    type: 'research',
    status: 'idle',
    progress: 0
  },
  {
    id: 'creative',
    name: 'Creative-Agent',
    role: 'Konzepte, Moodboards, Copy',
    type: 'creative',
    status: 'idle',
    progress: 0
  },
  {
    id: 'production',
    name: 'Production-Agent',
    role: 'Bilder, Voice, Assets',
    type: 'production',
    status: 'idle',
    progress: 0
  },
  {
    id: 'delivery',
    name: 'Delivery-Agent',
    role: 'Kundenkommunikation, Export',
    type: 'delivery',
    status: 'idle',
    progress: 0
  }
];

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'TechStart Social Campaign',
    client: 'TechStart GmbH',
    type: 'social',
    status: 'complete',
    createdAt: new Date('2026-02-10')
  },
  {
    id: '2',
    name: 'Yoga Studio Branding',
    client: 'Flow Yoga',
    type: 'branding',
    status: 'creative',
    createdAt: new Date('2026-02-13')
  }
];

export function useAgentSystem() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project | null>(MOCK_PROJECTS[1]);

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.status === 'working' && agent.progress < 100) {
          return { ...agent, progress: Math.min(agent.progress + 5, 100) };
        }
        if (agent.status === 'working' && agent.progress >= 100) {
          return { ...agent, status: 'complete', progress: 100 };
        }
        return agent;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const createProject = useCallback((briefing?: string | Record<string, any>) => {
    const briefingText = typeof briefing === 'string' 
      ? briefing 
      : briefing ? JSON.stringify(briefing, null, 2) : undefined;
    
    const projectName = typeof briefing === 'string' 
      ? briefing.slice(0, 30)
      : briefing?.projectType 
        ? `${briefing.projectType} Projekt`
        : 'Neues Projekt';
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Projekt: ${projectName}`,
      client: typeof briefing === 'object' && briefing?.industry 
        ? briefing.industry 
        : 'Neuer Kunde',
      type: 'branding',
      status: 'research',
      createdAt: new Date(),
      briefing: briefingText
    };
    
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    
    // Activate research agent
    setAgents(prev => prev.map(agent => 
      agent.id === 'research' 
        ? { ...agent, status: 'working', currentTask: 'Analysiere Briefing...', progress: 10 }
        : agent
    ));

    return newProject;
  }, []);

  const activateAgent = useCallback((agentId: string, task: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'working', currentTask: task, progress: 0 }
        : agent
    ));
  }, []);

  return {
    agents,
    projects,
    activeProject,
    createProject,
    activateAgent
  };
}
