'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LandingPage from '@/components/LandingPage';
import ProfileView from '@/components/ProfileView';
import OptimizerView from '@/components/OptimizerView';
import SettingsView from '@/components/SettingsView';
import HistoryView from '@/components/HistoryView';
import CoverLetterView from '@/components/CoverLetterView';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { activeView, theme } = useAppStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Landing page = full screen, no sidebar
  if (activeView === 'landing') {
    return <LandingPage />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {activeView === 'profile' && <ProfileView />}
        {activeView === 'optimize' && <OptimizerView />}
        {activeView === 'coverletter' && <CoverLetterView />}
        {activeView === 'settings' && <SettingsView />}
        {activeView === 'history' && <HistoryView />}
      </main>
    </div>
  );
}
