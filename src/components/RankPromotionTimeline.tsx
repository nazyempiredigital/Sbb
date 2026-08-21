import React, { useState } from 'react';
import { User, RankPromotionRecord, MafiaRank, RANK_HIERARCHY, RANK_LEVELS } from '../types';
import { RankBadge, getRankVisualInfo } from './RankBadge';
import { useFamily, cleanThirdEyeString } from '../context/FamilyContext';
import {
  History,
  Calendar,
  Crown,
  Award,
  Sparkles,
  Shield,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  X,
  UserCheck,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RankPromotionTimelineProps {
  user: User;
  onClose: () => void;
  onTriggerCelebration?: () => void;
}

export const RankPromotionTimeline: React.FC<RankPromotionTimelineProps> = ({
  user,
  onClose,
  onTriggerCelebration,
}) => {
  const { currentUser, canAccessAdmin, addPromotionRecord } = useFamily();
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRank, setNewRank] = useState<MafiaRank>(user.rank);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNote, setNewNote] = useState('');
  const [newCeremony, setNewCeremony] = useState<
    'GATE_APPROVAL' | 'M19_INDUCTION' | 'HIGH_TABLE_DECREE' | 'FOUNDER_ASCENSION' | 'STANDARD_PROMOTION'
  >('STANDARD_PROMOTION');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const visual = getRankVisualInfo(user.rank);
  const isAdmin = canAccessAdmin(currentUser);

  // Normalize history
  const historyList: RankPromotionRecord[] = (
    user.promotionHistory && user.promotionHistory.length > 0
      ? user.promotionHistory
      : [
          {
            id: `init-${user.id}`,
            rank: user.rank,
            promotedAt: user.joinedAt || new Date().toISOString(),
            note: 'Initial standing recorded in SBB Syndicate registry.',
            ceremonyType: user.rank === 'No Man' ? 'GATE_APPROVAL' : 'HIGH_TABLE_DECREE',
          },
        ]
  ).slice().sort((a, b) => {
    const timeA = new Date(a.promotedAt).getTime();
    const timeB = new Date(b.promotedAt).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const handleFireConfetti = (e?: React.MouseEvent) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { x, y },
        colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#ffffff', '#10b981'],
      });
    } else {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#ffffff'],
      });
    }
    if (onTriggerCelebration) {
      onTriggerCelebration();
    }
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    addPromotionRecord(user.id, {
      rank: newRank,
      promotedAt: new Date(newDate).toISOString(),
      promotedByUserId: currentUser.id,
      promotedByName: currentUser.fullName,
      promotedByRank: currentUser.rank,
      note: newNote.trim() || `Conferred by ${currentUser.fullName} (${currentUser.rank}).`,
      ceremonyType: newCeremony,
    });

    setIsAddingRecord(false);
    setNewNote('');
    setIsSubmitting(false);
  };

  const getCeremonyMeta = (type?: string) => {
    switch (type) {
      case 'M19_INDUCTION':
        return {
          label: 'M19 Induction Ceremony',
          color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          icon: Award,
        };
      case 'GATE_APPROVAL':
        return {
          label: 'Gate Approval & Sponsorship',
          color: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          icon: UserCheck,
        };
      case 'FOUNDER_ASCENSION':
        return {
          label: 'Apex Founder Ascension',
          color: 'bg-rose-950/80 text-rose-200 border-rose-500/60',
          icon: Crown,
        };
      case 'HIGH_TABLE_DECREE':
        return {
          label: 'High Table Decree',
          color: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
          icon: Sparkles,
        };
      case 'STANDARD_PROMOTION':
      default:
        return {
          label: 'Family Rank Promotion',
          color: 'bg-zinc-800 text-zinc-300 border-zinc-600',
          icon: Shield,
        };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return {
        formatted: d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        time: d.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch {
      return { formatted: isoString, time: '' };
    }
  };

  const currentRankIndex = RANK_HIERARCHY.indexOf(user.rank);
  const nextRank = currentRankIndex < RANK_HIERARCHY.length - 1 ? RANK_HIERARCHY[currentRankIndex + 1] : null;

  return (
    <div
      id="rank-promotion-timeline-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-start sm:items-center justify-center p-2.5 sm:p-4 pt-4 sm:pt-6 pb-16 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#090c13] border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-2 sm:my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-4 sm:p-5 border-b border-zinc-800 bg-[#05070c] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className={`w-12 h-12 rounded-xl object-cover border-2 ${visual.avatarHaloClass}`}
              />
              <span className="absolute -bottom-1 -right-1 bg-black/90 p-0.5 rounded-full border border-amber-400/50">
                <Crown size={11} className="text-amber-400" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span>{user.fullName}</span>
                </h2>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                @{user.gtaHandle} • Joined {formatDate(user.joinedAt).formatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleFireConfetti}
              title="Salute & Trigger Rank Celebration"
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all text-xs flex items-center gap-1 shadow"
            >
              <Sparkles size={14} className="text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline text-[11px] font-mono font-bold">Salute</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Current Standing Card */}
        <div className="p-3.5 sm:p-4 bg-[#07090f] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Current Standing:</span>
            <RankBadge rank={user.rank} size="md" showLevel withShimmer />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-[#050505] border border-zinc-800 text-amber-300">
              {historyList.length} {historyList.length === 1 ? 'Promotion' : 'Promotions'}
            </span>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="text-[10px] text-zinc-400 hover:text-amber-300 underline font-mono flex items-center gap-0.5"
            >
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              {sortOrder === 'desc' ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-amber-500/70 before:via-zinc-700 before:to-zinc-800">
            {historyList.map((record, index) => {
              const recordVisual = getRankVisualInfo(record.rank);
              const ceremony = getCeremonyMeta(record.ceremonyType);
              const CeremonyIcon = ceremony.icon;
              const { formatted, time } = formatDate(record.promotedAt);

              const isLatest = index === (sortOrder === 'desc' ? 0 : historyList.length - 1);

              return (
                <div
                  key={record.id || index}
                  className="relative group transition-all duration-300"
                >
                  {/* Timeline Bullet Node */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-[#090c13] transition-all shadow-md ${
                      isLatest
                        ? 'border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'border-zinc-600 group-hover:border-zinc-400'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: recordVisual.glowColorHex }}
                    />
                  </div>

                  {/* Promotion Card */}
                  <div
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                      isLatest
                        ? 'bg-[#0b0e17] border-amber-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                        : 'bg-[#07090f] border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Top Row: Rank Badge & Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RankBadge rank={record.rank} size="sm" showLevel withShimmer={isLatest} />
                        {record.previousRank && (
                          <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                            <span>from</span>
                            <span className="text-zinc-300 font-semibold">{record.previousRank}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                        <Calendar size={12} className="text-amber-400/80" />
                        <span className="font-semibold text-zinc-300">{formatted}</span>
                        {time && <span className="text-[10px] text-zinc-500">({time})</span>}
                      </div>
                    </div>

                    {/* Ceremony & Authority */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${ceremony.color}`}
                      >
                        <CeremonyIcon size={11} />
                        <span>{ceremony.label}</span>
                      </span>

                      {record.promotedByName && (
                        <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                          <span>Officiated by</span>
                          <strong className="text-amber-200">{record.promotedByName}</strong>
                          {record.promotedByRank && (
                            <span className="text-zinc-400">({record.promotedByRank})</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Historical Citation / Note */}
                    {record.note && (
                      <p className="mt-2 text-xs text-zinc-300 bg-[#050505] p-2 rounded-lg border border-zinc-800/80 italic font-sans leading-relaxed">
                        "{cleanThirdEyeString(record.note)}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Add Historical Record Form */}
          {isAdmin && (
            <div className="pt-2">
              {!isAddingRecord ? (
                <button
                  onClick={() => setIsAddingRecord(true)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500/60 bg-zinc-900/40 hover:bg-amber-950/20 text-zinc-400 hover:text-amber-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus size={13} />
                  <span>Record Historical Rank Milestone (High Table Command)</span>
                </button>
              ) : (
                <form
                  onSubmit={handleAddRecord}
                  className="p-3.5 rounded-xl bg-[#06080e] border border-amber-500/40 space-y-2.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <Crown size={12} />
                      Record Rank Promotion
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingRecord(false)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-zinc-400 text-[10px] mb-0.5">Rank Conferred</label>
                      <select
                        value={newRank}
                        onChange={(e) => setNewRank(e.target.value as MafiaRank)}
                        className="w-full px-2 py-1 bg-[#090c13] border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-amber-500 text-xs"
                      >
                        {RANK_HIERARCHY.map((r) => (
                          <option key={r} value={r}>
                            {r} (Level {RANK_LEVELS[r]})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[10px] mb-0.5">Ceremony Type</label>
                      <select
                        value={newCeremony}
                        onChange={(e) => setNewCeremony(e.target.value as any)}
                        className="w-full px-2 py-1 bg-[#090c13] border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-amber-500 text-xs"
                      >
                        <option value="STANDARD_PROMOTION">Standard Promotion</option>
                        <option value="GATE_APPROVAL">Gate Approval</option>
                        <option value="M19_INDUCTION">M19 Induction</option>
                        <option value="HIGH_TABLE_DECREE">High Table Decree</option>
                        <option value="FOUNDER_ASCENSION">Founder Ascension</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-zinc-400 text-[10px] mb-0.5">Promotion Date</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-2 py-1 bg-[#090c13] border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-zinc-400 text-[10px] mb-0.5">
                        Citation / Decree Note
                      </label>
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="e.g. Exhibited unyielding loyalty in the South Port campaign."
                        className="w-full px-2 py-1 bg-[#090c13] border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingRecord(false)}
                      className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded text-xs flex items-center gap-1 shadow"
                    >
                      <CheckCircle2 size={12} />
                      <span>Save Record</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Next Rank Roadmap */}
        <div className="p-3.5 sm:p-4 bg-[#05070c] border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="text-zinc-400">
            {nextRank ? (
              <span className="flex items-center gap-1.5 text-[11px]">
                <Clock size={12} className="text-amber-400" />
                <span>Next Ascension:</span>
                <span className="font-bold text-amber-200">{nextRank}</span>
              </span>
            ) : (
              <span className="text-rose-300 font-bold flex items-center gap-1 text-[11px]">
                <Crown size={12} />
                Apex Summit Reached (Above Founders)
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
