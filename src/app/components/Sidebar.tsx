/**
 * COMPONENT: Sidebar
 * Clean, modular sidebar with project list
 */

'use client';

import { Sparkles, Plus, Search, Settings } from 'lucide-react';
import type { Project } from '../types';

const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'TechStart Rebranding', date: 'Heute', unread: 2 },
  { id: '2', title: 'Corporate Identity GmbH', date: 'Gestern' },
  { id: '3', title: 'Social Media Q1', date: 'Vor 2 Tagen' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      {/* Header */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="sidebar__title">StadtHirsch</div>
          <div className="sidebar__version">v5.0 Clean</div>
        </div>
      </div>

      {/* New Briefing Button */}
      <div className="sidebar__actions">
        <button className="btn btn--primary">
          <Plus size={16} />
          Neues Briefing
        </button>
      </div>

      {/* Search */}
      <div className="sidebar__actions" style={{ paddingTop: 0 }}>
        <div className="input__container" style={{ background: 'var(--color-bg-primary)' }}>
          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Suchen..."
            className="input__field"
            style={{ padding: '6px 0' }}
          />
        </div>
      </div>

      {/* Projects */}
      <div className="sidebar__projects">
        <div style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          padding: '12px 16px',
          letterSpacing: '0.05em'
        }}>
          Aktive Briefings
        </div>
        
        <ul className="project-list">
          {MOCK_PROJECTS.map((project) => (
            <li key={project.id} className="project-list__item">
              <button className="project-list__button">
                <span className="project-list__indicator" />
                <div className="project-list__content">
                  <div className="project-list__title">{project.title}</div>
                  <div className="project-list__date">{project.date}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* User */}
      <div style={{ 
        padding: '12px', 
        borderTop: '1px solid var(--color-border-subtle)'
      }}>
        <button style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 150ms'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--color-bg-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)'
          }}>
            LH
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              Lukas Hirsch
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              CEO
            </div>
          </div>
          <Settings size={16} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>
    </aside>
  );
}
