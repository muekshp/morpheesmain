'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { MorphStudioView } from '@/modules/morph-studio';
import DocumentationView from '@/components/DocumentationView';
import PricingView from '@/components/PricingView';
import SettingsModal from '@/components/SettingsModal';
import HelpModal from '@/components/HelpModal';
import { ApiIntegrationView, MyUploadsView, TryOnHistoryView } from '@/components/WorkspaceViews';
import { useTheme } from '@/context/ThemeContext';

const studioRoutes: Record<string, string> = {
  'morph-studio': 'Saree',
  'product-catalog': 'Saree',
  'try-on-saree': 'Saree',
  'try-on-kurti': 'Kurti',
  'try-on-lehenga': 'Lehenga',
  'try-on-western': 'Western Wear',
  'try-on-men': 'Mens Wear',
  'try-on-footwear': 'Footwear',
  'try-on-jewellery': 'Jewellery',
  'try-on-accessories': 'Accessories',
};

export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentTab, setCurrentTab] = useState<string>('morph-studio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#06080d] text-[#eaeef6]' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      <Navbar
        onOpenSettings={() => setSettingsModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
          }}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenHelp={() => setHelpModalOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 flex overflow-hidden relative">
          {studioRoutes[currentTab] && <MorphStudioView initialCategory={studioRoutes[currentTab]} />}
          {currentTab === 'my-uploads' && <MyUploadsView />}
          {currentTab === 'try-on-history' && <TryOnHistoryView />}
          {currentTab === 'api-integration' && <ApiIntegrationView onConfigure={() => setSettingsModalOpen(true)} />}
          {currentTab === 'documentation' && <DocumentationView />}
          {currentTab === 'usage-billing' && (
            <PricingView onSelectPlan={(_plan) => {}} />
          )}
        </main>
      </div>

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
}
