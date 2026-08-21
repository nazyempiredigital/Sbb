import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge, SpecialTitleBadge } from './RankBadge';
import { User, SpecialTitle } from '../types';
import {
  Crown,
  Skull,
  Award,
  Vote,
  UserPlus,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  Users,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Zap,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';

export const SuccessionGovernanceView: React.FC = () => {
  const {
    currentUser,
    users,
    pontusRecords,
    highPriestRecords,
    ghostElectionState,
    donAppointmentState,
    triggerHonchoStepDown,
    triggerGhostStepDown,
    castGhostVote,
    finalizeGhostElection,
    appointLordAsDon,
    batchAppointLordsForRole,
    batchAppointLordsAsDons,
    batchAppointAll12Dons,
    resetSuccessionWorkflow,
    setSelectedProfileUser,
  } = useFamily();

  // Active High Table leaders
  const currentHoncho = useMemo(() => users.find((u) => u.rank === 'Honcho (King)'), [users]);
  const currentGhost = useMemo(() => users.find((u) => u.rank === 'Ghost (007)'), [users]);
  const activeDons = useMemo(() => users.filter((u) => u.rank === 'Don'), [users]);
  const activeBarons = useMemo(() => users.filter((u) => u.rank === 'BARON' || u.specialTitles?.includes('Baron')), [users]);

  // Lords eligible for Don appointment
  const allLords = useMemo(() => users.filter((u) => u.rank === 'Lord'), [users]);

  // Lords sorted with Caesar & Ash-Lord priority, then joined date
  const priorityLords = useMemo(() => {
    return [...allLords].sort((a, b) => {
      const aHasSpecial = a.specialTitles?.some((t) => t === 'Caesar' || t === 'Ash-Lord') ? 1 : 0;
      const bHasSpecial = b.specialTitles?.some((t) => t === 'Caesar' || t === 'Ash-Lord') ? 1 : 0;
      if (aHasSpecial !== bHasSpecial) return bHasSpecial - aHasSpecial;
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });
  }, [allLords]);

  const isDon = currentUser?.rank === 'Don' || currentUser?.isAdmin;
  const isHoncho = currentUser?.rank === 'Honcho (King)' || currentUser?.isAdmin;
  const isGhost = currentUser?.rank === 'Ghost (007)' || currentUser?.rank === 'Ghost' || currentUser?.isAdmin;
  const isHonchoOrGhost = isHoncho || isGhost;

  // Honcho step-down permissions: Honcho can step himself down, Honcho can step Ghost down
  const canStepHonchoDown = isHoncho;
  // Ghost step-down permissions: Ghost can step himself down, Honcho can step both himself and Ghost down
  const canStepGhostDown = isHoncho || isGhost;

  const [selectedLordIdsForDon, setSelectedLordIdsForDon] = useState<string[]>([]);
  const [selectedDonVoterId, setSelectedDonVoterId] = useState<string>(
    currentUser?.rank === 'Don' ? currentUser.id : activeDons[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<{ msg: string; success: boolean } | null>(null);

  // Compute Don appointment quotas
  const honchoAppointedList = useMemo(() => donAppointmentState.honchoAppointedLordIds || [], [donAppointmentState.honchoAppointedLordIds]);
  const ghostAppointedList = useMemo(() => donAppointmentState.ghostAppointedLordIds || [], [donAppointmentState.ghostAppointedLordIds]);
  const honchoCount = honchoAppointedList.length;
  const ghostCount = ghostAppointedList.length;
  const honchoRemaining = Math.max(0, 6 - honchoCount);
  const ghostRemaining = Math.max(0, 6 - ghostCount);
  const totalDonsAppointed = honchoCount + ghostCount;
  const isAll12Complete = totalDonsAppointed >= 12;

  // Compute vote counts for active Dons in current election
  const voteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeDons.forEach((d) => {
      counts[d.id] = 0;
    });
    Object.values(ghostElectionState.votes || {}).forEach((candidateId) => {
      const cId = String(candidateId);
      if (counts[cId] !== undefined) {
        counts[cId] += 1;
      }
    });
    return counts;
  }, [activeDons, ghostElectionState.votes]);

  const totalVotesCast = useMemo(() => {
    return Object.keys(ghostElectionState.votes || {}).length;
  }, [ghostElectionState.votes]);

  // Leading candidate
  const leadingCandidate = useMemo(() => {
    if (activeDons.length === 0) return null;
    let max = -1;
    let winner = activeDons[0];
    activeDons.forEach((d) => {
      const c = voteCounts[d.id] || 0;
      if (c > max) {
        max = c;
        winner = d;
      }
    });
    return { don: winner, votes: max };
  }, [activeDons, voteCounts]);

  const handleHonchoStepDown = () => {
    const res = triggerHonchoStepDown();
    setFeedback({ msg: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleGhostStepDown = () => {
    const res = triggerGhostStepDown();
    setFeedback({ msg: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleCastVote = (candidateDonId: string) => {
    const voterId = currentUser?.rank === 'Don' ? currentUser.id : selectedDonVoterId;
    if (!voterId) {
      setFeedback({ msg: 'Please select an active Don voter to cast ballot.', success: false });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }
    const res = castGhostVote(voterId, candidateDonId);
    setFeedback({ msg: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleFinalizeElection = () => {
    const res = finalizeGhostElection();
    setFeedback({ msg: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Toggle selection with strict MAX 6 limit
  const handleToggleLordSelection = (lordId: string) => {
    setSelectedLordIdsForDon((prev) => {
      if (prev.includes(lordId)) {
        return prev.filter((id) => id !== lordId);
      }
      if (prev.length >= 6) {
        setFeedback({
          msg: 'Maximum quota is 6 Lords per appointment selection (Honcho max 6, Ghost max 6).',
          success: false,
        });
        setTimeout(() => setFeedback(null), 3500);
        return prev;
      }
      return [...prev, lordId];
    });
  };

  // Quick Select up to 6 for Honcho
  const handleSelectTop6ForHoncho = () => {
    const unselectedLords = priorityLords.filter(
      (l) => !honchoAppointedList.includes(l.id) && !ghostAppointedList.includes(l.id)
    );
    const top6 = unselectedLords.slice(0, Math.min(6, honchoRemaining || 6)).map((l) => l.id);
    setSelectedLordIdsForDon(top6);
    setFeedback({
      msg: `Selected top ${top6.length} priority Lords for Honcho appointment (Quota remaining: ${honchoRemaining}/6).`,
      success: true,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Quick Select up to 6 for Ghost
  const handleSelectTop6ForGhost = () => {
    const unselectedLords = priorityLords.filter(
      (l) => !honchoAppointedList.includes(l.id) && !ghostAppointedList.includes(l.id)
    );
    const top6 = unselectedLords.slice(0, Math.min(6, ghostRemaining || 6)).map((l) => l.id);
    setSelectedLordIdsForDon(top6);
    setFeedback({
      msg: `Selected top ${top6.length} priority Lords for Ghost appointment (Quota remaining: ${ghostRemaining}/6).`,
      success: true,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleClearSelection = () => {
    setSelectedLordIdsForDon([]);
  };

  // Batch Appoint Selected Lords for a Specific Role (Honcho or Ghost)
  const handleAppointForRole = (role: 'HONCHO' | 'GHOST') => {
    if (selectedLordIdsForDon.length === 0) {
      setFeedback({ msg: 'Please select between 1 and 6 Lords from the list first.', success: false });
      setTimeout(() => setFeedback(null), 3500);
      return;
    }
    const res = batchAppointLordsForRole(selectedLordIdsForDon, role);
    setFeedback({ msg: res.message, success: res.success });
    if (res.success) {
      setSelectedLordIdsForDon([]);
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  // Single Lord Appoint
  const handleSingleAppoint = (lordId: string, role: 'HONCHO' | 'GHOST') => {
    const res = appointLordAsDon(lordId, role);
    setFeedback({ msg: res.message, success: res.success });
    if (res.success) {
      setSelectedLordIdsForDon((prev) => prev.filter((id) => id !== lordId));
    }
    setTimeout(() => setFeedback(null), 4000);
  };

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
          <div className="flex items-center gap-2 min-w-0">
            {feedback.success ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
            )}
            <span className="break-words">{feedback.msg}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 ml-2 px-1.5 py-0.5 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* High Table Core Rules Directive Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d0f17] via-[#090c13] to-[#0d0f17] border border-amber-500/30 p-4 sm:p-5 shadow-2xl space-y-3 overflow-hidden min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Crown size={20} className="sm:w-[24px] sm:h-[24px]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-cinzel text-base sm:text-lg md:text-xl font-bold text-zinc-100 leading-snug break-words">
                High Table Sovereign Succession Directorate
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-mono leading-relaxed">
                Mandate: Max 1 Honcho (King) • Max 1 Ghost (007) • Max 12 Active Dons
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={resetSuccessionWorkflow}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center gap-1.5 transition-colors"
              title="Reset Election & Appointment Cycles"
            >
              <RefreshCw size={12} />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Doctrine summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 pt-2 text-[11px] font-mono min-w-0">
          <div className="p-3 bg-[#05070c] rounded-xl border border-amber-500/20 space-y-1 min-w-0 overflow-hidden">
            <div className="text-amber-300 font-bold flex items-center gap-1.5">
              <Crown size={14} className="shrink-0" />
              <span>1. Honcho 365-Day Tenure</span>
            </div>
            <p className="text-zinc-400 leading-relaxed break-words">
              After 365 days, Honcho steps down to become <strong className="text-amber-200">PONTUS (I, II...)</strong>. The active Ghost ascends to become the new Honcho (King).
            </p>
          </div>

          <div className="p-3 bg-[#05070c] rounded-xl border border-cyan-500/20 space-y-1 min-w-0 overflow-hidden">
            <div className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Vote size={14} className="shrink-0" />
              <span>2. 12-Don Ghost Election</span>
            </div>
            <p className="text-zinc-400 leading-relaxed break-words">
              Only the 12 active Dons hold the vote. The Don with the highest votes becomes <strong className="text-cyan-200">Ghost (007)</strong>. Other Dons ascend to <strong className="text-purple-300">BARON</strong>.
            </p>
          </div>

          <div className="p-3 bg-[#05070c] rounded-xl border border-emerald-500/20 space-y-1 min-w-0 overflow-hidden">
            <div className="text-emerald-300 font-bold flex items-center gap-1.5">
              <UserPlus size={14} className="shrink-0" />
              <span>3. 12 New Dons from Lords</span>
            </div>
            <p className="text-zinc-400 leading-relaxed break-words">
              New Honcho & Ghost appoint 12 new Dons from Lords, prioritizing those with <strong className="text-amber-200">Caesar</strong> or <strong className="text-purple-300">Ash-Lord</strong> titles by join date.
            </p>
          </div>
        </div>
      </div>

      {/* Seated High Table Executives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 min-w-0">
        {/* Honcho (King) Seat */}
        <div className="rounded-2xl bg-[#090c13] border border-amber-500/40 p-4 sm:p-5 shadow-xl space-y-3.5 sm:space-y-4 relative overflow-hidden min-w-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Crown size={18} className="text-amber-400 shrink-0" />
              <h3 className="font-cinzel text-xs sm:text-sm font-bold text-zinc-100 truncate">
                Seated Sovereign Honcho (King)
              </h3>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              1 Seat (Strict)
            </span>
          </div>

          {currentHoncho ? (
            <div className="space-y-3 sm:space-y-3.5">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <img
                  src={currentHoncho.avatarUrl}
                  alt={currentHoncho.fullName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-amber-500 shadow-md shrink-0"
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-zinc-100 text-xs sm:text-sm truncate">
                    {currentHoncho.fullName}
                  </div>
                  <div className="text-[11px] sm:text-xs text-amber-400 font-mono truncate">@{currentHoncho.gtaHandle}</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">
                    Joined: {new Date(currentHoncho.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* 365 Days Tenure Tracker */}
              <div className="p-3 bg-[#05070c] rounded-xl border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock size={12} className="text-amber-400" />
                    Sovereign Tenure:
                  </span>
                  <span className="text-amber-300 font-bold">365 / 365 Days</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 w-full rounded-full animate-pulse" />
                </div>
                <div className="text-[10px] text-amber-400/90 font-medium">
                  ★ 1-Year Sovereign term complete. Ready for Pontus ascension.
                </div>
              </div>

              {canStepHonchoDown && (
                <button
                  onClick={handleHonchoStepDown}
                  className="w-full py-2.5 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 text-xs font-mono transition-all transform active:scale-95 text-center"
                >
                  <Crown size={15} className="shrink-0" />
                  <span className="truncate">Step Down Honcho &rarr; Bestow PONTUS</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-500 text-xs font-mono space-y-2">
              <Crown size={24} className="mx-auto text-zinc-600" />
              <div>No seated Honcho found. Ghost may ascend.</div>
            </div>
          )}
        </div>

        {/* Ghost (007) Seat */}
        <div className="rounded-2xl bg-[#090c13] border border-cyan-500/40 p-4 sm:p-5 shadow-xl space-y-3.5 sm:space-y-4 relative overflow-hidden min-w-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Skull size={18} className="text-cyan-400 shrink-0" />
              <h3 className="font-cinzel text-xs sm:text-sm font-bold text-zinc-100 truncate">
                Seated Covert Ghost (007)
              </h3>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
              1 Seat (Strict)
            </span>
          </div>

          {currentGhost ? (
            <div className="space-y-3 sm:space-y-3.5">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <img
                  src={currentGhost.avatarUrl}
                  alt={currentGhost.fullName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-cyan-500 shadow-md shrink-0"
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-zinc-100 text-xs sm:text-sm truncate">
                    {currentGhost.fullName}
                  </div>
                  <div className="text-[11px] sm:text-xs text-cyan-400 font-mono truncate">@{currentGhost.gtaHandle}</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">
                    Joined: {new Date(currentGhost.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#05070c] rounded-xl border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Shield size={12} className="text-cyan-400" />
                    Covert Directorate:
                  </span>
                  <span className="text-cyan-300 font-bold">Active Head</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Upon Honcho step-down, Ghost ascends as Honcho. When Ghost tenure ends independently, Ghost becomes <strong className="text-cyan-300">HIGH PRIEST (I, II...)</strong>.
                </p>
              </div>

              {canStepGhostDown && (
                <button
                  onClick={handleGhostStepDown}
                  className="w-full py-2.5 px-2 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 text-xs font-mono transition-all transform active:scale-95 text-center"
                >
                  <Skull size={15} className="shrink-0" />
                  <span className="truncate">Step Down Ghost &rarr; HIGH PRIEST</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-500 text-xs font-mono space-y-2">
              <Skull size={24} className="mx-auto text-zinc-600" />
              <div>No seated Ghost (007). Voting by 12 Dons is required.</div>
            </div>
          )}
        </div>

        {/* 12 Dons High Table Council Status */}
        <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-3.5 sm:space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Award size={18} className="text-purple-400 shrink-0" />
              <h3 className="font-cinzel text-xs sm:text-sm font-bold text-zinc-100 truncate">
                12 Dons High Table Seats
              </h3>
            </div>
            <span
              className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                activeDons.length === 12
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {activeDons.length} / 12 Seats
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-[#05070c] rounded-xl border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Active High Table Dons:</span>
                <span className="text-purple-300 font-bold">{activeDons.length} Members</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Honorable Barons (Past Dons):</span>
                <span className="text-purple-400 font-bold">{activeBarons.length} Members</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Pontus Sovereigns:</span>
                <span className="text-amber-400 font-bold">{pontusRecords.length} Conferred</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">High Priests:</span>
                <span className="text-cyan-400 font-bold">{highPriestRecords.length} Conferred</span>
              </div>
            </div>

            {/* Avatar thumbnail strip of 12 Dons */}
            <div className="pt-1">
              <div className="text-[10px] text-zinc-400 mb-1.5">Current Seated Dons:</div>
              <div className="flex flex-wrap gap-1.5">
                {activeDons.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedProfileUser(d)}
                    className="relative group"
                    title={`Don ${d.fullName} (@${d.gtaHandle})`}
                  >
                    <img
                      src={d.avatarUrl}
                      alt={d.fullName}
                      className="w-8 h-8 rounded-lg object-cover border border-purple-500/60 hover:scale-110 transition-transform"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: 12 DONS GHOST ELECTION BALLOT (Strict: ONLY DONS CAN SEE & VOTE) */}
      {isDon && (
        <div className="rounded-2xl bg-[#090c13] border border-cyan-500/30 p-4 sm:p-5 shadow-2xl space-y-4 sm:space-y-5 min-w-0 overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-zinc-800 pb-3 sm:pb-4 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <Vote size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-cinzel text-sm sm:text-base md:text-lg font-bold text-zinc-100 flex items-center gap-2 break-words">
                    12 Dons Sovereign Ghost Election Ballot
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 font-mono leading-relaxed">
                    Only the 12 active High Table Dons hold ballot franchise. Winner ascends to Ghost (007); remaining 11 Dons become BARON.
                  </p>
                </div>
              </div>
            </div>

            {/* Voting status badge & finalize button */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs w-full md:w-auto">
              <div className="px-3 py-1.5 rounded-xl bg-[#05070c] border border-zinc-800 text-zinc-300 flex items-center gap-2 text-[11px] sm:text-xs">
                <span className="text-zinc-400">Votes Cast:</span>
                <strong className="text-cyan-400 font-bold">
                  {totalVotesCast} / {activeDons.length} Dons
                </strong>
              </div>

              <button
                onClick={handleFinalizeElection}
                disabled={activeDons.length === 0}
                className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50 text-xs flex-1 md:flex-initial justify-center"
              >
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Finalize Ballot & Crown Ghost</span>
              </button>
            </div>
          </div>

          {/* Voter Selector (if logged in user is admin/overseer or Don) */}
          <div className="p-3 sm:p-3.5 bg-[#05070c] rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs font-mono min-w-0">
            <div className="flex items-center gap-2 flex-wrap min-w-0 w-full sm:w-auto">
              <span className="text-zinc-400 text-[11px] shrink-0">Casting Ballot as Don:</span>
              <select
                value={selectedDonVoterId}
                onChange={(e) => setSelectedDonVoterId(e.target.value)}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none text-xs flex-1 sm:flex-initial min-w-0 max-w-full"
              >
                {activeDons.map((d) => (
                  <option key={d.id} value={d.id}>
                    Don {d.fullName} (@{d.gtaHandle})
                  </option>
                ))}
              </select>
            </div>

            {leadingCandidate && (
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span>Leading:</span>
                <strong className="text-cyan-300">
                  Don {leadingCandidate.don.fullName} ({leadingCandidate.votes} votes)
                </strong>
              </div>
            )}
          </div>

          {/* Dons Candidates Grid */}
          {activeDons.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-mono text-xs space-y-2">
              <AlertTriangle size={24} className="mx-auto text-zinc-600" />
              <p>No active Dons available on the High Table. Please appoint Dons from Lords below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 min-w-0">
              {activeDons.map((don) => {
                const votes = voteCounts[don.id] || 0;
                const votePct =
                  totalVotesCast > 0 ? Math.round((votes / totalVotesCast) * 100) : 0;
                const isLeading = leadingCandidate?.don.id === don.id && votes > 0;

                return (
                  <div
                    key={don.id}
                    className={`p-3.5 rounded-xl bg-[#05070c] border transition-all flex flex-col justify-between gap-3 min-w-0 overflow-hidden ${
                      isLeading
                        ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-2.5 min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={don.avatarUrl}
                          alt={don.fullName}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover border border-purple-500/50 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-zinc-200 text-xs truncate">
                            {don.fullName}
                          </div>
                          <div className="text-[10px] text-purple-400 font-mono truncate">@{don.gtaHandle}</div>
                          <div className="text-[9px] text-zinc-500 font-mono truncate">
                            Joined: {new Date(don.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Vote progress & count */}
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Ballot Tally:</span>
                          <span className="text-cyan-300 font-bold">
                            {votes} {votes === 1 ? 'Vote' : 'Votes'} ({votePct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${votePct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCastVote(don.id)}
                      className="w-full py-2 bg-zinc-900 hover:bg-cyan-950/70 border border-zinc-700 hover:border-cyan-500/50 text-zinc-200 hover:text-cyan-300 font-bold rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Vote size={13} className="shrink-0" />
                      <span>Vote as New Ghost</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: 12 NEW DONS APPOINTMENT FROM LORDS (Strict: ONLY HONCHO & GHOST; 6 EACH) */}
      {isHonchoOrGhost && (
        <div className="rounded-2xl bg-[#090c13] border border-emerald-500/30 p-4 sm:p-6 shadow-2xl space-y-5 min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4 min-w-0">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 shadow-inner">
                  <UserPlus size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-cinzel text-base sm:text-lg md:text-xl font-bold text-zinc-100 flex items-center gap-2 break-words">
                    Honcho & Ghost Appointment of 12 New Dons (From Lords)
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 font-mono leading-relaxed">
                    Sovereign Law: Honcho appoints up to <strong className="text-amber-300">6 Dons</strong> and Ghost appoints up to <strong className="text-cyan-300">6 Dons</strong> (Maximum 6 each, 12 total). Priority: <strong className="text-amber-300">Caesar</strong> &amp; <strong className="text-purple-300">Ash-Lord</strong> titles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quota Progress Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs min-w-0">
            {/* Honcho Quota */}
            <div className="p-3.5 rounded-xl bg-[#05070c] border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown size={15} className="text-amber-400" />
                  <span className="font-bold text-zinc-200 text-xs">Honcho Quota</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  honchoCount >= 6
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {honchoCount}/6 Appointed
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(honchoCount / 6) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-400 flex justify-between">
                <span>Remaining: <strong className="text-amber-300">{honchoRemaining}</strong></span>
                <span>Max: 6</span>
              </div>
            </div>

            {/* Ghost Quota */}
            <div className="p-3.5 rounded-xl bg-[#05070c] border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skull size={15} className="text-cyan-400" />
                  <span className="font-bold text-zinc-200 text-xs">Ghost Quota</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  ghostCount >= 6
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  {ghostCount}/6 Appointed
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(ghostCount / 6) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-400 flex justify-between">
                <span>Remaining: <strong className="text-cyan-300">{ghostRemaining}</strong></span>
                <span>Max: 6</span>
              </div>
            </div>

            {/* Total 12 Dons High Table Council */}
            <div className="p-3.5 rounded-xl bg-[#05070c] border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-emerald-400" />
                  <span className="font-bold text-zinc-200 text-xs">Total High Table Dons</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isAll12Complete
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}>
                  {totalDonsAppointed}/12 Complete
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(totalDonsAppointed / 12) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-400 flex justify-between">
                <span>Status: <strong className={isAll12Complete ? 'text-emerald-400' : 'text-zinc-300'}>{isAll12Complete ? 'Fully Seated' : 'Appointment Open'}</strong></span>
                <span>Target: 12 Dons</span>
              </div>
            </div>
          </div>

          {/* Selection Actions Control Bar (Select up to 6 and Appoint by Honcho or Ghost) */}
          <div className="p-3 sm:p-4 rounded-xl bg-[#05070c] border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-300 font-bold flex items-center gap-1.5 text-xs">
                <span>Selected:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  selectedLordIdsForDon.length > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {selectedLordIdsForDon.length} / 6 max
                </span>
              </span>

              <button
                onClick={handleSelectTop6ForHoncho}
                disabled={honchoRemaining === 0}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 transition-colors text-[11px] flex items-center gap-1 disabled:opacity-40"
                title="Quickly select top priority Lords for Honcho"
              >
                <Crown size={12} />
                <span>Select Top 6 for Honcho</span>
              </button>

              <button
                onClick={handleSelectTop6ForGhost}
                disabled={ghostRemaining === 0}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 transition-colors text-[11px] flex items-center gap-1 disabled:opacity-40"
                title="Quickly select top priority Lords for Ghost"
              >
                <Skull size={12} />
                <span>Select Top 6 for Ghost</span>
              </button>

              {selectedLordIdsForDon.length > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors text-[11px] flex items-center gap-1"
                >
                  <X size={12} />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Appoint by Honcho or Ghost Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleAppointForRole('HONCHO')}
                disabled={
                  selectedLordIdsForDon.length === 0 ||
                  selectedLordIdsForDon.length > honchoRemaining ||
                  honchoRemaining === 0
                }
                className="flex-1 md:flex-initial px-3.5 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 text-xs"
                title={
                  honchoRemaining === 0
                    ? 'Honcho quota is already full (6/6)'
                    : selectedLordIdsForDon.length > honchoRemaining
                    ? `Selection (${selectedLordIdsForDon.length}) exceeds remaining Honcho quota (${honchoRemaining})`
                    : 'Appoint selected Lords as Dons by Sovereign Honcho decree'
                }
              >
                <Crown size={14} className="shrink-0" />
                <span>
                  Appoint ({selectedLordIdsForDon.length}) by Honcho
                  {honchoRemaining < 6 && ` (${honchoRemaining} left)`}
                </span>
              </button>

              <button
                onClick={() => handleAppointForRole('GHOST')}
                disabled={
                  selectedLordIdsForDon.length === 0 ||
                  selectedLordIdsForDon.length > ghostRemaining ||
                  ghostRemaining === 0
                }
                className="flex-1 md:flex-initial px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 text-xs"
                title={
                  ghostRemaining === 0
                    ? 'Ghost quota is already full (6/6)'
                    : selectedLordIdsForDon.length > ghostRemaining
                    ? `Selection (${selectedLordIdsForDon.length}) exceeds remaining Ghost quota (${ghostRemaining})`
                    : 'Appoint selected Lords as Dons by Ghost 007 decree'
                }
              >
                <Skull size={14} className="shrink-0" />
                <span>
                  Appoint ({selectedLordIdsForDon.length}) by Ghost
                  {ghostRemaining < 6 && ` (${ghostRemaining} left)`}
                </span>
              </button>
            </div>
          </div>

          {/* Priority Lords Registry */}
          {priorityLords.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-mono text-xs space-y-2">
              <AlertTriangle size={24} className="mx-auto text-zinc-600" />
              <p>No members currently hold the rank of Lord in the Syndicate registry.</p>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs min-w-0">
              <div className="text-[11px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>
                  Eligible Lords Pool: <strong className="text-zinc-200">{priorityLords.length}</strong> • Select up to <strong className="text-emerald-400">6 Lords</strong> per appointment action
                </span>
                <span className="text-[10px] text-amber-400/90">
                  ★ Caesar &amp; Ash-Lord titles prioritized first, then join date seniority
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 min-w-0">
                {priorityLords.map((lord) => {
                  const isSelected = selectedLordIdsForDon.includes(lord.id);
                  const isAppointedByHoncho = honchoAppointedList.includes(lord.id);
                  const isAppointedByGhost = ghostAppointedList.includes(lord.id);
                  const isAlreadyAppointed = isAppointedByHoncho || isAppointedByGhost;

                  const hasCaesar = lord.specialTitles?.includes('Caesar');
                  const hasAshLord = lord.specialTitles?.includes('Ash-Lord');
                  const isPriority = hasCaesar || hasAshLord;

                  return (
                    <div
                      key={lord.id}
                      className={`p-3 rounded-xl bg-[#05070c] border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all min-w-0 overflow-hidden ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/20 shadow-md'
                          : isAlreadyAppointed
                          ? 'border-zinc-800/80 bg-zinc-950/40 opacity-75'
                          : isPriority
                          ? 'border-amber-500/40 hover:border-amber-500/80'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isAlreadyAppointed}
                          onChange={() => handleToggleLordSelection(lord.id)}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 focus:outline-none cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        />

                        <img
                          src={lord.avatarUrl}
                          alt={lord.fullName}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover border border-zinc-700 shrink-0"
                        />

                        <div className="min-w-0 space-y-0.5 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <span className="font-bold text-zinc-100 text-xs truncate">
                              {lord.fullName}
                            </span>
                            {hasCaesar && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                                👑 CAESAR
                              </span>
                            )}
                            {hasAshLord && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                                🏛️ ASH-LORD
                              </span>
                            )}
                            {isAppointedByHoncho && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                                👑 HONCHO APPOINTED
                              </span>
                            )}
                            {isAppointedByGhost && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                                🕵️ GHOST APPOINTED
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate">
                            @{lord.gtaHandle} • Joined: {new Date(lord.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0 border-t border-zinc-800/60 sm:border-0">
                        <button
                          onClick={() => handleSingleAppoint(lord.id, 'HONCHO')}
                          disabled={honchoRemaining === 0 || isAlreadyAppointed}
                          className="flex-1 sm:flex-initial px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-colors text-center disabled:opacity-30 disabled:hover:bg-amber-500/20 disabled:hover:text-amber-300 cursor-pointer disabled:cursor-not-allowed"
                          title={
                            honchoRemaining === 0
                              ? 'Honcho quota full (6/6)'
                              : 'Appoint as Don by Sovereign Honcho decree'
                          }
                        >
                          👑 Honcho Appoint
                        </button>
                        <button
                          onClick={() => handleSingleAppoint(lord.id, 'GHOST')}
                          disabled={ghostRemaining === 0 || isAlreadyAppointed}
                          className="flex-1 sm:flex-initial px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-zinc-950 border border-cyan-500/40 rounded-lg text-[10px] font-bold transition-colors text-center disabled:opacity-30 disabled:hover:bg-cyan-500/20 disabled:hover:text-cyan-300 cursor-pointer disabled:cursor-not-allowed"
                          title={
                            ghostRemaining === 0
                              ? 'Ghost quota full (6/6)'
                              : 'Appoint as Don by Ghost 007 decree'
                          }
                        >
                          🕵️ Ghost Appoint
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: IMMORTAL PATRIARCHS & BARONS ROSTERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 font-mono text-xs min-w-0">
        {/* Pontus Sovereigns Emeritus (PONTUS I, II...) */}
        <div className="rounded-2xl bg-[#090c13] border border-amber-500/30 p-4 space-y-3 shadow-xl min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
            <Crown size={16} className="text-amber-400 shrink-0" />
            <h4 className="font-cinzel text-xs font-bold text-zinc-100 truncate">
              Order of Pontus Sovereigns ({pontusRecords.length})
            </h4>
          </div>

          {pontusRecords.length === 0 ? (
            <div className="text-zinc-500 italic text-[11px] py-2">
              No Honcho has completed a 365-day term yet.
            </div>
          ) : (
            <div className="space-y-2">
              {pontusRecords.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-[#05070c] rounded-lg border border-amber-500/20 flex items-center justify-between gap-2 min-w-0"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-amber-200 truncate">{p.pontusTitle}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{p.name} (@{p.gtaHandle})</div>
                  </div>
                  <span className="text-[9px] text-zinc-500 shrink-0">
                    {new Date(p.concludedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Priests Emeritus (HIGH PRIEST I, II...) */}
        <div className="rounded-2xl bg-[#090c13] border border-cyan-500/30 p-4 space-y-3 shadow-xl min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
            <Skull size={16} className="text-cyan-400 shrink-0" />
            <h4 className="font-cinzel text-xs font-bold text-zinc-100 truncate">
              Order of High Priests ({highPriestRecords.length})
            </h4>
          </div>

          {highPriestRecords.length === 0 ? (
            <div className="text-zinc-500 italic text-[11px] py-2">
              No Ghost has concluded independent tenure yet.
            </div>
          ) : (
            <div className="space-y-2">
              {highPriestRecords.map((hp) => (
                <div
                  key={hp.id}
                  className="p-2.5 bg-[#05070c] rounded-lg border border-cyan-500/20 flex items-center justify-between gap-2 min-w-0"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-cyan-200 truncate">{hp.highPriestTitle}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{hp.name} (@{hp.gtaHandle})</div>
                  </div>
                  <span className="text-[9px] text-zinc-500 shrink-0">
                    {new Date(hp.concludedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Noble Barons (Former 12 Dons) */}
        <div className="rounded-2xl bg-[#090c13] border border-purple-500/30 p-4 space-y-3 shadow-xl min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
            <Award size={16} className="text-purple-400 shrink-0" />
            <h4 className="font-cinzel text-xs font-bold text-zinc-100 truncate">
              Noble Barons of the High Table ({activeBarons.length})
            </h4>
          </div>

          {activeBarons.length === 0 ? (
            <div className="text-zinc-500 italic text-[11px] py-2">
              Former Dons who stepped aside upon Ghost election.
            </div>
          ) : (
            <div className="space-y-2">
              {activeBarons.map((b) => (
                <div
                  key={b.id}
                  className="p-2 bg-[#05070c] rounded-lg border border-purple-500/20 flex items-center justify-between gap-2 min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={b.avatarUrl}
                      alt={b.fullName}
                      className="w-7 h-7 rounded object-cover border border-purple-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-purple-200 text-[11px] truncate">{b.fullName}</div>
                      <div className="text-[9px] text-zinc-400 truncate">@{b.gtaHandle}</div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] rounded bg-purple-500/20 text-purple-300 font-bold shrink-0">
                    BARON
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
