import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge } from './RankBadge';
import {
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Flame,
  Shield,
  Zap,
  Users,
} from 'lucide-react';

export const YearlyPromotionsView: React.FC = () => {
  const {
    currentUser,
    yearlyPromotionCandidates,
    runYearlyPromotions,
    promoteSingleYearlyCandidate,
    setSelectedProfileUser,
  } = useFamily();

  const [feedback, setFeedback] = useState<{ msg: string; success: boolean } | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'ELIGIBLE_ONLY' | 'PENDING'>('ALL');

  const eligibleCandidates = yearlyPromotionCandidates.filter((c) => c.isEligible);
  const pendingCandidates = yearlyPromotionCandidates.filter((c) => !c.isEligible);

  const displayedCandidates = yearlyPromotionCandidates.filter((c) => {
    if (filterMode === 'ELIGIBLE_ONLY') return c.isEligible;
    if (filterMode === 'PENDING') return !c.isEligible;
    return true;
  });

  const handleRunAllPromotions = () => {
    const res = runYearlyPromotions();
    setFeedback({ msg: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleSinglePromotion = (userId: string) => {
    const res = promoteSingleYearlyCandidate(userId);
    setFeedback({ msg: res.message, success: res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 font-mono">
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
            {feedback.success ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 ml-2 px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Directive Card */}
      <div className="rounded-2xl bg-[#090c13] border border-amber-500/30 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
                Annual 1-Year Rank Step-Up Directorate
              </h2>
              <p className="text-xs text-zinc-400">
                Rule: Members in ranks JB to O.G automatically advance one rank step per year (365 days).
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAllPromotions}
            disabled={eligibleCandidates.length === 0}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center gap-2 text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap size={14} />
            <span>Batch Promote All 365+ Day Members ({eligibleCandidates.length})</span>
          </button>
        </div>

        {/* Step-Up Progression Ladder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-[#05070c] rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500">Tier 1 Step-Up</span>
              <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                <span className="text-amber-400">Junior Boss (31-JB)</span>
                <ArrowRight size={12} className="text-zinc-500" />
                <span className="text-emerald-400">Boss</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500">365 Days</span>
          </div>

          <div className="p-3 bg-[#05070c] rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500">Tier 2 Step-Up</span>
              <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                <span className="text-emerald-400">Boss</span>
                <ArrowRight size={12} className="text-zinc-500" />
                <span className="text-blue-400">Cartel Man</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500">365 Days</span>
          </div>

          <div className="p-3 bg-[#05070c] rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500">Tier 3 Step-Up</span>
              <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                <span className="text-blue-400">Cartel Man</span>
                <ArrowRight size={12} className="text-zinc-500" />
                <span className="text-purple-400">O.G</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500">365 Days</span>
          </div>
        </div>
      </div>

      {/* Metrics & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#090c13] rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">
            Tracked Members:{' '}
            <strong className="text-zinc-200">{yearlyPromotionCandidates.length}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-bold">
            Eligible Today: {eligibleCandidates.length}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-amber-400">In Crucible: {pendingCandidates.length}</span>
        </div>

        <div className="flex items-center gap-1 bg-[#05070c] p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
              filterMode === 'ALL'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({yearlyPromotionCandidates.length})
          </button>
          <button
            onClick={() => setFilterMode('ELIGIBLE_ONLY')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
              filterMode === 'ELIGIBLE_ONLY'
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Eligible ({eligibleCandidates.length})
          </button>
          <button
            onClick={() => setFilterMode('PENDING')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
              filterMode === 'PENDING'
                ? 'bg-zinc-700 text-zinc-200'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Pending ({pendingCandidates.length})
          </button>
        </div>
      </div>

      {/* Candidates List */}
      {displayedCandidates.length === 0 ? (
        <div className="p-8 text-center bg-[#090c13] rounded-2xl border border-zinc-800 text-zinc-500 text-xs space-y-2">
          <CheckCircle2 size={24} className="mx-auto text-zinc-600" />
          <p>No members match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedCandidates.map((c) => {
            const pct = Math.min(100, Math.round((c.daysInRank / 365) * 100));

            return (
              <div
                key={c.user.id}
                className={`p-4 rounded-2xl bg-[#090c13] border transition-all flex flex-col justify-between gap-3 shadow-xl ${
                  c.isEligible
                    ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.user.avatarUrl}
                        alt={c.user.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-zinc-100 text-sm">{c.user.fullName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">@{c.user.gtaHandle}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Joined: {new Date(c.user.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProfileUser(c.user)}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Dossier
                    </button>
                  </div>

                  {/* Rank Progression Info */}
                  <div className="p-2.5 bg-[#05070c] rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Current Rank</span>
                      <strong className="text-zinc-200">{c.currentRank}</strong>
                    </div>
                    <ArrowRight size={14} className="text-zinc-600" />
                    <div>
                      <span className="text-[10px] text-emerald-400 block text-right">Target Step-Up</span>
                      <strong className="text-emerald-300">{c.nextRank}</strong>
                    </div>
                  </div>

                  {/* 365 Days Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock size={12} className="text-amber-400" />
                        Tenure in Rank:
                      </span>
                      <span
                        className={`font-bold ${
                          c.isEligible ? 'text-emerald-400' : 'text-amber-300'
                        }`}
                      >
                        {c.daysInRank} / 365 Days ({pct}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          c.isEligible
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>{c.isEligible ? '★ 1 Year Complete!' : `${c.daysRemaining} days remaining`}</span>
                      <span>{c.isEligible ? 'Eligible for Step-Up' : 'Crucible Active'}</span>
                    </div>
                  </div>
                </div>

                {/* Step-Up Action / 1-Year Tenure Requirement Status */}
                {c.isEligible ? (
                  <button
                    onClick={() => handleSinglePromotion(c.user.id)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md active:scale-[0.99]"
                  >
                    <Award size={14} />
                    <span>Step Up to {c.nextRank}</span>
                  </button>
                ) : (
                  <div className="w-full py-2 px-3 rounded-xl font-mono text-xs bg-[#05070c] border border-zinc-800 text-zinc-400 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Clock size={13} className="text-amber-400 shrink-0" />
                      <span className="truncate">Must wait 1 year for {c.nextRank}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 shrink-0 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {c.daysRemaining}d left
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
