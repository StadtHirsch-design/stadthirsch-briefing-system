/**
 * COMPONENT: AgentDashboard
 * Overview of all agents and active projects
 */

'use client';

import { Search, Palette, Image, Send, CheckCircle } from 'lucide-react';
import type { Agent, Project } from '../hooks/useAgentSystem';

interface AgentDashboardProps {
  agents: Agent[];
  projects: Project[];
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  research: <Search size={24} style={{ color: '#3b82f6' }} />,
  creative: <Palette size={24} style={{ color: '#8b5cf6' }} />,
  production: <Image size={24} style={{ color: '#10b981' }} />,
  delivery: <Send size={24} style={{ color: '#f59e0b' }} />
};

const STATUS_LABELS: Record<string, string> = {
  idle: 'Bereit',
  working: 'Arbeitet...',
  complete: 'Fertig',
  error: 'Fehler'
};

export function AgentDashboard({ agents, projects }: AgentDashboardProps) {
  return (
    <div className="agent-dashboard">
      <header className="agent-dashboard__header">
        <h1 className="agent-dashboard__title">Agenten-Übersicht</h1>
        <p className="agent-dashboard__subtitle">
          4 KI-Agenten arbeiten parallel an Ihren Projekten
        </p>
      </header>

      {/* Agent Grid */}
      <div className="agent-grid">
        {agents.map(agent => (
          <div key={agent.id} className={`agent-card agent-card--${agent.type}`}>
            <div className="agent-card__header">
              <div className="agent-card__icon">
                {AGENT_ICONS[agent.type]}
              </div>
              <div className="agent-card__info">
                <div className="agent-card__name">{agent.name}</div>
                <div className="agent-card__role">{agent.role}</div>
              </div>
            </div>

            <div className="agent-card__status">
              <span className={`status-dot status-dot--${agent.status}`} />
              {STATUS_LABELS[agent.status]}
              {agent.progress > 0 && agent.progress < 100 && (
                <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>
                  {agent.progress}%
                </span>
              )}
            </div>

            {agent.currentTask && (
              <div className="agent-card__tasks">
                <div className="agent-card__task">
                  {agent.status === 'working' && (
                    <span className="spinner" style={{ 
                      width: 16, 
                      height: 16, 
                      border: '2px solid var(--color-text-muted)',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}
                  {agent.status === 'complete' && <CheckCircle size={16} color="#10b981" />}
                  {agent.currentTask}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Projects Section */}
      <section className="projects-section">
        <h2 className="projects-section__title">Aktive Projekte</h2>
        <div className="project-list">
          {projects.map(project => (
            <div key={project.id} className="project-item">
              <div className="project-item__icon">
                {project.type === 'social' && '📱'}
                {project.type === 'logo' && '🎨'}
                {project.type === 'branding' && '✨'}
                {project.type === 'video' && '🎬'}
              </div>
              <div className="project-item__info">
                <div className="project-item__name">{project.name}</div>
                <div className="project-item__meta">
                  {project.client} • {project.createdAt.toLocaleDateString('de-DE')}
                </div>
              </div>
              <span className={`project-item__status project-item__status--${project.status === 'complete' ? 'complete' : project.status === 'creative' || project.status === 'production' ? 'active' : 'review'}`}>
                {project.status === 'research' && 'Research'}
                {project.status === 'creative' && 'Konzeption'}
                {project.status === 'production' && 'Produktion'}
                {project.status === 'review' && 'Review'}
                {project.status === 'delivery' && 'Delivery'}
                {project.status === 'complete' && 'Abgeschlossen'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
