import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge, SpecialTitleBadge } from './RankBadge';
import {
  ALL_SPECIAL_TITLES,
  RANK_HIERARCHY,
  MafiaRank,
  SpecialTitle,
  RANK_LEVELS,
} from '../types';
import {
  X,
  Zap,
  CheckCircle2,
  Award,
  Crown,
  Shield,
  Sliders,
  Sparkles,
  Users,
  ChevronRight,
  ArrowUpRight,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const {
    currentUser,
    users,
    approveRecruit,
    makeJuniorBossM19,
    promoteUserRank,
    assignSpecialTitle,
    isHonchoOrGhost,
    canAccessAdmin,
    isAboveFounders,
    setSelectedProfileUser,
  } = useFamily();

  const [activeTab, setActiveTab] = useState<'approvals' | 'm19' | 'titles' | 'ranks'>('approvals');
  const [selectedUserForTitle, setSelectedUserForTitle] = useState<string>('');
  const [selectedTitle, setSelectedTitle] = useState<SpecialTitle>('Problem Man / P-Man');
  const [selectedUserForRank, setSelectedUserForRank] = useState<string>('');
  const [selectedRank, setSelectedRank] = useState<MafiaRank>('Boss');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const viewerLevel = RANK_LEVELS[currentUser?.rank || 'No Man'] || 1;
  const isOGOrHigher = viewerLevel >= 6;
  const canAdmin = canAccessAdmin(currentUser);
  const hasPermission = Boolean(currentUser && (isOGOrHigher || canAdmin));

  if (!hasPermission) {
    return (
      <div
        className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-[#090c13] border border-red-900/60 rounded-2xl p-6 text-center max-w-md shadow-2xl space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
            <Zap size={22} />
          </div>
          <h3 className="font-cinzel text-base font-bold text-zinc-100">Access Restricted</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            High Command Quick Actions are strictly authorized for O.G and High Table officers (O.G, Lord, Ghost, Don, Honcho).
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const pendingRecruits = users.filter((u) => u.rank === 'No Man');
  const eligibleM19s = users.filter(
    (u) => u.rank === 'New Born' && (u.simulatedDaysPassed || 1) >= 31
  );

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleApprove = (userId: string) => {
    const res = approveRecruit(userId);
    showNotice(res.message);
  };

  const handleM19 = (userId: string) => {
    const res = makeJuniorBossM19(userId);
    showNotice(res.message);
  };

  const handleAssignTitle = () => {
    if (!selectedUserForTitle) return;
    const target = users.find((u) => u.id === selectedUserForTitle);
    const hasTitle = target?.specialTitles?.includes(selectedTitle);
    const res = assignSpecialTitle(selectedUserForTitle, selectedTitle, !hasTitle);
    showNotice(res.message);
  };

  const handlePromoteRank = () => {
    if (!selectedUserForRank) return;
    const res = promoteUserRank(selectedUserForRank, selectedRank);
    showNotice(res.message);
  };

  const isExecutive = isHonchoOrGhost(currentUser);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-2.5 sm:p-4 pt-4 sm:pt-6 pb-16 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-[#090c13] border border-amber-500/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 relative my-2 sm:my-auto text-zinc-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors text-xs"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
          <div className="p-2 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-xl text-zinc-950 font-bold shadow-md">
            <Zap size={18} />
          </div>
          <div>
            <h2 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200 flex items-center gap-2">
              High Command Quick Actions
            </h2>
            <p className="text-[11px] text-zinc-400 font-mono">
              Fast-lane executive controls for O.G, Don, Ghost, and Honcho leadership.
            </p>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="p-2.5 bg-amber-950/60 border border-amber-500/50 rounded-lg text-xs font-mono text-amber-200 flex items-center justify-between">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-zinc-400 text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Quick Nav Tabs */}
        <div className="flex items-center gap-1.5 border-b border-zinc-800/80 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'approvals'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-zinc-200 bg-[#050505] border border-zinc-800'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Approve Recruits ({pendingRecruits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('m19')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'm19'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-zinc-200 bg-[#050505] border border-zinc-800'
            }`}
          >
            <Award size={13} />
            <span>M19 Ceremonies ({eligibleM19s.length})</span>
          </button>

          {isExecutive && (
            <button
              onClick={() => setActiveTab('titles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'titles'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 bg-[#050505] border border-zinc-800'
              }`}
            >
              <Crown size={13} />
              <span>Assign Special Title</span>
            </button>
          )}

          {isExecutive && (
            <button
              onClick={() => setActiveTab('ranks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'ranks'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 bg-[#050505] border border-zinc-800'
              }`}
            >
              <Shield size={13} />
              <span>Promote / Rank Up</span>
            </button>
          )}
        </div>

        {/* Tab 1: Approve Recruits */}
        {activeTab === 'approvals' && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-300 font-mono">
              Pending No Men awaiting confirmation to become New Borns (you will serve as their Third Eye):
            </div>

            {pendingRecruits.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs italic bg-[#05070c] rounded-xl border border-zinc-800 font-mono">
                No pending No Men at The Gate right now.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {pendingRecruits.map((recruit) => (
                  <div
                    key={recruit.id}
                    className="p-3 bg-[#05070c] border border-zinc-800 rounded-xl flex items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
                  >
                    <div
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                      onClick={() => {
                        setSelectedProfileUser(recruit);
                        onClose();
                      }}
                    >
                      <img
                        src={recruit.avatarUrl}
                        alt={recruit.fullName}
                        className="w-9 h-9 rounded-lg object-cover border border-zinc-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-200 truncate hover:text-amber-300">
                          {recruit.fullName}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          @{recruit.gtaHandle} • Discord: {recruit.discordTag}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApprove(recruit.id)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg font-mono flex items-center gap-1 shrink-0 shadow"
                    >
                      <CheckCircle2 size={13} />
                      Approve (New Born)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: M19 Ceremonies */}
        {activeTab === 'm19' && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-300 font-mono">
              New Borns who have completed Day 31 of initiation and are eligible for the M19 Ceremony:
            </div>

            {eligibleM19s.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs italic bg-[#05070c] rounded-xl border border-zinc-800 font-mono">
                No New Borns currently at Day 31 threshold.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {eligibleM19s.map((recruit) => (
                  <div
                    key={recruit.id}
                    className="p-3 bg-[#05070c] border border-amber-500/40 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                      onClick={() => {
                        setSelectedProfileUser(recruit);
                        onClose();
                      }}
                    >
                      <img
                        src={recruit.avatarUrl}
                        alt={recruit.fullName}
                        className="w-9 h-9 rounded-lg object-cover border border-amber-500/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-amber-200 truncate">
                          {recruit.fullName}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Day 31/31 • Sponsor: {recruit.approvedByName || 'O.G'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleM19(recruit.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs rounded-lg font-mono flex items-center gap-1.5 shrink-0 shadow animate-pulse"
                    >
                      <Award size={13} />
                      Officiate M19 (Make 31-JB)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Assign Special Title */}
        {activeTab === 'titles' && isExecutive && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-300 font-mono">
              Grant or revoke special Family prestige titles:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Target Member</label>
                <select
                  value={selectedUserForTitle}
                  onChange={(e) => setSelectedUserForTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#05070c] border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select a member...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.rank})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Special Title</label>
                <select
                  value={selectedTitle}
                  onChange={(e) => setSelectedTitle(e.target.value as SpecialTitle)}
                  className="w-full px-2.5 py-1.5 bg-[#05070c] border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {ALL_SPECIAL_TITLES.map((title) => (
                    <option key={title} value={title}>
                      ★ {title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAssignTitle}
                disabled={!selectedUserForTitle}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs font-mono rounded-lg flex items-center gap-1.5 shadow"
              >
                <Crown size={13} />
                Toggle Special Title
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Promote / Rank Up */}
        {activeTab === 'ranks' && isExecutive && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-300 font-mono">
              Adjust formal rank standing across the 10 ranks of SBB:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Target Member</label>
                <select
                  value={selectedUserForRank}
                  onChange={(e) => setSelectedUserForRank(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#05070c] border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select a member...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} (Current: {u.rank})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">New Rank Standing</label>
                <select
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value as MafiaRank)}
                  className="w-full px-2.5 py-1.5 bg-[#05070c] border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {RANK_HIERARCHY.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handlePromoteRank}
                disabled={!selectedUserForRank}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-zinc-950 font-bold text-xs font-mono rounded-lg flex items-center gap-1.5 shadow"
              >
                <Shield size={13} />
                Update Rank Standing
              </button>
            </div>
          </div>
        )}

        {/* Fast Navigation Shortcuts */}
        <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-zinc-500">Quick Portal Routing:</span>
          <div className="flex items-center gap-2">
            {canAdmin && onNavigateToTab && (
              <button
                onClick={() => {
                  onNavigateToTab('admin');
                  onClose();
                }}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded flex items-center gap-1"
              >
                <Sliders size={11} />
                <span>Admin Console</span>
              </button>
            )}
            {onNavigateToTab && (
              <button
                onClick={() => {
                  onNavigateToTab('councils');
                  onClose();
                }}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center gap-1"
              >
                <MapPin size={11} />
                <span>Councils</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
