/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RankChatView } from './components/RankChatView';
import { ThirdEyeView } from './components/ThirdEyeView';
import { HierarchyRosterView } from './components/HierarchyRosterView';
import { CouncilsView } from './components/CouncilsView';
import { AdminControlView } from './components/AdminControlView';
import { CreedAndRulesView } from './components/CreedAndRulesView';
import { UserProfileModal } from './components/UserProfileModal';
import { DenounceModal } from './components/DenounceModal';
import { AuthModal } from './components/AuthModal';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { QuickActionsModal } from './components/QuickActionsModal';
import {
  Crown,
  Sparkles,
  Shield,
  MessageSquare,
  Eye,
  Users,
  BookOpen,
  Sliders,
  Calendar,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [isDenounceModalOpen, setIsDenounceModalOpen] = useState(false);
  const { currentUser, users, canAccessAdmin, setActiveRoomId, isQuickActionsOpen, setIsQuickActionsOpen } = useFamily();

  const pendingNoMenCount = users.filter((u) => u.rank === 'No Man').length;
  const userCanAccessAdmin = canAccessAdmin(currentUser);

  const handleNavigateToChat = (roomId?: string) => {
    if (roomId) {
      setActiveRoomId(roomId);
    }
    setActiveTab('chat');
  };

  const mobileNavItems = [
    { id: 'dashboard', label: 'Overview', icon: Shield },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    {
      id: 'thirdeye',
      label: 'Third Eye',
      icon: Eye,
      badge: pendingNoMenCount > 0 ? `${pendingNoMenCount}` : undefined,
    },
    { id: 'roster', label: 'Roster', icon: Users },
    { id: 'councils', label: 'Regions', icon: Crown },
    {
      id: userCanAccessAdmin ? 'admin' : 'creed',
      label: userCanAccessAdmin ? 'Admin' : 'Creed',
      icon: userCanAccessAdmin ? Sliders : BookOpen,
    },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#050505] text-[#D4D4D4] flex flex-col selection:bg-amber-500/30 selection:text-amber-200 pb-16 lg:pb-0">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={(mode) => setAuthModalMode(mode)}
        onOpenDenounceModal={() => setIsDenounceModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-full lg:max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenDenounceModal={() => setIsDenounceModalOpen(true)}
            onNavigateToChat={handleNavigateToChat}
            onNavigateToCreed={() => setActiveTab('creed')}
            onNavigateToTab={setActiveTab}
          />
        )}
        {activeTab === 'chat' && <RankChatView />}
        {activeTab === 'thirdeye' && <ThirdEyeView />}
        {activeTab === 'roster' && <HierarchyRosterView />}
        {activeTab === 'councils' && <CouncilsView />}
        {activeTab === 'events' && (
          <DashboardView
            onOpenDenounceModal={() => setIsDenounceModalOpen(true)}
            onNavigateToChat={handleNavigateToChat}
            onNavigateToCreed={() => setActiveTab('creed')}
            onNavigateToTab={setActiveTab}
          />
        )}
        {activeTab === 'creed' && <CreedAndRulesView />}
        {activeTab === 'admin' && <AdminControlView />}
      </main>

      {/* Mobile Floating Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090f]/95 backdrop-blur-lg border-t border-zinc-800/90 py-1 px-1.5 flex items-center justify-around shadow-2xl">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-bottom-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-amber-300 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={18}
                  className={`transition-transform ${
                    isActive ? 'scale-110 text-amber-400' : 'text-zinc-400'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-zinc-950 font-mono shadow">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono mt-0.5 tracking-tight truncate max-w-[55px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Modals & Celebrations */}
      <UserProfileModal onOpenDenounceModal={() => setIsDenounceModalOpen(true)} />
      <DenounceModal
        isOpen={isDenounceModalOpen}
        onClose={() => setIsDenounceModalOpen(false)}
      />
      <AuthModal
        isOpen={authModalMode !== null}
        initialMode={authModalMode || 'login'}
        onClose={() => setAuthModalMode(null)}
      />
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onNavigateToTab={setActiveTab}
      />
      <CelebrationOverlay />

      {/* Footer */}
      <footer className="bg-[#08090f] border-t border-zinc-800/80 py-6 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-zinc-400">
        <div className="w-full max-w-full lg:max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown size={16} />
            </div>
            <div>
              <div className="font-cinzel font-bold text-zinc-200">SBB – SUCCESSFUL BAD BOYS</div>
              <div className="text-[10px] text-zinc-400 font-mono">
                GTA VI Roleplay Royal Mafia Syndicate
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-zinc-400">
            <span>Loyalty</span>
            <span>•</span>
            <span>Discipline</span>
            <span>•</span>
            <span>Brotherhood</span>
            <span>•</span>
            <span>Legacy</span>
          </div>

          <div className="text-[11px] text-zinc-400 text-center sm:text-right font-mono">
            M19 Ceremony: Hosted on the 31st Day • Third Eye Network
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <FamilyProvider>
      <MainContent />
    </FamilyProvider>
  );
}
