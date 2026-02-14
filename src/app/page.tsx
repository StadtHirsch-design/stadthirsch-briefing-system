/**
 * STADTHIRSCH v5.0 - CLEAN ARCHITECTURE
 * Entry Point - Minimal & Clear
 */

'use client';

import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { MobileOverlay } from './components/MobileOverlay';
import { useSidebar } from './hooks/useSidebar';
import './styles/globals.css';

export default function HomePage() {
  const { isOpen, open, close } = useSidebar();

  return (
    <div className="app">
      <Sidebar isOpen={isOpen} onClose={close} />
      <MobileOverlay isVisible={isOpen} onClick={close} />
      <Chat onOpenSidebar={open} />
    </div>
  );
}
