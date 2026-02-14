/**
 * COMPONENT: MobileOverlay
 * Backdrop for mobile sidebar
 */

'use client';

interface MobileOverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

export function MobileOverlay({ isVisible, onClick }: MobileOverlayProps) {
  return (
    <div 
      className={`mobile-overlay ${isVisible ? 'is-visible' : ''}`}
      onClick={onClick}
    />
  );
}
