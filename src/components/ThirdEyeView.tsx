import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge, SpecialTitleBadge } from './RankBadge';
import { RANK_LEVELS } from '../types';
import {
  Eye,
  Crown,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const ThirdEyeView: React.FC = () => {
  const {
    currentUser,
    users,
    setSelectedProfileUser,
    approveRecruit,
    makeJuniorBossM19,
    advanceNewBornDays,
  } = useFamily();

  const [filterRank, setFilterRank] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [expandedMentors, setExpandedMentors] = useState<Record<string, boolean>>({});

  const toggleExpandMentor = (mentorId: string) => {
    setExpandedMentors((prev) => ({
      ...prev,
      [mentorId]: !prev[mentorId],
    }));
  };

  const currentUserLevel = RANK_LEVELS[currentUser?.rank || 'No Man'] || 1;
  const isOGOrHigher = currentUserLevel >= 6;

  // Recruits assigned to the currently logged in user
  const myThirdEyes = users.filter((u) => u.approvedByUserId === currentUser?.id);

  // All mentors (users who have approved at least 1 recruit)
  const mentors = users.filter((u) => RANK_LEVELS[u.rank] >= 6);

  // Unapproved No Men
  const pendingNoMen = users.filter((u) => u.rank === 'No Man');

  const handleApprove = (id: string) => {
    const res = approveRecruit(id);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleM19 = (id: string) => {
    const res = makeJuniorBossM19(id);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-2.5 bg-amber-950/80 border border-amber-500/60 rounded-lg text-amber-200 text-xs font-medium flex items-center justify-between shadow-lg font-mono">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#050505] rounded-lg border border-indigo-500/40 text-indigo-300 shrink-0">
                <Eye size={18} />
              </span>
              <h1 className="font-cinzel text-base sm:text-xl font-bold text-zinc-100 truncate">
                The Third Eye Network & Mentorship
              </h1>
            </div>
            <p className="text-[11px] text-zinc-400 max-w-3xl leading-relaxed font-mono">
              "The person who approves a recruit shall serve as their Third Eye throughout their 31-day New Born training
              before the sacred M19 Ceremony confers the rank of Junior Boss (31-JB)."
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <div className="p-2 sm:p-2.5 bg-[#050505] rounded-lg border border-zinc-800 text-center min-w-[80px] sm:min-w-[90px]">
              <div className="text-sm sm:text-base font-bold font-mono text-amber-400">
                {users.filter((u) => u.rank === 'New Born').length}
              </div>
              <div className="text-[9px] text-zinc-400 uppercase font-mono">New Borns</div>
            </div>
            <div className="p-2 sm:p-2.5 bg-[#050505] rounded-lg border border-zinc-800 text-center min-w-[80px] sm:min-w-[90px]">
              <div className="text-sm sm:text-base font-bold font-mono text-teal-400">
                {users.filter((u) => u.rank === 'Junior Boss (31-JB)').length}
              </div>
              <div className="text-[9px] text-zinc-400 uppercase font-mono">Made 31-JBs</div>
            </div>
          </div>
        </div>
      </div>

      {/* MY ASSIGNED THIRD EYES (If viewer is O.G or higher) */}
      {isOGOrHigher && (
        <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-[#050505] rounded border border-indigo-500/40 text-indigo-300">
                <Eye size={15} />
              </div>
              <div>
                <h3 className="font-cinzel text-sm font-bold text-zinc-100">
                  Your Recruits Under Third Eye Watch ({myThirdEyes.length})
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Recruits you approved into the Family. You serve as their Third Eye throughout their 31-day journey to M19.
                </p>
              </div>
            </div>
          </div>

          {myThirdEyes.length === 0 ? (
            <div className="p-5 text-center text-zinc-500 text-xs italic bg-[#050505] rounded-lg border border-zinc-800 font-mono">
              You haven't approved any recruits yet. Review the pending No Men at The Gate below!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {myThirdEyes.map((recruit) => {
                const days = recruit.simulatedDaysPassed || 1;
                const isReady = recruit.rank === 'New Born' && days >= 31;

                return (
                  <div
                    key={recruit.id}
                    className="p-3.5 rounded-lg bg-[#050505] border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <img
                        src={recruit.avatarUrl}
                        alt={recruit.fullName}
                        className="w-10 h-10 rounded-lg object-cover border border-amber-500/40 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          onClick={() => setSelectedProfileUser(recruit)}
                          className="font-bold text-xs text-zinc-100 hover:text-amber-300 cursor-pointer truncate"
                        >
                          {recruit.fullName}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          @{recruit.gtaHandle}
                        </div>
                        <div className="mt-0.5">
                          <RankBadge rank={recruit.rank} size="sm" />
                        </div>
                      </div>
                    </div>

                    {/* Progress tracking */}
                    {recruit.rank === 'New Born' ? (
                      <div className="space-y-1 p-2 bg-[#090c13] rounded border border-zinc-800 text-xs">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-zinc-400">Countdown:</span>
                          <span className={isReady ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            Day {days} of 31 {isReady ? '(M19 Ready!)' : ''}
                          </span>
                        </div>
                        <div className="w-full bg-[#050505] rounded-full h-1.5 overflow-hidden border border-zinc-800">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, (days / 31) * 100)}%` }}
                          />
                        </div>

                        {/* Quick Day Test simulation */}
                        <div className="flex justify-between items-center pt-0.5 text-[9px] text-zinc-400 font-mono">
                          <span>Set Day:</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => advanceNewBornDays(recruit.id, 1)}
                              className="px-1.5 py-0.2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                            >
                              D1
                            </button>
                            <button
                              onClick={() => advanceNewBornDays(recruit.id, 15)}
                              className="px-1.5 py-0.2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                            >
                              D15
                            </button>
                            <button
                              onClick={() => advanceNewBornDays(recruit.id, 31)}
                              className="px-1.5 py-0.2 bg-amber-950 hover:bg-amber-900 text-amber-300 rounded font-bold"
                            >
                              D31
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-teal-950/40 rounded border border-teal-500/30 text-[10px] text-teal-300 font-mono font-medium">
                        ✓ Made Man (M19 Completed)
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {isReady && (
                        <button
                          onClick={() => handleM19(recruit.id)}
                          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs rounded shadow flex items-center justify-center gap-1 font-mono"
                        >
                          <Award size={12} />
                          Officiate M19
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedProfileUser(recruit)}
                        className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded border border-zinc-700 text-center font-mono"
                      >
                        Inspect Dossier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PENDING APPROVAL AT THE GATE (If viewer is O.G+) */}
      {isOGOrHigher && pendingNoMen.length > 0 && (
        <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-amber-400" />
              <h3 className="font-cinzel text-sm font-bold text-zinc-100">
                Pending Recruits Awaiting Sponsor ({pendingNoMen.length})
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              Approving a recruit establishes you as their Third Eye sponsor
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingNoMen.map((nom) => (
              <div
                key={nom.id}
                className="p-3 rounded-lg bg-[#050505] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
              >
                <div
                  className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                  onClick={() => setSelectedProfileUser(nom)}
                >
                  <img
                    src={nom.avatarUrl}
                    alt={nom.fullName}
                    className="w-9 h-9 rounded-lg object-cover border border-zinc-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-zinc-200 hover:text-amber-300 transition-colors truncate">
                      {nom.fullName}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate">
                      GTA: @{nom.gtaHandle}
                    </div>
                    <div className="mt-0.5">
                      <RankBadge rank="No Man" size="sm" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleApprove(nom.id)}
                  className="w-full sm:w-auto px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded shadow flex items-center justify-center gap-1 font-mono shrink-0 transition-colors"
                >
                  <CheckCircle2 size={12} />
                  <span>Approve & Be Third Eye</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL FAMILY SPONSORS & RECRUIT MAP */}
      <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="border-b border-zinc-800 pb-2.5">
          <h3 className="font-cinzel text-sm font-bold text-zinc-100">
            Family Sponsorship Roster & Lineage
          </h3>
          <p className="text-[11px] text-zinc-400 font-mono">
            Complete mapping of all O.G, Lord, Ghost, Don, Honcho and AB Third Eye mentors and their recruits.
          </p>
        </div>

        <div className="space-y-3">
          {mentors.map((mentor) => {
            const proteges = users.filter((u) => u.approvedByUserId === mentor.id);

            return (
              <div
                key={mentor.id}
                className="p-3.5 rounded-lg bg-[#050505] border border-zinc-800 space-y-2.5 overflow-hidden"
              >
                {/* Mentor Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-zinc-800 pb-2.5">
                  <div
                    className="flex items-start sm:items-center gap-2.5 cursor-pointer group min-w-0 flex-1 w-full"
                    onClick={() => setSelectedProfileUser(mentor)}
                  >
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.fullName}
                      className="w-9 h-9 rounded-lg object-cover border border-amber-500/40 group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{mentor.fullName}</span>
                        <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 text-amber-400 shrink-0" />
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono truncate">
                        GTA: @{mentor.gtaHandle}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <RankBadge rank={mentor.rank} size="sm" />
                        {mentor.specialTitles?.map((t) => (
                          <SpecialTitleBadge key={t} title={t} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-[10px] font-mono text-zinc-400 bg-[#090c13] px-2 py-0.5 rounded border border-zinc-800 shrink-0 self-start sm:self-auto">
                    <span className="text-indigo-300 font-bold">{proteges.length}</span> Proteges Assigned
                  </div>
                </div>

                {/* Assigned Proteges List */}
                {proteges.length === 0 ? (
                  <div className="text-[10px] text-zinc-500 italic pl-1 font-mono">
                    No active proteges assigned currently.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-0.5">
                      {(expandedMentors[mentor.id] ? proteges : proteges.slice(0, 5)).map((p) => {
                        const days = p.simulatedDaysPassed || 1;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedProfileUser(p)}
                            className="p-2 bg-[#090c13] hover:bg-zinc-900 rounded border border-zinc-800 cursor-pointer flex items-center justify-between gap-1.5 group transition-all min-w-0"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <img
                                src={p.avatarUrl}
                                alt={p.fullName}
                                className="w-6 h-6 rounded-full object-cover border border-zinc-700 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-semibold text-zinc-200 group-hover:text-amber-300 truncate">
                                  {p.fullName}
                                </div>
                                <div className="text-[9px] text-zinc-400 font-mono truncate">
                                  {p.rank}
                                </div>
                              </div>
                            </div>

                            {p.rank === 'New Born' && (
                              <span className="text-[9px] font-mono bg-amber-950/70 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30 shrink-0 whitespace-nowrap">
                                Day {days}/31
                              </span>
                            )}
                            {p.rank === 'Junior Boss (31-JB)' && (
                              <span className="text-[9px] font-mono bg-teal-950/70 text-teal-300 px-1 py-0.2 rounded border border-teal-500/30 shrink-0 whitespace-nowrap">
                                31-JB
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {proteges.length > 5 && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => toggleExpandMentor(mentor.id)}
                          className="px-2.5 py-1 text-[11px] font-mono font-medium rounded bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 hover:border-amber-400/60 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span>
                            {expandedMentors[mentor.id]
                              ? 'Show fewer'
                              : `View all (${proteges.length}) proteges`}
                          </span>
                          <ArrowRight
                            size={12}
                            className={`transition-transform duration-200 ${
                              expandedMentors[mentor.id] ? '-rotate-90' : 'rotate-90'
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
