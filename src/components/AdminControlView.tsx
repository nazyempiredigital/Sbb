import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge, SpecialTitleBadge, CouncilBadge } from './RankBadge';
import { SuccessionGovernanceView } from './SuccessionGovernanceView';
import { YearlyPromotionsView } from './YearlyPromotionsView';
import { ALL_SPECIAL_TITLES, SpecialTitle, RANK_LEVELS, MafiaRank } from '../types';
import {
  Sliders,
  Award,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  Sparkles,
  PlusCircle,
  Megaphone,
  Users,
  Swords,
  Clock,
  Send,
  UserCheck,
  Building2,
  Trash2,
  Ban,
  RotateCcw,
  Vote,
  TrendingUp,
} from 'lucide-react';

export const AdminControlView: React.FC = () => {
  const {
    currentUser,
    users,
    councils,
    assignSpecialTitle,
    approveRecruit,
    makeJuniorBossM19,
    advanceNewBornDays,
    promoteUserRank,
    createAnnouncement,
    createRegion,
    createDomaine,
    appointCustodian,
    removeCustodian,
    concludeTenureAndElectNextLeader,
    amRequests,
    sendAmA13Request,
    cancelAmA13Assignment,
    setSelectedProfileUser,
    canAccessAdmin,
    yearlyPromotionCandidates,
  } = useFamily();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'SUCCESSION' | 'YEARLY_PROMOTIONS' | 'TITLES' | 'TERRITORIES' | 'AM_A13' | 'RECRUITS' | 'ANNOUNCEMENTS'
  >('SUCCESSION');

  // Title assignment state
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [selectedTitle, setSelectedTitle] = useState<SpecialTitle>('Ash-Lord');

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'CRITICAL' | 'IMPORTANT' | 'GENERAL'>('IMPORTANT');

  // AM request state in Admin
  const [selectedAmMentorId, setSelectedAmMentorId] = useState<string>(
    users.find((u) => (RANK_LEVELS[u.rank] || 1) >= 4)?.id || ''
  );
  const [selectedAmTargetId, setSelectedAmTargetId] = useState<string>('');

  // Quick territory state
  const [quickRegionName, setQuickRegionName] = useState('');
  const [quickDomaineName, setQuickDomaineName] = useState('');
  const [quickParentRegion, setQuickParentRegion] = useState('');

  // Toast feedback
  const [feedback, setFeedback] = useState<{ msg: string; success: boolean } | null>(null);

  const isHonchoOrGhost =
    currentUser?.rank === 'Honcho (King)' ||
    currentUser?.rank === 'Ghost (007)' ||
    currentUser?.rank === 'Ghost' ||
    currentUser?.isAdmin;

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  if (!canAccessAdmin(currentUser)) {
    return (
      <div className="rounded-2xl bg-[#090c13] border border-red-900/40 p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
          <Shield size={28} />
        </div>
        <h2 className="font-cinzel text-xl font-bold text-zinc-100">Access Restricted</h2>
        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
          The Admin Council is strictly reserved for High Table leadership: <span className="text-amber-400 font-bold">Honcho (King)</span>, <span className="text-amber-400 font-bold">Don</span>, and <span className="text-cyan-400 font-bold">Ghost (007)</span>.
        </p>
      </div>
    );
  }

  const handleGrantTitle = (add: boolean) => {
    if (!selectedUser) return;
    const res = assignSpecialTitle(selectedUser.id, selectedTitle, add);
    setFeedback({ msg: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    createAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      priority: annPriority,
    });

    setAnnTitle('');
    setAnnContent('');
    setFeedback({ msg: 'Official Decree published to the Syndicate Noticeboard!', success: true });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleQuickCreateRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRegionName.trim()) return;
    const res = createRegion(quickRegionName.trim());
    setQuickRegionName('');
    setFeedback({ msg: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleQuickCreateDomaine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDomaineName.trim() || !quickParentRegion.trim()) return;
    const res = createDomaine(quickDomaineName.trim(), quickParentRegion.trim());
    setQuickDomaineName('');
    setFeedback({ msg: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const grandRegions = councils.filter((c) => c.type === 'REGION');
  const availableJuniorBosses = users.filter((u) => u.rank === 'Junior Boss (31-JB)' && !u.isBanned);
  const unconfirmedRecruits = users.filter((u) => u.rank === 'No Man');
  const newBornsInCrucible = users.filter((u) => u.rank === 'New Born');

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono font-medium flex items-center justify-between shadow-xl animate-fade-in ${
            feedback.success
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200'
              : 'bg-red-950/90 border-red-500/80 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.success ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={16} className="text-red-400 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-75 hover:opacity-100 ml-2 px-1.5 py-0.5">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 overflow-hidden min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Sliders size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-cinzel text-lg sm:text-xl md:text-2xl font-bold text-zinc-100 leading-snug break-words">
                High Table Administrative Directorate
              </h1>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-mono leading-relaxed">
                Executive sovereign powers: Titles, territorial governance, AM/A13 network, recruitment, and decrees.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono bg-[#05070c] px-3 py-1.5 sm:py-2 rounded-xl border border-zinc-800 text-amber-300 shrink-0 self-start md:self-auto">
          <Crown size={14} className="text-amber-400 shrink-0" />
          <span>Operator: {currentUser?.rank || 'Executive'}</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar scroll-smooth w-full min-w-0 py-0.5">
        <button
          onClick={() => setActiveAdminTab('SUCCESSION')}
          className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeAdminTab === 'SUCCESSION'
              ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Crown size={14} className="text-amber-400 shrink-0" />
          <span>Succession & Voting</span>
        </button>

        {isHonchoOrGhost && (
          <button
            onClick={() => setActiveAdminTab('YEARLY_PROMOTIONS')}
            className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'YEARLY_PROMOTIONS'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <TrendingUp size={14} className="text-emerald-400 shrink-0" />
            <span>Annual 1-Yr Step-Ups ({yearlyPromotionCandidates.filter((c) => c.isEligible).length})</span>
          </button>
        )}

        {isHonchoOrGhost && (
          <button
            onClick={() => setActiveAdminTab('TITLES')}
            className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'TITLES'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Award size={14} className="text-amber-400 shrink-0" />
            <span>Special Titles</span>
          </button>
        )}

        <button
          onClick={() => setActiveAdminTab('TERRITORIES')}
          className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeAdminTab === 'TERRITORIES'
              ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Building2 size={14} className="text-indigo-400 shrink-0" />
          <span>Territories ({councils.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('AM_A13')}
          className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeAdminTab === 'AM_A13'
              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Sparkles size={14} className="text-purple-400 shrink-0" />
          <span>AM / A13 Network</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('RECRUITS')}
          className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeAdminTab === 'RECRUITS'
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <UserCheck size={14} className="text-emerald-400 shrink-0" />
          <span>Recruits & M19 ({unconfirmedRecruits.length + newBornsInCrucible.length})</span>
        </button>

        {isHonchoOrGhost && (
          <button
            onClick={() => setActiveAdminTab('ANNOUNCEMENTS')}
            className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'ANNOUNCEMENTS'
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Megaphone size={14} className="text-rose-400 shrink-0" />
            <span>Decrees</span>
          </button>
        )}
      </div>

      {/* 0. HIGH TABLE SOVEREIGN SUCCESSION & VOTING SUITE */}
      {activeAdminTab === 'SUCCESSION' && <SuccessionGovernanceView />}

      {/* 0.1 ANNUAL 1-YEAR STEP-UP SUITE */}
      {isHonchoOrGhost && activeAdminTab === 'YEARLY_PROMOTIONS' && <YearlyPromotionsView />}

      {/* 1. SPECIAL TITLES SUITE */}
      {isHonchoOrGhost && activeAdminTab === 'TITLES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Award size={18} className="text-amber-400" />
              <div>
                <h3 className="font-cinzel text-base font-bold text-zinc-100">
                  Bestow Honorary Special Titles
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Grant or revoke honorary syndicate titles.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Select Target Member</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.rank}) - @{u.gtaHandle}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <div className="p-3 bg-[#05070c] rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.fullName}
                      className="w-10 h-10 rounded-lg object-cover border border-zinc-700"
                    />
                    <div>
                      <div className="font-bold text-zinc-200 text-xs">{selectedUser.fullName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Rank: <strong className="text-amber-300">{selectedUser.rank}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProfileUser(selectedUser)}
                    className="text-[11px] text-amber-400 hover:underline font-mono"
                  >
                    View Dossier
                  </button>
                </div>
              )}

              {/* Current Titles on User */}
              <div>
                <div className="text-[10px] text-zinc-400 mb-1.5 font-mono">Current Assigned Titles:</div>
                {selectedUser?.specialTitles && selectedUser.specialTitles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.specialTitles.map((t) => (
                      <div key={t} className="flex items-center gap-1">
                        <SpecialTitleBadge title={t} size="sm" />
                        <button
                          onClick={() => {
                            setSelectedTitle(t as SpecialTitle);
                            assignSpecialTitle(selectedUser.id, t as SpecialTitle, false);
                          }}
                          className="text-[10px] text-red-400 hover:text-red-200 px-1 bg-red-950/60 rounded border border-red-500/30"
                          title="Revoke Title"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-500 italic text-[11px]">No special titles currently assigned.</div>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Select Special Title</label>
                <select
                  value={selectedTitle}
                  onChange={(e) => setSelectedTitle(e.target.value as SpecialTitle)}
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                >
                  {ALL_SPECIAL_TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t} {t === 'Custodian' ? '⚠️ (Strictly for 31-JBs)' : ''}
                    </option>
                  ))}
                </select>

                {selectedTitle === 'Custodian' && (
                  <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1 font-mono">
                    <AlertTriangle size={12} className="shrink-0" />
                    Rule: Custodians must strictly hold the rank of Junior Boss (31-JB).
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleGrantTitle(true)}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <Crown size={14} />
                  <span>Grant Title Badge</span>
                </button>
                <button
                  onClick={() => handleGrantTitle(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-red-950/70 text-zinc-300 hover:text-red-300 rounded-xl border border-zinc-700 transition-all"
                >
                  Revoke Title
                </button>
              </div>
            </div>
          </div>

          {/* Special Titles Reference Guide */}
          <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-5 shadow-xl space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Shield size={18} className="text-amber-400" />
              <h3 className="font-cinzel text-base font-bold text-zinc-100">
                Titles Codex & Succession Doctrine
              </h3>
            </div>

            <div className="space-y-2.5 text-[11px] text-zinc-300">
              <div className="p-2.5 bg-[#05070c] rounded-lg border border-amber-500/20">
                <strong className="text-amber-300">Caesar:</strong> Conferred permanently upon a former Supreme Lord after concluding their 1-year tenure.
              </div>
              <div className="p-2.5 bg-[#05070c] rounded-lg border border-purple-500/20">
                <strong className="text-purple-300">Ash Lord:</strong> Conferred permanently upon the 11 Regional Council Elders after concluding their 1-year tenure.
              </div>
              <div className="p-2.5 bg-[#05070c] rounded-lg border border-teal-500/20">
                <strong className="text-teal-300">Custodian:</strong> Guardian assigned strictly from Junior Boss (31-JB) rank. Automatically vacated if promoted.
              </div>
              <div className="p-2.5 bg-[#05070c] rounded-lg border border-indigo-500/20">
                <strong className="text-indigo-300">Domaine Succession:</strong> Former High Chief & 8 Domaine Council Elders are automatically upgraded to Lord rank upon term conclusion.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TERRITORIAL DIRECTORATE */}
      {activeAdminTab === 'TERRITORIES' && (
        <div className="space-y-4">
          {isHonchoOrGhost && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Establish Region */}
              <div className="rounded-2xl bg-[#090c13] border border-amber-500/30 p-5 space-y-3 font-mono text-xs shadow-xl">
                <div className="flex items-center gap-2 font-cinzel font-bold text-amber-300 text-sm">
                  <Crown size={16} className="text-amber-400" />
                  <span>Establish Sovereign Region (12 Lords)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Auto-assigns up to 12 available Lords without a region. Eldest by registration automatically becomes Supreme Lord.
                </p>
                <form onSubmit={handleQuickCreateRegion} className="space-y-2.5">
                  <input
                    type="text"
                    value={quickRegionName}
                    onChange={(e) => setQuickRegionName(e.target.value)}
                    placeholder="e.g. Vice City Greater Sovereign Region"
                    required
                    className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg shadow"
                  >
                    Establish Grand Region
                  </button>
                </form>
              </div>

              {/* Quick Establish Domaine */}
              <div className="rounded-2xl bg-[#090c13] border border-indigo-500/30 p-5 space-y-3 font-mono text-xs shadow-xl">
                <div className="flex items-center gap-2 font-cinzel font-bold text-indigo-300 text-sm">
                  <Swords size={16} className="text-indigo-400" />
                  <span>Establish District Domaine (9 O.Gs)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Auto-assigns up to 9 available O.Gs without a domaine. Eldest by registration automatically becomes High Chief.
                </p>
                <form onSubmit={handleQuickCreateDomaine} className="space-y-2.5">
                  <input
                    type="text"
                    value={quickDomaineName}
                    onChange={(e) => setQuickDomaineName(e.target.value)}
                    placeholder="e.g. Starfish Island Luxury Domaine"
                    required
                    className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={quickParentRegion}
                    onChange={(e) => setQuickParentRegion(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Parent Region...</option>
                    {grandRegions.map((r) => (
                      <option key={r.id} value={r.name}>
                        👑 {r.name}
                      </option>
                    ))}
                    <option value="Vice City Sovereign Region">Vice City Sovereign Region</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg shadow"
                  >
                    Establish District Domaine
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Territory List & Fast Tenure Management */}
          <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-5 space-y-3">
            <h3 className="font-cinzel text-sm font-bold text-zinc-100">
              Active Sovereign Territories ({councils.length})
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {councils.map((c) => {
                const isRegion = c.type === 'REGION';
                const elderCount = c.elderUserIds?.length || 0;
                const maxElders = isRegion ? 12 : 9;

                return (
                  <div
                    key={c.id}
                    className="p-3 bg-[#05070c] rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {isRegion ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            REGION
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                            DOMAINE
                          </span>
                        )}
                        <span className="font-bold text-zinc-200">{c.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Leader: <strong className="text-zinc-200">{c.leaderName || 'Unassigned'}</strong> ({c.leaderTitle}) • Elders: {elderCount}/{maxElders}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const res = concludeTenureAndElectNextLeader(c.id);
                          setFeedback({ msg: res.message, success: res.success });
                          setTimeout(() => setFeedback(null), 5000);
                        }}
                        className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-zinc-950 font-bold rounded-lg"
                      >
                        Conclude 1-Year Tenure
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. AM / A13 NETWORK DIRECTORATE */}
      {activeAdminTab === 'AM_A13' && (
        <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              <h3 className="font-cinzel text-base font-bold text-zinc-100">
                AM / A13 Syndicate Network Directorate
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Active Pairings */}
            <div className="space-y-2">
              <h4 className="font-bold text-zinc-300">Active Pairings ({users.filter((u) => u.amAssignments?.length).length})</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {users.flatMap((mentor) =>
                  (mentor.amAssignments || []).map((a) => (
                    <div
                      key={a.targetUserId}
                      className="p-2.5 bg-[#05070c] border border-zinc-800 rounded-lg flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-zinc-200 font-bold">
                          {mentor.fullName} ({mentor.rank}) → {a.targetName} ({a.targetRank})
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Since {new Date(a.assignedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const res = cancelAmA13Assignment(a.targetUserId);
                          setFeedback({ msg: res.message, success: res.success });
                          setTimeout(() => setFeedback(null), 4000);
                        }}
                        className="px-2 py-0.5 bg-red-950 text-red-300 rounded border border-red-500/30 text-[10px]"
                      >
                        Dissolve
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Requests */}
            <div className="space-y-2">
              <h4 className="font-bold text-zinc-300">Pending Requests ({amRequests.filter((r) => r.status === 'PENDING').length})</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {amRequests.filter((r) => r.status === 'PENDING').map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 bg-[#05070c] border border-purple-500/30 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-zinc-200 font-bold">
                        {r.requesterName} → {r.targetName}
                      </div>
                      <div className="text-[10px] text-purple-300">
                        Pending Invitation ({new Date(r.createdAt).toLocaleDateString()})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RECRUITS & M19 INDUCTION OVERSEER */}
      {activeAdminTab === 'RECRUITS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
          {/* Unconfirmed No Man Recruits */}
          <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <UserCheck size={16} className="text-amber-400" />
              <h3 className="font-cinzel font-bold text-zinc-100">
                Gate Recruits (No Man) ({unconfirmedRecruits.length})
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400">
              Confirm recruits to begin their 31-day trial as New Born under your Third Eye watch.
            </p>

            {unconfirmedRecruits.length === 0 ? (
              <div className="text-zinc-500 italic">No unconfirmed recruits at the gate.</div>
            ) : (
              <div className="space-y-2">
                {unconfirmedRecruits.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 bg-[#05070c] border border-zinc-800 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-zinc-200">{rec.fullName}</div>
                      <div className="text-[10px] text-zinc-500">@{rec.gtaHandle}</div>
                    </div>
                    <button
                      onClick={() => {
                        const res = approveRecruit(rec.id);
                        setFeedback({ msg: res.message, success: res.success });
                        setTimeout(() => setFeedback(null), 4000);
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg"
                    >
                      Approve as New Born
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Born 31-Day Crucible */}
          <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Flame size={16} className="text-orange-400" />
              <h3 className="font-cinzel font-bold text-zinc-100">
                New Born 31-Day Crucible ({newBornsInCrucible.length})
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400">
              Simulate elapsed days or officiate M19 ceremonies on Day 31.
            </p>

            {newBornsInCrucible.length === 0 ? (
              <div className="text-zinc-500 italic">No New Borns currently in the crucible.</div>
            ) : (
              <div className="space-y-2">
                {newBornsInCrucible.map((nb) => {
                  const days = nb.simulatedDaysPassed || 1;
                  const isReady = days >= 31;

                  return (
                    <div
                      key={nb.id}
                      className="p-2.5 bg-[#05070c] border border-zinc-800 rounded-lg flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-zinc-200">{nb.fullName}</div>
                          <div className="text-[10px] text-amber-300">
                            Day {days} / 31 {isReady ? '🔥 (Ready for M19 Ceremony!)' : ''}
                          </div>
                        </div>

                        {isReady ? (
                          <button
                            onClick={() => {
                              const res = makeJuniorBossM19(nb.id);
                              setFeedback({ msg: res.message, success: res.success });
                              setTimeout(() => setFeedback(null), 4000);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg animate-pulse"
                          >
                            Officiate M19
                          </button>
                        ) : (
                          <button
                            onClick={() => advanceNewBornDays(nb.id, 31)}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded text-[10px]"
                          >
                            Fast Forward to Day 31
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. DECREE FAMILY ANNOUNCEMENTS */}
      {isHonchoOrGhost && activeAdminTab === 'ANNOUNCEMENTS' && (
        <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-5 shadow-xl space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Megaphone size={18} className="text-amber-400" />
            <div>
              <h3 className="font-cinzel text-base font-bold text-zinc-100">
                Decree Official Family Announcement
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Broadcast priority directives to the Syndicate dashboard bulletin.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Decree Headline</label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. M19 INDUCTION CEREMONY HOSTED ON 31ST DAY"
                required
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">Priority Alert Level</label>
              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL (Red Crimson Alert)</option>
                <option value="IMPORTANT">IMPORTANT (Amber Gold Alert)</option>
                <option value="GENERAL">GENERAL (Standard Bulletin)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">Decree Content</label>
              <textarea
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                rows={4}
                placeholder="Write the full sovereign announcement for the Family..."
                required
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Publish Decree</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
