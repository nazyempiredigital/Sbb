import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge, SpecialTitleBadge, CouncilBadge, getRankVisualInfo } from './RankBadge';
import { RANK_LEVELS } from '../types';
import {
  Shield,
  Eye,
  Flame,
  Crown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Award,
  AlertTriangle,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Radio,
  BookOpen,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenDenounceModal: () => void;
  onNavigateToChat: (roomId?: string) => void;
  onNavigateToCreed: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenDenounceModal,
  onNavigateToChat,
  onNavigateToCreed,
  onNavigateToTab,
}) => {
  const {
    currentUser,
    users,
    events,
    announcements,
    approveRecruit,
    makeJuniorBossM19,
    advanceNewBornDays,
    toggleRsvp,
    setSelectedProfileUser,
    createEvent,
    loginUser,
    setIsQuickActionsOpen,
    canAccessAdmin,
    isAboveFounders,
  } = useFamily();

  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('Starfish Island Grand Sanctuary');
  const [newEventCategory, setNewEventCategory] = useState<'M19_CEREMONY' | 'RP_CONVOY' | 'WAR_COUNCIL'>('M19_CEREMONY');
  const [isMandatory, setIsMandatory] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (!currentUser) {
    return (
      <div className="space-y-4">
        {/* Logged Out Welcome Banner */}
        <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#050505] rounded-lg border border-amber-500/40 text-amber-400">
                  <Crown size={18} />
                </span>
                <h1 className="font-cinzel text-lg sm:text-xl font-bold text-zinc-100">
                  SBB Royal Mafia Syndicate • Portal Access
                </h1>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                You are currently logged out. Authenticate with a member dossier or select an RP persona below.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono px-2 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded">
                STATUS: LOGGED OUT
              </span>
            </div>
          </div>
        </div>

        {/* Quick Persona Login Selection Grid */}
        <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-3">
          <div className="border-b border-zinc-800 pb-2">
            <h3 className="font-cinzel text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Select Active Member Dossier to Log In</span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">
              Choose a syndicate operative to resume command with their rank authorizations and dossiers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => loginUser(u.id)}
                className="p-3 bg-[#050505] hover:bg-[#0c0f18] border border-zinc-800 hover:border-amber-500/40 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-2.5 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={u.avatarUrl}
                    alt={u.fullName}
                    className="w-10 h-10 rounded-lg object-cover border border-zinc-700 group-hover:border-amber-500/50 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                      {u.fullName}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate">
                      @{u.gtaHandle}
                    </div>
                    <div className="mt-0.5">
                      <RankBadge rank={u.rank} size="sm" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loginUser(u.id);
                  }}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 font-mono text-[11px] font-bold rounded border border-amber-500/30 transition-colors shrink-0"
                >
                  Log In
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Public Announcements & Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 shadow-xl space-y-2.5">
            <h3 className="font-cinzel text-sm font-bold text-zinc-100 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
              <BookOpen size={14} className="text-amber-400" />
              <span>Public Family Decrees</span>
            </h3>
            <div className="space-y-2">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-2.5 bg-[#050505] rounded border border-zinc-800 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-amber-400">
                    <span className="font-bold">{ann.title}</span>
                    <span className="text-zinc-500">{ann.date}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 shadow-xl space-y-2.5">
            <h3 className="font-cinzel text-sm font-bold text-zinc-100 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
              <Calendar size={14} className="text-amber-400" />
              <span>Upcoming Syndicate Assemblies</span>
            </h3>
            <div className="space-y-2">
              {events.slice(0, 3).map((evt) => (
                <div key={evt.id} className="p-2.5 bg-[#050505] rounded border border-zinc-800 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold text-zinc-200">{evt.title}</span>
                    <span className="text-amber-400">{evt.date}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">📍 {evt.location}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userRankLevel = RANK_LEVELS[currentUser.rank] || 1;
  const isOGOrHigher = userRankLevel >= 6;

  // Filter recruits who were approved by this user (Third Eyes)
  const myRecruits = users.filter((u) => u.approvedByUserId === currentUser.id);

  // Filter unapproved No Men awaiting approval
  const pendingNoMen = users.filter((u) => u.rank === 'No Man');

  // Days passed calculation for New Borns
  const daysInNewBorn = currentUser.simulatedDaysPassed || 1;
  const daysLeftToM19 = Math.max(0, 31 - daysInNewBorn);
  const isM19Ready = daysInNewBorn >= 31;

  const handleApprove = (recruitId: string) => {
    const res = approveRecruit(recruitId);
    setActionFeedback({
      msg: res.message,
      type: res.success ? 'success' : 'error',
    });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleM19Ceremony = (recruitId: string) => {
    const res = makeJuniorBossM19(recruitId);
    setActionFeedback({
      msg: res.message,
      type: res.success ? 'success' : 'error',
    });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    createEvent({
      title: newEventTitle.trim(),
      category: newEventCategory,
      description: newEventDesc.trim() || 'Official SBB Family Event for GTA VI Roleplay.',
      scheduledFor: new Date(Date.now() + 86400000 * 3).toISOString(),
      location: newEventLocation,
      isMandatoryForNewBorns: isMandatory,
    });

    setShowEventModal(false);
    setNewEventTitle('');
    setNewEventDesc('');
    setActionFeedback({
      msg: 'Event / M19 Announcement successfully broadcasted!',
      type: 'success',
    });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              : 'bg-red-950/80 border-red-500/60 text-red-200'
          }`}
        >
          <span>{actionFeedback.msg}</span>
          <button onClick={() => setActionFeedback(null)} className="text-xs opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Hero Dossier Card */}
      <div className="relative rounded-xl bg-[#090c13] border border-zinc-800 p-4 sm:p-5 shadow-2xl overflow-hidden">
        {/* Background watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none text-amber-300 font-cinzel text-9xl select-none">
          SBB
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
          {/* User Meta */}
          {(() => {
            const visual = getRankVisualInfo(currentUser.rank);
            return (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative group">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 ${visual.avatarHaloClass} shadow-lg`}
                  />
                  <button
                    onClick={() => setSelectedProfileUser(currentUser)}
                    className="absolute inset-0 bg-black/70 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] font-mono font-semibold text-amber-300 transition-opacity"
                  >
                    Inspect Dossier
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <RankBadge rank={currentUser.rank} size="md" showLevel withShimmer />
                    {currentUser.specialTitles?.map((t) => (
                      <SpecialTitleBadge key={t} title={t} size="sm" />
                    ))}
                  </div>

                  <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-zinc-100 tracking-wide">
                    {currentUser.fullName}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono">
                    <span className="bg-[#050505] px-2 py-0.5 rounded border border-zinc-800 text-amber-400">
                      GTA VI: {currentUser.gtaHandle}
                    </span>
                    <span className="bg-[#050505] px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                      Discord: {currentUser.discordTag}
                    </span>
                  </div>

                  {currentUser.councilAssignments && currentUser.councilAssignments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {currentUser.councilAssignments.map((ca) => (
                        <CouncilBadge key={ca.councilId} title={ca.title} domaineName={ca.domaineName} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Quick Actions & Status */}
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setSelectedProfileUser(currentUser)}
              className="flex-1 md:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Shield size={14} />
              <span>Full Family Profile</span>
            </button>

            <button
              onClick={onOpenDenounceModal}
              className="px-3.5 py-1.5 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-200 border border-red-500/30 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertTriangle size={12} className="text-red-400" />
              <span>Denounce</span>
            </button>
          </div>
        </div>

        {/* PROMINENT REQUIREMENT: "Recruits should be able to see the name of the person who accepted them (as: Name, rank, Made You) on their dashboard." */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Made You / Sponsor Card */}
          <div className="bg-[#05070c] border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Crown size={16} />
              </div>
              <div>
                <div className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">
                  Family Lineage & Sponsor
                </div>
                {currentUser.approvedByName ? (
                  <div className="text-xs font-semibold text-zinc-200 mt-0.5">
                    {/* Exact format required: Name, rank, Made You */}
                    <span className="text-amber-200 font-bold">{currentUser.approvedByName}</span>,{' '}
                    <span className="text-zinc-300">{currentUser.approvedByRank}</span>,{' '}
                    <span className="text-amber-400 font-bold italic tracking-wide">Made You</span>
                  </div>
                ) : currentUser.rank === 'No Man' ? (
                  <div className="text-[11px] text-amber-400/90 italic mt-0.5">
                    Awaiting approval by an O.G or higher rank to assign your sponsor.
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-amber-300 mt-0.5">
                    Founding High Council of SBB
                  </div>
                )}
              </div>
            </div>

            {currentUser.approvedByUserId && (
              <button
                onClick={() => {
                  const sponsor = users.find((u) => u.id === currentUser.approvedByUserId);
                  if (sponsor) setSelectedProfileUser(sponsor);
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono flex items-center gap-1 shrink-0"
              >
                View Sponsor <ChevronRight size={11} />
              </button>
            )}
          </div>

          {/* Third Eye Status / Recruits Overview */}
          <div className="bg-[#05070c] border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Eye size={16} />
              </div>
              <div>
                <div className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">
                  Third Eye Network Status
                </div>
                <div className="text-xs font-semibold text-zinc-200 mt-0.5">
                  {isOGOrHigher
                    ? `${myRecruits.length} Recruits Under Your Third Eye Watch`
                    : currentUser.rank === 'New Born'
                    ? `Under the Third Eye of ${currentUser.approvedByName || 'Sponsor'}`
                    : currentUser.rank === 'No Man'
                    ? 'Recruit (No Man) - Awaiting Third Eye Sponsor'
                    : 'Brotherhood Full Member'}
                </div>
              </div>
            </div>

            {isOGOrHigher && (
              <span className="text-[10px] font-mono bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/40 shrink-0">
                O.G+ Oversight
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SPECIAL NOTICE FOR NO MAN: Until approval is given, the recruit remains a No Man */}
      {currentUser.rank === 'No Man' && (
        <div className="rounded-xl bg-[#0d0f17] border border-amber-500/40 p-4 sm:p-5 shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-400 shrink-0">
              <Clock size={20} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                  RECRUIT STANDING: NO MAN
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 font-cinzel">
                Until approval is given, you remain a No Man.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Welcome to SBB (Successful Bad Boys). In our Family, new members (No Man) must be approved
                by an <strong>O.G (Original Gentleman)</strong> or higher rank before upgrading to a{' '}
                <strong>New Born</strong>. When approved, the person who approved you will serve as your{' '}
                <strong>Third Eye</strong>, and your Day 1 will begin.
              </p>
              <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onNavigateToChat('room-recruit-gate')}
                  className="px-3.5 py-1.5 bg-amber-500 text-zinc-950 font-bold text-xs rounded-lg hover:bg-amber-400 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Radio size={13} />
                  Introduce Yourself in The Gate Lounge
                </button>
                <button
                  onClick={onNavigateToCreed}
                  className="px-3.5 py-1.5 bg-zinc-900 text-zinc-300 text-xs rounded-lg hover:bg-zinc-800 flex items-center gap-1.5 transition-colors border border-zinc-700"
                >
                  <BookOpen size={13} />
                  Read The SBB Family Creed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROMINENT REQUIREMENT: 31-DAY COUNTDOWN & M19 EXPLAINER FOR NEW BORN */}
      {currentUser.rank === 'New Born' && (
        <div className="rounded-xl bg-[#0a0d14] border border-amber-500/40 p-4 sm:p-5 shadow-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-400">
                <Flame size={20} />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-amber-300">
                  New Born Initiation Phase – 31-Day Crucible
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Day 1 began on approval. Under the Third Eye of {currentUser.approvedByName || 'Your Sponsor'}.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xl font-bold font-mono text-amber-400">
                Day {daysInNewBorn} / 31
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                {isM19Ready ? '🎉 31 Days Complete!' : `${daysLeftToM19} days remaining until M19`}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-[#050505] rounded-full h-3 border border-zinc-800 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (daysInNewBorn / 31) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 px-1">
              <span>Day 1 (Approval & Confirmation)</span>
              <span className="text-amber-300 font-bold">
                {daysInNewBorn >= 31 ? 'Day 31 Reached (M19 Ready)' : `Day ${daysInNewBorn}`}
              </span>
              <span className="text-amber-400">Day 31 (M19 Ceremony)</span>
            </div>
          </div>

          {/* The Mandated Clarification Box */}
          <div className="p-3.5 bg-[#05070c] rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed space-y-1.5">
            <p className="font-semibold text-amber-300 flex items-center gap-1.5 font-mono text-[11px]">
              <Sparkles size={13} className="text-amber-400" />
              THE FAMILY DOCTRINE ON CONFIRMATION VS. BEING MADE:
            </p>
            <p>
              "Being approved signifies the Family’s acceptance of a No Man as a New Born, marking the beginning of their membership. 
              <strong> This confirmation is separate from Being Made.</strong> Being Made is the act of becoming a full member through the M19 ceremony hosted strictly on the <strong>31st day, not the 30th</strong>. 
              Being Made certifies standing and confers the first rank: <strong>Junior Boss (31-JB)</strong>."
            </p>
            <p className="italic text-zinc-400 text-[11px]">
              "Being confirmed as a New Born and Being Made are two completely different stages of membership and shall never be treated as the same process."
            </p>
          </div>

          {/* Testing helper buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-xs">
            <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
              <Clock size={11} className="text-amber-400" />
              <span>Interactive Day Simulator:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => advanceNewBornDays(currentUser.id, 1)}
                className={`px-2 py-0.5 rounded text-xs border font-mono transition-colors ${
                  daysInNewBorn === 1 ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border-zinc-700'
                }`}
              >
                Day 1
              </button>
              <button
                onClick={() => advanceNewBornDays(currentUser.id, 15)}
                className={`px-2 py-0.5 rounded text-xs border font-mono transition-colors ${
                  daysInNewBorn === 15 ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border-zinc-700'
                }`}
              >
                Day 15
              </button>
              <button
                onClick={() => advanceNewBornDays(currentUser.id, 31)}
                className={`px-2.5 py-0.5 rounded text-xs border font-mono font-bold transition-colors ${
                  daysInNewBorn === 31
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-amber-950/60 border-amber-500/60 text-amber-300 hover:bg-amber-900/60'
                }`}
              >
                Day 31 (M19 Ready!)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* O.G+ SECTION: THIRD EYES & PENDING RECRUITS MANAGEMENT */}
      {isOGOrHigher && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* My Recruits / Third Eyes List */}
          <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-950/80 rounded-lg border border-indigo-500/40 text-indigo-300">
                  <Eye size={16} />
                </div>
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-zinc-100">
                    My Recruits & Protégés ({myRecruits.length})
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Recruits you approved for whom you serve as Third Eye.
                  </p>
                </div>
              </div>
            </div>

            {myRecruits.length === 0 ? (
              <div className="p-5 text-center text-zinc-500 text-xs italic bg-[#050505] rounded-lg border border-zinc-800">
                You currently have no assigned recruits. Approve pending No Men below to sponsor them!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {myRecruits.map((recruit) => {
                  const days = recruit.simulatedDaysPassed || 1;
                  const readyForM19 = recruit.rank === 'New Born' && days >= 31;

                  return (
                    <div
                      key={recruit.id}
                      className="p-3 bg-[#05070c] hover:bg-zinc-900/60 rounded-lg border border-zinc-800 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                    >
                      <div
                        className="flex items-center gap-2.5 cursor-pointer group"
                        onClick={() => setSelectedProfileUser(recruit)}
                      >
                        <img
                          src={recruit.avatarUrl}
                          alt={recruit.fullName}
                          className="w-9 h-9 rounded-lg object-cover border border-amber-500/40 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                            <span>{recruit.fullName}</span>
                            <ExternalLink size={10} className="text-amber-400" />
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            @{recruit.gtaHandle}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <RankBadge rank={recruit.rank} size="sm" />
                            {recruit.rank === 'New Born' && (
                              <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                                Day {days}/31
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                        {readyForM19 && (
                          <button
                            onClick={() => handleM19Ceremony(recruit.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 animate-pulse"
                          >
                            <Award size={12} />
                            <span>Conduct M19 (Make 31-JB)</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedProfileUser(recruit)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg border border-zinc-700"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending No Men at The Gate */}
          <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-300">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-zinc-100">
                    The Gate: Pending No Men ({pendingNoMen.length})
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Awaiting O.G or higher approval to become a New Born.
                  </p>
                </div>
              </div>
            </div>

            {pendingNoMen.length === 0 ? (
              <div className="p-5 text-center text-zinc-500 text-xs italic bg-[#050505] rounded-lg border border-zinc-800">
                No recruits currently waiting at The Gate. All aspirants have been processed.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {pendingNoMen.map((nom) => (
                  <div
                    key={nom.id}
                    className="p-3 bg-[#05070c] rounded-lg border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                  >
                    <div
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => setSelectedProfileUser(nom)}
                    >
                      <img
                        src={nom.avatarUrl}
                        alt={nom.fullName}
                        className="w-9 h-9 rounded-lg object-cover border border-zinc-700 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-200 hover:text-amber-300 transition-colors">
                          {nom.fullName}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          @{nom.gtaHandle}
                        </div>
                        <div className="mt-0.5">
                          <RankBadge rank="No Man" size="sm" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleApprove(nom.id)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 transition-all"
                      >
                        <CheckCircle2 size={12} />
                        <span>Approve as New Born</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GENERAL INFO & EVENTS SECTION (With M19 Announcements) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Family Announcements Board (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl bg-[#090c13] border border-zinc-800 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-300">
                <Crown size={16} />
              </div>
              <div>
                <h3 className="font-cinzel text-sm font-bold text-zinc-100">
                  Family General Info & Decrees
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Official standards, rule mandates, and Family broadcasts.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToCreed}
              className="text-xs text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1"
            >
              Full Creed <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  ann.priority === 'CRITICAL'
                    ? 'bg-[#150a0a] border-red-900/60 text-red-100'
                    : ann.priority === 'IMPORTANT'
                    ? 'bg-[#141006] border-amber-900/60 text-amber-100'
                    : 'bg-[#05070c] border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                        ann.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : ann.priority === 'IMPORTANT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wide font-cinzel text-zinc-100">
                      {ann.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{ann.date}</span>
                </div>

                <p className="text-xs leading-relaxed text-zinc-300">{ann.content}</p>

                <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>
                    Decreed by: <strong className="text-zinc-200">{ann.author}</strong> ({ann.authorRank})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events & M19 Ceremony Scheduler (1 Col) */}
        <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-amber-400" />
              <h3 className="font-cinzel text-sm font-bold text-zinc-100">Upcoming Events</h3>
            </div>

            {isOGOrHigher && (
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 transition-colors"
              >
                <PlusCircle size={11} />
                Announce
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {events.map((evt) => {
              const hasRsvped = currentUser ? evt.rsvps.includes(currentUser.id) : false;
              const isM19 = evt.category === 'M19_CEREMONY';

              return (
                <div
                  key={evt.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isM19
                      ? 'bg-[#0f1118] border-amber-500/40'
                      : 'bg-[#05070c] border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {isM19 && (
                        <span className="inline-block text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold mb-1">
                          👑 M19 Induction Rite
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-zinc-100">{evt.title}</h4>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>

                  <div className="mt-2 text-[10px] font-mono text-zinc-400 space-y-0.5">
                    <div>📍 {evt.location}</div>
                    <div>🕒 {new Date(evt.scheduledFor).toLocaleDateString()} at 20:00 UTC</div>
                  </div>

                  {evt.isMandatoryForNewBorns && (
                    <div className="mt-1.5 text-[9px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 font-mono">
                      <AlertCircle size={10} className="shrink-0" />
                      <span>Compulsory for Day 31 New Borns</span>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {evt.rsvps.length} RSVPed
                    </span>
                    <button
                      onClick={() => toggleRsvp(evt.id)}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        hasRsvped
                          ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      {hasRsvped ? '✓ RSVPed' : '+ RSVP'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EVENT CREATION MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111420] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-cinzel text-lg font-bold text-amber-200">
                Announce Family Event / M19 Ceremony
              </h3>
              <button onClick={() => setShowEventModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. M19 Induction Ceremony on the 31st Day"
                  required
                  className="w-full px-3 py-2 bg-black/60 border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Category</label>
                <select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-black/60 border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="M19_CEREMONY">M19 Ceremony (31-JB Induction)</option>
                  <option value="RP_CONVOY">GTA VI Roleplay Convoy</option>
                  <option value="WAR_COUNCIL">War Council & High Table</option>
                  <option value="DOMAINE_MEET">Domaine & Regional Meet</option>
                  <option value="FAMILY_SUMMIT">Family Summit</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Location / GTA Server</label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="e.g. Starfish Island Grand Sanctuary (GTA VI RP Server 1)"
                  className="w-full px-3 py-2 bg-black/60 border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Description & Protocol</label>
                <textarea
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  rows={3}
                  placeholder="Official Family ceremony and induction of eligible New Borns on their 31st day..."
                  className="w-full px-3 py-2 bg-black/60 border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-black"
                />
                <label htmlFor="mandatoryCheck" className="text-zinc-300 text-xs cursor-pointer">
                  Compulsory for all New Borns completing their 31st day
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 text-zinc-950 font-bold hover:from-amber-500 hover:to-amber-600"
                >
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
