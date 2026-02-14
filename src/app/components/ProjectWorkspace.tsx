/**
 * COMPONENT: ProjectWorkspace
 * Detail view of a single project with workflow and assets
 */

'use client';

import { useState } from 'react';
import { CheckCircle, Clock, Download, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Project } from '../hooks/useAgentSystem';

interface ProjectWorkspaceProps {
  project: Project | null;
}

const WORKFLOW_STEPS = [
  { id: 'research', title: 'Research', desc: 'Markt- & Wettbewerbsanalyse' },
  { id: 'creative', title: 'Creative', desc: 'Konzepte & Moodboards' },
  { id: 'production', title: 'Production', desc: 'Assets erstellen' },
  { id: 'review', title: 'Review', desc: 'Freigabe durch Kunde' },
  { id: 'delivery', title: 'Delivery', desc: 'Finale Dateien' }
];

const MOCK_ASSETS = [
  { id: '1', name: 'Logo-Konzept-1.png', type: 'image', status: 'approved' },
  { id: '2', name: 'Logo-Konzept-2.png', type: 'image', status: 'pending' },
  { id: '3', name: 'Brand-Guidelines.pdf', type: 'pdf', status: 'pending' }
];

export function ProjectWorkspace({ project }: ProjectWorkspaceProps) {
  const [assets, setAssets] = useState(MOCK_ASSETS);

  if (!project) {
    return (
      <div className="project-workspace">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <p>Wählen Sie ein Projekt aus oder erstellen Sie ein neues</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = WORKFLOW_STEPS.findIndex(step => step.id === project.status);

  const handleApprove = (assetId: string) => {
    setAssets(prev => prev.map(a => 
      a.id === assetId ? { ...a, status: 'approved' } : a
    ));
  };

  const handleReject = (assetId: string) => {
    setAssets(prev => prev.map(a => 
      a.id === assetId ? { ...a, status: 'rejected' } : a
    ));
  };

  return (
    <div className="project-workspace">
      {/* Header */}
      <header className="project-header">
        <div>
          <h1 className="project-header__title">{project.name}</h1>
          <p className="project-header__meta">
            {project.client} • Gestartet: {project.createdAt.toLocaleDateString('de-DE')}
          </p>
        </div>
        <button className="btn btn--secondary btn--small">
          <Download size={16} />
          Alle Dateien
        </button>
      </header>

      {/* Workflow Pipeline */}
      <div className="workflow-pipeline">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = index < currentStepIndex ? 'complete' : 
                        index === currentStepIndex ? 'active' : 'pending';
          
          return (
            <div 
              key={step.id} 
              className={`workflow-step workflow-step--${status}`}
            >
              <div className="workflow-step__number">
                {status === 'complete' ? '✓' : index + 1}
              </div>
              <div className="workflow-step__title">{step.title}</div>
              <div className="workflow-step__desc">{step.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Assets Grid */}
      <section>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
          Entwürfe & Assets
        </h2>
        <div className="asset-grid">
          {assets.map(asset => (
            <div key={asset.id} className="asset-card">
              <div className="asset-card__preview">
                {asset.type === 'image' ? '🖼️ Bild-Vorschau' : '📄 PDF-Dokument'}
              </div>
              <div className="asset-card__info">
                <div className="asset-card__title">{asset.name}</div>
                <div className="asset-card__actions">
                  <button className="btn btn--secondary btn--small">
                    <Eye size={14} />
                    Ansehen
                  </button>
                  
                  {asset.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn--primary btn--small"
                        onClick={() => handleApprove(asset.id)}
                      >
                        <ThumbsUp size={14} />
                        Gut
                      </button>
                      <button 
                        className="btn btn--danger btn--small"
                        onClick={() => handleReject(asset.id)}
                      >
                        <ThumbsDown size={14} />
                        Nein
                      </button>
                    </>
                  )}
                  
                  {asset.status === 'approved' && (
                    <span style={{ color: '#10b981', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={14} />
                      Freigegeben
                    </span>
                  )}
                  
                  {asset.status === 'rejected' && (
                    <span style={{ color: '#ef4444', fontSize: '12px' }}>
                      Überarbeitung nötig
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
