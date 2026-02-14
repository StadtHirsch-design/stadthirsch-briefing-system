/**
 * STADTHIRSCH KI-AGENTUR v6.0
 * Multi-Agent Dashboard für vollautomatisierte Werbe- & Grafikagentur
 * 
 * Agenten: Research → Creative → Production → Delivery
 */

'use client';

import { useState } from 'react';
import { AgentDashboard } from './components/AgentDashboard';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { LiveChat } from './components/LiveChat';
import { useAgentSystem } from './hooks/useAgentSystem';
import './styles/agency.css';

export default function AgencyPage() {
  const [activeView, setActiveView] = useState<'dashboard' | 'project' | 'chat'>('dashboard');
  const { agents, projects, activeProject, createProject } = useAgentSystem();

  const handleBriefingComplete = (briefing: Record<string, any>) => {
    createProject(briefing);
    // Switch to project view after briefing
    setTimeout(() => setActiveView('project'), 1500);
  };

  return (
    <div className="agency">
      {/* Navigation */}
      <nav className="agency-nav">
        <div className="agency-nav__brand">
          <span className="agency-nav__logo">S</span>
          <span className="agency-nav__title">StadtHirsch Agentur</span>
        </div>
        
        <div className="agency-nav__tabs">
          <button 
            className={`agency-nav__tab ${activeView === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`agency-nav__tab ${activeView === 'project' ? 'is-active' : ''}`}
            onClick={() => setActiveView('project')}
          >
            Projekt
          </button>
          <button 
            className={`agency-nav__tab ${activeView === 'chat' ? 'is-active' : ''}`}
            onClick={() => setActiveView('chat')}
          >
            Briefing
          </button>
        </div>

        <button className="btn btn--accent" onClick={() => createProject()}>
          + Neues Projekt
        </button>
      </nav>

      {/* Main Content */}
      <main className="agency-main">
        {activeView === 'dashboard' && (
          <AgentDashboard agents={agents} projects={projects} />
        )}
        {activeView === 'project' && activeProject && (
          <ProjectWorkspace project={activeProject} />
        )}
        {activeView === 'chat' && (
          <LiveChat onBriefingComplete={handleBriefingComplete} />
        )}
      </main>
    </div>
  );
}
