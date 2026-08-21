import React, { useState, useRef, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge, SpecialTitleBadge } from './RankBadge';
import { NotificationCenter } from './NotificationCenter';
import { RANK_LEVELS } from '../types';
import {
  Crown,
  MessageSquare,
  Users,
  Eye,
  Shield,
  Calendar,
  BookOpen,
  ChevronDown,
  LogOut,
  UserPlus,
  LogIn,
  Sliders,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Menu,
  X,
  Zap,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onOpenDenounceModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenDenounceModal,
}) => {
  const {
    currentUser,
    users,
    loginUser,
    logoutUser,
    setSelectedProfileUser,
    resetAllData,
    setIsQuickActionsOpen,
    canAccessAdmin,
  } = useFamily();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const demoMenuRef = useRef<HTMLDivElement>(null);

  const pendingNoMenCount = users.filter((u) => u.rank === 'No Man').length;
  const userRankLevel = currentUser ? RANK_LEVELS[currentUser.rank] || 1 : 0;
  const isOGOrHigher = userRankLevel >= 6;
  const userCanAccessAdmin = canAccessAdmin(currentUser);

  // Quick Action is ONLY visible to those with permission (O.G, Lord, Ghost, Don, Honcho)
  const canUseQuickActions = Boolean(currentUser && (isOGOrHigher || userCanAccessAdmin));

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subtitle: 'Overview & Family Directives',
      icon: Shield,
    },
    {
      id: 'chat',
      label: 'Rank Rooms',
      subtitle: 'Rank-Gated Communications',
      icon: MessageSquare,
    },
    {
      id: 'thirdeye',
      label: 'Third Eye & Recruits',
      subtitle: 'Sponsorships & Mentorship',
      icon: Eye,
      badge: pendingNoMenCount > 0 ? `${pendingNoMenCount}` : undefined,
    },
    {
      id: 'roster',
      label: 'Hierarchy & Roster',
      subtitle: '10 Official Family Ranks',
      icon: Users,
    },
    {
      id: 'councils',
      label: 'Regions & Domaines',
      subtitle: 'Regions (Lords) & Domaines (O.Gs)',
      icon: Crown,
    },
    {
      id: 'events',
      label: 'Events & M19 Board',
      subtitle: 'Ceremonies & Convoys',
      icon: Calendar,
    },
    {
      id: 'creed',
      label: 'Creed & Rules',
      subtitle: 'Sacred Doctrines & Code',
      icon: BookOpen,
    },
    ...(userCanAccessAdmin
      ? [
          {
            id: 'admin',
            label: 'Admin Council',
            subtitle: 'Voting, Succession & Directorate (O.G+)',
            icon: Sliders,
            highlight: true,
          },
        ]
      : []),
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowMenuDropdown(false);
    setShowUserDropdown(false);
  };

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMenuDropdown(false);
        setShowUserDropdown(false);
        setShowDemoSelector(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#08090f]/95 backdrop-blur-md border-b border-zinc-800/90 shadow-2xl w-full max-w-full">
      {/* Top Accent Strip with GTA VI RP & Demo Switcher Notice */}
      <div className="bg-[#050505] px-2.5 sm:px-6 py-1 text-xs border-b border-zinc-800/80 flex items-center justify-between gap-2 w-full max-w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 text-amber-400 font-medium min-w-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="font-cinzel tracking-wider uppercase text-[10px] sm:text-[11px] font-bold truncate">
            SBB ROYAL MAFIA FAMILY
          </span>
          <span className="text-zinc-600 hidden md:inline">|</span>
          <span className="text-zinc-400 text-[10px] sm:text-[11px] font-mono hidden md:inline">
            GTA VI Roleplay Syndicate
          </span>
        </div>

        {/* Quick Demo Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" ref={demoMenuRef}>
          <span className="text-[10px] font-mono text-zinc-500 hidden md:inline">
            RP TEST SWITCHER:
          </span>
          <div className="relative">
            <button
              id="demo-switcher-btn"
              onClick={() => {
                setShowDemoSelector(!showDemoSelector);
                setShowUserDropdown(false);
                setShowMenuDropdown(false);
              }}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-[#0e111a] hover:bg-[#141824] text-amber-300 rounded border border-amber-500/30 text-[10px] sm:text-[11px] font-mono transition-colors"
            >
              <Sparkles size={11} className="text-amber-400 shrink-0" />
              <span className="truncate max-w-[95px] xs:max-w-[130px] sm:max-w-none">
                {currentUser
                  ? `${currentUser.fullName.split(' ')[0]} (${currentUser.rank.replace('Junior Boss (31-JB)', 'JB').replace('Honcho (King)', 'Honcho').replace('Ghost (007)', 'Ghost')})`
                  : 'Select Persona'}
              </span>
              <ChevronDown size={11} className="shrink-0" />
            </button>

            {showDemoSelector && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/50 sm:bg-transparent"
                  onClick={() => setShowDemoSelector(false)}
                />
                <div className="fixed left-2 right-2 top-8 sm:left-auto sm:right-0 sm:top-full sm:absolute sm:mt-1.5 sm:w-72 max-w-[calc(100vw-20px)] bg-[#0a0d14] border border-zinc-700/80 rounded-xl shadow-2xl p-2 z-50 divide-y divide-zinc-800 animate-fade-in">
                  <div className="p-1.5 pb-2 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    Select Member Persona to Test
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1 space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          loginUser(u.id);
                          setShowDemoSelector(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-all ${
                          currentUser?.id === u.id
                            ? 'bg-amber-500/15 text-amber-200 border border-amber-500/40'
                            : 'hover:bg-zinc-900 text-zinc-300 border border-transparent'
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-6 h-6 rounded-full object-cover border border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{u.fullName}</div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                            <span className="truncate">{u.rank}</span>
                            {u.rank === 'New Born' && u.simulatedDaysPassed && (
                              <span className="text-amber-400">
                                (Day {u.simulatedDaysPassed}/31)
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 flex justify-between items-center text-[10px] font-mono">
                    <button
                      onClick={() => {
                        resetAllData();
                        setShowDemoSelector(false);
                      }}
                      className="text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw size={10} />
                      Reset Data
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuthModal('signup');
                        setShowDemoSelector(false);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <UserPlus size={10} />
                      Create Character
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full max-w-full lg:max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-14 gap-2">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 min-w-0"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#080a10] rounded-[6px] flex items-center justify-center text-amber-400">
                <Crown size={16} className="text-amber-400 group-hover:rotate-6 transition-transform sm:w-[18px] sm:h-[18px]" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-cinzel text-sm sm:text-base font-bold tracking-wider text-amber-200 group-hover:text-amber-300 transition-colors">
                  SBB
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-mono px-1 sm:px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 shrink-0">
                  GTA VI RP
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono tracking-tight -mt-0.5 truncate hidden xs:block">
                "Successful Bad Boys"
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-200 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-amber-400' : 'text-zinc-400'} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 font-bold text-[9px] font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls Zone */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Actions Trigger Button: ONLY VISIBLE IF PERMITTED */}
            {canUseQuickActions && (
              <button
                id="navbar-quick-actions-btn"
                onClick={() => setIsQuickActionsOpen(true)}
                className="relative p-2 rounded-lg bg-[#0a0c14] hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all flex items-center justify-center group shadow-sm active:scale-95"
                title="High Command Quick Actions (O.G & Admin)"
                aria-label="High Command Quick Actions"
              >
                <Zap size={16} className="group-hover:rotate-12 transition-transform text-amber-400" />
                {pendingNoMenCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950 font-mono shadow">
                    {pendingNoMenCount}
                  </span>
                )}
              </button>
            )}

            {/* Notification Center Radar */}
            <NotificationCenter onNavigateTab={handleNavClick} />

            {/* User Profile Menu Button & Dropdown */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowMenuDropdown(false);
                    setShowDemoSelector(false);
                  }}
                  className="flex items-center gap-2 p-1 pr-2 bg-[#0a0c14] hover:bg-zinc-900 rounded-lg border border-zinc-700/80 transition-all group"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-md object-cover border border-amber-500/50"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-amber-200 transition-colors flex items-center gap-1">
                      <span className="truncate max-w-[90px]">{currentUser.fullName}</span>
                    </div>
                    <div className="text-[9px] text-zinc-400 truncate max-w-[90px] font-mono">
                      {currentUser.rank}
                    </div>
                  </div>
                  <ChevronDown size={13} className="text-zinc-400 group-hover:text-zinc-200" />
                </button>

                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/50 sm:bg-transparent"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="fixed left-2 right-2 top-14 sm:left-auto sm:right-0 sm:top-full sm:absolute sm:mt-2 sm:w-64 max-w-[calc(100vw-24px)] bg-[#0a0d14] border border-zinc-700/80 rounded-xl shadow-2xl p-3 z-50 divide-y divide-zinc-800 animate-fade-in">
                      <div className="pb-3">
                        <div className="text-xs font-bold text-zinc-100">{currentUser.fullName}</div>
                        <div className="text-[10px] text-amber-400/90 font-mono">
                          @{currentUser.gtaHandle}
                        </div>
                        <div className="mt-2">
                          <RankBadge rank={currentUser.rank} size="sm" showLevel />
                        </div>
                        {currentUser.specialTitles && currentUser.specialTitles.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {currentUser.specialTitles.map((t) => (
                              <SpecialTitleBadge key={t} title={t} size="sm" />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="py-2 space-y-1 text-xs">
                        <button
                          onClick={() => {
                            setSelectedProfileUser(currentUser);
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-zinc-900 text-zinc-300 flex items-center gap-2 transition-colors"
                        >
                          <Shield size={14} className="text-amber-400" />
                          View Full Dossier
                        </button>
                        <button
                          onClick={() => {
                            handleNavClick('dashboard');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-zinc-900 text-zinc-300 flex items-center gap-2 transition-colors"
                        >
                          <Crown size={14} className="text-amber-400" />
                          My Dashboard & Status
                        </button>
                      </div>

                      <div className="pt-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setShowDemoSelector(true);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-zinc-900 text-zinc-300 text-xs flex items-center gap-2 transition-colors font-mono"
                        >
                          <Sparkles size={14} className="text-amber-400" />
                          Switch Persona
                        </button>
                        <button
                          onClick={() => {
                            onOpenDenounceModal();
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-950/40 text-red-400 text-xs flex items-center gap-2 transition-colors font-mono"
                        >
                          <AlertTriangle size={14} className="text-red-400" />
                          Denounce Membership
                        </button>
                        <button
                          id="user-logout-btn"
                          onClick={() => {
                            logoutUser();
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-amber-300 hover:text-amber-200 text-xs flex items-center gap-2 transition-colors font-mono font-semibold"
                        >
                          <LogOut size={14} className="text-amber-400" />
                          Log Out of Portal
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <LogIn size={13} />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all shadow-md"
                >
                  <UserPlus size={13} />
                  <span>Join SBB</span>
                </button>
              </div>
            )}

            {/* Menu Dropdown Trigger Button in the same position */}
            <div className="relative" ref={menuRef}>
              <button
                id="main-nav-menu-btn"
                onClick={() => {
                  setShowMenuDropdown(!showMenuDropdown);
                  setShowUserDropdown(false);
                  setShowDemoSelector(false);
                }}
                className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                  showMenuDropdown
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                    : 'bg-[#0a0c14] hover:bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:text-amber-300'
                }`}
                aria-label="Toggle Syndicate Navigation Menu"
                title="Syndicate Navigation Menu"
              >
                {showMenuDropdown ? (
                  <X size={18} className="text-amber-400" />
                ) : (
                  <Menu size={18} />
                )}
              </button>

              {/* Seamless, High-Contrast Floating Dropdown Menu in the same position */}
              {showMenuDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
                    onClick={() => setShowMenuDropdown(false)}
                  />
                  <div
                    className="fixed left-2 right-2 top-14 sm:left-auto sm:right-0 sm:top-full sm:absolute sm:mt-2 sm:w-96 max-w-[calc(100vw-20px)] bg-[#090c13]/98 border border-zinc-700/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl p-3 z-50 space-y-3 divide-y divide-zinc-800/80 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header of the Dropdown */}
                    <div className="flex items-center justify-between pb-1 px-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <Crown size={14} />
                        </div>
                        <div>
                          <div className="font-cinzel text-xs font-bold text-zinc-100 uppercase tracking-wider">
                            Syndicate Navigation
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            SBB Royal Family Portal
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowMenuDropdown(false)}
                        className="w-6 h-6 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors text-xs"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    {/* Navigation Items List */}
                    <div className="pt-2 space-y-1.5 max-h-[65vh] overflow-y-auto pr-0.5">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            id={`dropdown-nav-btn-${item.id}`}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                              isActive
                                ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-md'
                                : item.highlight
                                ? 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-500/30 text-amber-200'
                                : 'bg-[#05070c] hover:bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`p-2 rounded-lg shrink-0 ${
                                  isActive
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : item.highlight
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                <Icon size={16} />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs flex items-center gap-1.5">
                                  <span>{item.label}</span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 font-bold text-[9px] font-mono">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-mono truncate">
                                  {item.subtitle}
                                </div>
                              </div>
                            </div>
                            <ChevronRight
                              size={14}
                              className={`shrink-0 ${
                                isActive ? 'text-amber-400' : 'text-zinc-600'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Action Button within Dropdown if authorized */}
                    {canUseQuickActions && (
                      <div className="pt-2.5">
                        <button
                          onClick={() => {
                            setIsQuickActionsOpen(true);
                            setShowMenuDropdown(false);
                          }}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                          <Zap size={15} />
                          <span>Launch High Command Quick Actions</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


