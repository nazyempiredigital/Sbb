import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { CouncilBadge, RankBadge, SpecialTitleBadge } from './RankBadge';
import { CouncilTitle, RANK_LEVELS, TerritoryType, User, DomaineCouncil } from '../types';
import {
  Crown,
  MapPin,
  Users,
  Shield,
  PlusCircle,
  Award,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Swords,
  Layers,
  AlertTriangle,
  Building2,
  Compass,
  Vote,
  Clock,
  Sparkles,
  UserCheck,
  UserX,
  History,
  ShieldAlert,
  Send,
  XCircle,
  UserPlus,
  Edit3,
  Trash2,
  Save,
  RotateCcw,
} from 'lucide-react';

export const CouncilsView: React.FC = () => {
  const {
    currentUser,
    councils,
    users,
    createRegion,
    createDomaine,
    updateCouncil,
    deleteCouncil,
    appointCustodian,
    removeCustodian,
    appointCouncilElder,
    removeCouncilElder,
    voteForNextLeader,
    concludeTenureAndElectNextLeader,
    amRequests,
    sendAmA13Request,
    respondToAmA13Request,
    cancelAmA13Assignment,
    setSelectedProfileUser,
    canAccessAdmin,
  } = useFamily();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'REGION' | 'DOMAINE' | 'AM_A13'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustodianModal, setShowCustodianModal] = useState<string | null>(null);
  const [showAmRequestModal, setShowAmRequestModal] = useState(false);
  const [selectedCouncilForElections, setSelectedCouncilForElections] = useState<string | null>(null);

  // Form states for creating a territory/council
  const [territoryType, setTerritoryType] = useState<TerritoryType>('REGION');
  const [councilName, setCouncilName] = useState('');
  const [parentRegionName, setParentRegionName] = useState('');
  const [description, setDescription] = useState('');
  const [territorySector, setTerritorySector] = useState('');

  // Form states for editing an existing territory/council
  const [editingCouncil, setEditingCouncil] = useState<DomaineCouncil | null>(null);
  const [editName, setEditName] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editParentRegion, setEditParentRegion] = useState('');
  const [editLeaderUserId, setEditLeaderUserId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Custodian appointment state
  const [selectedCustodianUserId, setSelectedCustodianUserId] = useState('');

  // AM/A13 Request state
  const [selectedAmTargetUserId, setSelectedAmTargetUserId] = useState('');

  // Toast feedback state
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const userLevel = RANK_LEVELS[currentUser?.rank || 'No Man'] || 1;
  const isHonchoOrGhost = currentUser?.rank === 'Honcho (King)' || currentUser?.rank === 'Ghost (007)' || currentUser?.isAdmin;
  const canEstablishTerritory = isHonchoOrGhost;
  const canManageTerritories = isHonchoOrGhost || canAccessAdmin(currentUser) || userLevel >= 6;
  const isBossOrHigher = userLevel >= 4;

  const grandRegions = councils.filter((c) => c.type === 'REGION');
  const grandDomaines = councils.filter((c) => c.type === 'DOMAINE');

  const filteredCouncils = councils.filter((c) => {
    if (activeFilter === 'REGION') return c.type === 'REGION';
    if (activeFilter === 'DOMAINE') return c.type === 'DOMAINE';
    return true;
  });

  // Available 31-JBs with custodian assignment status across all territories
  const juniorBossesWithStatus = users
    .filter((u) => u.rank === 'Junior Boss (31-JB)' && !u.isBanned)
    .map((jb) => {
      const assignedCouncil = councils.find((c) => (c.custodianUserIds || []).includes(jb.id));
      return {
        user: jb,
        assignedCouncil,
        isAssignedToCurrentModal: assignedCouncil?.id === showCustodianModal,
        isAssignedElsewhere: Boolean(assignedCouncil && assignedCouncil.id !== showCustodianModal),
      };
    });

  const availableUnassignedJBs = juniorBossesWithStatus.filter(
    (item) => !item.assignedCouncil || item.isAssignedToCurrentModal
  );

  // Available lower rank targets for AM/A13 requests
  const eligibleAmTargets = users.filter((u) => {
    if (u.id === currentUser?.id || u.isBanned) return false;
    const targetLevel = RANK_LEVELS[u.rank] || 1;
    // Lower rank than current user
    return targetLevel < userLevel && !u.myAmInfo;
  });

  // Pending AM requests for current user
  const incomingAmRequests = amRequests.filter(
    (r) => r.targetUserId === currentUser?.id && r.status === 'PENDING'
  );
  const outgoingAmRequests = amRequests.filter(
    (r) => r.requesterUserId === currentUser?.id && r.status === 'PENDING'
  );

  const openEditModal = (council: DomaineCouncil) => {
    setEditingCouncil(council);
    setEditName(council.name);
    setEditSector(council.territorySector || '');
    setEditDescription(council.description || '');
    setEditParentRegion(council.regionName || '');
    setEditLeaderUserId(council.leaderUserId || '');
    setShowDeleteConfirm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCouncil || !editName.trim()) return;

    const res = updateCouncil(editingCouncil.id, {
      name: editName.trim(),
      description: editDescription.trim(),
      territorySector: editSector.trim(),
      regionName: editingCouncil.type === 'DOMAINE' ? editParentRegion.trim() : undefined,
      leaderUserId: editLeaderUserId,
    });

    setFeedback({ message: res.message, isError: !res.success });
    if (res.success) {
      setEditingCouncil(null);
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleDeleteCouncilSubmit = (councilId: string) => {
    const res = deleteCouncil(councilId);
    setFeedback({ message: res.message, isError: !res.success });
    setEditingCouncil(null);
    setShowDeleteConfirm(false);
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!councilName.trim()) return;

    if (!canEstablishTerritory) {
      setFeedback({
        message: 'Only Honcho (King) or Ghost (007) can establish a Region or Domaine.',
        isError: true,
      });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    let res: { success: boolean; message: string };

    if (territoryType === 'REGION') {
      res = createRegion(councilName.trim(), description.trim(), territorySector.trim());
    } else {
      if (!parentRegionName.trim()) {
        setFeedback({ message: 'A parent Region must be specified for a Domaine.', isError: true });
        setTimeout(() => setFeedback(null), 4000);
        return;
      }
      res = createDomaine(councilName.trim(), parentRegionName.trim(), description.trim(), territorySector.trim());
    }

    setShowCreateModal(false);
    setCouncilName('');
    setParentRegionName('');
    setDescription('');
    setTerritorySector('');

    setFeedback({ message: res.message, isError: !res.success });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleAppointCustodianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCustodianModal || !selectedCustodianUserId) return;

    const res = appointCustodian(showCustodianModal, selectedCustodianUserId);
    setShowCustodianModal(null);
    setSelectedCustodianUserId('');
    setFeedback({ message: res.message, isError: !res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSendAmRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmTargetUserId) return;

    const res = sendAmA13Request(selectedAmTargetUserId);
    setShowAmRequestModal(false);
    setSelectedAmTargetUserId('');
    setFeedback({ message: res.message, isError: !res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleVoteSubmit = (councilId: string, candidateUserId: string) => {
    const res = voteForNextLeader(councilId, candidateUserId);
    setFeedback({ message: res.message, isError: !res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleConcludeTenure = (councilId: string) => {
    const res = concludeTenureAndElectNextLeader(councilId);
    setFeedback({ message: res.message, isError: !res.success });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-xl font-mono border transition-all animate-fade-in ${
            feedback.isError
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200'
              : 'bg-amber-950/90 border-amber-500/80 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {feedback.isError ? (
              <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
            )}
            <span className="break-words">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 ml-3 px-1.5 py-0.5 rounded hover:bg-black/40 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-[#090c13] border border-zinc-800 p-4 sm:p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Crown size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="font-cinzel text-lg sm:text-xl md:text-2xl font-bold text-zinc-100 tracking-wide break-words">
                Regions & Domaines Sovereign Command
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-zinc-400 font-mono mt-0.5">
                <span>Territorial Sovereign Hierarchy</span>
                <span>•</span>
                <span>1-Year Succession Elections</span>
                <span>•</span>
                <span>31-JB Custodians</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
          {isBossOrHigher && (
            <button
              onClick={() => setShowAmRequestModal(true)}
              className="flex-1 lg:flex-initial px-3.5 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/50 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all font-mono"
            >
              <Send size={14} className="text-indigo-400" />
              Request AM/A13
            </button>
          )}

          {canEstablishTerritory && (
            <button
              onClick={() => {
                setTerritoryType('REGION');
                setShowCreateModal(true);
              }}
              className="flex-1 lg:flex-initial px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all font-mono active:scale-95"
            >
              <PlusCircle size={15} />
              Establish Sovereign Territory
            </button>
          )}
        </div>
      </div>

      {/* SBB Hierarchy Laws & Doctrine */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 min-w-0">
        {/* Region Law Box */}
        <div className="rounded-xl bg-gradient-to-br from-amber-950/40 via-[#0a0d16] to-[#07090e] border border-amber-500/40 p-4 space-y-2 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Crown size={16} />
              </div>
              <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                1. Grand Regions (12 Lords)
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-bold">
              Level 7
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Established by Honcho or Ghost. Automatically assigned <strong className="text-amber-300">12 Lords</strong> as Regional Council Elders. Eldest Lord by registration becomes <strong className="text-amber-200">Supreme Lord</strong> for a 1-year tenure. Successor is elected by the 11 elders.
          </p>
          <div className="text-[10px] font-mono text-amber-400/90 pt-1 border-t border-amber-500/20">
            ★ Former Supreme Lord receives permanent title: <strong>"Caesar"</strong>
            <br />★ 11 Elders receive permanent title: <strong>"Ash Lord"</strong>
          </div>
        </div>

        {/* Domaine Law Box */}
        <div className="rounded-xl bg-gradient-to-br from-indigo-950/40 via-[#0a0d16] to-[#07090e] border border-indigo-500/40 p-4 space-y-2 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Swords size={16} />
              </div>
              <span className="font-cinzel text-xs font-bold text-indigo-300 uppercase tracking-wider">
                2. District Domaines (9 O.Gs)
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 font-bold">
              Level 6
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Established by Honcho or Ghost under a parent Region. Automatically assigned <strong className="text-indigo-300">9 O.Gs</strong> as Domaine Council Elders. Eldest O.G by registration becomes <strong className="text-indigo-200">High Chief</strong> for a 1-year tenure.
          </p>
          <div className="text-[10px] font-mono text-indigo-400/90 pt-1 border-t border-indigo-500/20">
            ★ After 1-year tenure: Former High Chief & 8 Domaine Elders are upgraded to <strong>Lord</strong> rank!
          </div>
        </div>

        {/* Custodian & AM/A13 Law Box */}
        <div className="rounded-xl bg-gradient-to-br from-teal-950/40 via-[#0a0d16] to-[#07090e] border border-teal-500/40 p-4 space-y-2 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                <Shield size={16} />
              </div>
              <span className="font-cinzel text-xs font-bold text-teal-300 uppercase tracking-wider">
                3. Custodians & AM/A13
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-teal-500/20 text-teal-300 rounded border border-teal-500/30 font-bold">
              Level 3+
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            <strong className="text-teal-300">Custodians:</strong> Strictly appointed from <strong>Junior Boss (31-JB)</strong> to guard territories. If promoted, the position automatically becomes vacant.
          </p>
          <div className="text-[10px] font-mono text-teal-400/90 pt-1 border-t border-teal-500/20">
            ★ <strong className="text-indigo-300">AM/A13:</strong> Boss+ can request AM/A13 status from lower ranks with acceptance notifications.
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar min-w-0">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-2 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'ALL'
              ? 'bg-zinc-700 text-white font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Layers size={14} />
          <span>All Sovereign Territories ({councils.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('REGION')}
          className={`px-3.5 py-2 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'REGION'
              ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Crown size={14} className="text-amber-400" />
          <span>Grand Regions ({grandRegions.length})</span>
          <span className="text-[10px] opacity-75">(12 Lords)</span>
        </button>

        <button
          onClick={() => setActiveFilter('DOMAINE')}
          className={`px-3.5 py-2 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'DOMAINE'
              ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Swords size={14} className="text-indigo-400" />
          <span>District Domaines ({grandDomaines.length})</span>
          <span className="text-[10px] opacity-75">(9 O.Gs)</span>
        </button>

        <button
          onClick={() => setActiveFilter('AM_A13')}
          className={`px-3.5 py-2 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 shrink-0 sm:ml-auto ${
            activeFilter === 'AM_A13'
              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Sparkles size={14} className="text-purple-400" />
          <span>AM / A13 Directorate</span>
          {incomingAmRequests.length > 0 && (
            <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold animate-pulse">
              {incomingAmRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* AM / A13 Directorate Tab Content */}
      {activeFilter === 'AM_A13' && (
        <div className="space-y-4">
          {/* Pending Incoming Requests */}
          {incomingAmRequests.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/50 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                <h3 className="font-cinzel text-sm font-bold text-purple-200">
                  Incoming AM / A13 Mentorship Requests ({incomingAmRequests.length})
                </h3>
              </div>
              <p className="text-xs text-zinc-300">
                A superior Boss rank operative has formally requested to mentor you under the prestigious AM/A13 doctrine.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incomingAmRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-[#05070c] border border-purple-500/40 rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={req.requesterAvatar}
                        alt={req.requesterName}
                        className="w-10 h-10 rounded-lg object-cover border border-purple-500/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-100 truncate">{req.requesterName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <RankBadge rank={req.requesterRank} size="xs" />
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          const res = respondToAmA13Request(req.id, true);
                          setFeedback({ message: res.message, isError: !res.success });
                          setTimeout(() => setFeedback(null), 4000);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded font-mono"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          const res = respondToAmA13Request(req.id, false);
                          setFeedback({ message: res.message, isError: !res.success });
                          setTimeout(() => setFeedback(null), 4000);
                        }}
                        className="px-2 py-1 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-300 text-xs rounded font-mono"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active AM/A13 Assignments List across Family */}
          <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-indigo-400" />
                <h3 className="font-cinzel text-base font-bold text-zinc-100">
                  Active AM / A13 Mentorship Pairings
                </h3>
              </div>
              {isBossOrHigher && (
                <button
                  onClick={() => setShowAmRequestModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg font-mono flex items-center gap-1"
                >
                  <Send size={12} />
                  <span>Send AM Request</span>
                </button>
              )}
            </div>

            {/* List pairings */}
            {(() => {
              const activePairs = users.filter((u) => u.amAssignments && u.amAssignments.length > 0);

              if (activePairs.length === 0) {
                return (
                  <div className="p-8 text-center space-y-2 text-zinc-500 font-mono text-xs">
                    <Sparkles size={24} className="mx-auto text-zinc-600" />
                    <p>No active AM/A13 mentorship pairings registered yet.</p>
                    <p className="text-[10px] text-zinc-600">
                      Boss rank (Level 4) and above can request AM/A13 status from lower ranks to build tactical brotherhood.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activePairs.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="p-3.5 rounded-xl bg-[#05070c] border border-zinc-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => setSelectedProfileUser(mentor)}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <img
                            src={mentor.avatarUrl}
                            alt={mentor.fullName}
                            className="w-9 h-9 rounded-lg object-cover border border-indigo-500/40 group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300 flex items-center gap-1">
                              <span>{mentor.fullName}</span>
                              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 text-indigo-400" />
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <RankBadge rank={mentor.rank} size="xs" />
                              <span className="text-[10px] text-indigo-400 font-mono">Senior Mentor (AM)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mentee Operatives List */}
                      <div className="space-y-1.5 pl-2 border-l-2 border-indigo-500/30">
                        <div className="text-[10px] uppercase font-mono text-zinc-500">
                          Assigned AM/A13 Operatives ({mentor.amAssignments?.length || 0}):
                        </div>
                        {mentor.amAssignments?.map((assign) => {
                          const menteeUser = users.find((u) => u.id === assign.targetUserId);

                          return (
                            <div
                              key={assign.targetUserId}
                              className="p-2 bg-[#090c13] rounded-lg border border-zinc-800/80 flex items-center justify-between gap-2"
                            >
                              <div
                                onClick={() => menteeUser && setSelectedProfileUser(menteeUser)}
                                className="flex items-center gap-2 cursor-pointer min-w-0 flex-1 group"
                              >
                                {menteeUser && (
                                  <img
                                    src={menteeUser.avatarUrl}
                                    alt={menteeUser.fullName}
                                    className="w-7 h-7 rounded-md object-cover border border-zinc-700 shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-zinc-300 group-hover:text-indigo-300 truncate">
                                    {assign.targetName}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                                    <RankBadge rank={assign.targetRank} size="xs" />
                                    <span>Since {new Date(assign.assignedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>

                              {(currentUser?.id === mentor.id ||
                                currentUser?.id === assign.targetUserId ||
                                canAccessAdmin(currentUser)) && (
                                <button
                                  onClick={() => {
                                    const res = cancelAmA13Assignment(assign.targetUserId);
                                    setFeedback({ message: res.message, isError: !res.success });
                                    setTimeout(() => setFeedback(null), 4000);
                                  }}
                                  className="text-[10px] text-red-400 hover:text-red-300 px-2 py-0.5 bg-red-950/40 rounded border border-red-500/30 font-mono shrink-0"
                                  title="Dissolve Mentorship Assignment"
                                >
                                  End AM/A13
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Territorial Cards Grid (Regions & Domaines) */}
      {activeFilter !== 'AM_A13' && (
        <div className="space-y-6">
          {filteredCouncils.length === 0 ? (
            <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-12 text-center space-y-3">
              <Building2 size={32} className="mx-auto text-zinc-600" />
              <h3 className="font-cinzel text-base font-bold text-zinc-300">
                No Territories Found
              </h3>
              <p className="text-xs text-zinc-500 font-mono max-w-md mx-auto">
                No territories match the selected filter. Honcho (King) or Ghost (007) can establish sovereign Regions and Domaines.
              </p>
              {canEstablishTerritory && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl font-mono"
                >
                  Establish First Territory
                </button>
              )}
            </div>
          ) : (
            filteredCouncils.map((council) => {
              const isRegion = council.type === 'REGION';
              const maxElders = isRegion ? 12 : 9;
              const leaderUser = users.find((u) => u.id === council.leaderUserId);
              const elders = (council.elderUserIds || [])
                .map((id) => users.find((u) => u.id === id))
                .filter(Boolean) as User[];
              const custodians = (council.custodianUserIds || [])
                .map((id) => users.find((u) => u.id === id))
                .filter(Boolean) as User[];

              // Election candidates (the other elders)
              const candidates = elders.filter((e) => e.id !== council.leaderUserId);
              const votes = council.nextLeaderVotes || {};
              const userVotedCandidateId = currentUser ? votes[currentUser.id] : undefined;

              const isCurrentLeader = currentUser?.id === council.leaderUserId;
              const isElderInThisCouncil = currentUser && council.elderUserIds?.includes(currentUser.id);
              const canConcludeTenure = isCurrentLeader || isHonchoOrGhost || canAccessAdmin(currentUser);

              return (
                <div
                  key={council.id}
                  className={`rounded-2xl bg-[#090c13] border p-5 sm:p-6 shadow-2xl space-y-5 transition-all overflow-hidden ${
                    isRegion
                      ? 'border-amber-500/40 hover:border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.06)]'
                      : 'border-indigo-500/40 hover:border-indigo-500/70'
                  }`}
                >
                  {/* Top Bar: Classification & Mandatory Badge */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {isRegion ? (
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                            <Crown size={13} className="text-amber-400" />
                            Grand Sovereign Region • 12 Lords Capacity
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                            <Swords size={13} className="text-indigo-400" />
                            District Domaine • 9 O.Gs Capacity
                          </span>
                        )}

                        {!isRegion && council.regionName && (
                          <span className="text-[11px] font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800">
                            Parent Region: <strong className="text-amber-300">{council.regionName}</strong>
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-zinc-400 bg-[#050505] px-2 py-0.5 rounded-md border border-zinc-800">
                          {council.territorySector}
                        </span>
                      </div>

                      <h2 className="font-cinzel text-lg sm:text-xl font-bold text-zinc-100 tracking-wide break-words">
                        {council.name}
                      </h2>

                      <p className="text-xs text-zinc-300 leading-relaxed max-w-4xl">
                        {council.description}
                      </p>
                    </div>

                    {/* Actions: Edit & Establishment Record */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
                      {canManageTerritories && (
                        <button
                          onClick={() => openEditModal(council)}
                          className="px-3 py-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-amber-300 border border-zinc-700 hover:border-amber-500/50 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                          title={`Edit ${isRegion ? 'Region' : 'Domaine'} details`}
                        >
                          <Edit3 size={13} className="text-amber-400" />
                          <span>Edit {isRegion ? 'Region' : 'Domaine'}</span>
                        </button>
                      )}

                      {council.establishedByName && (
                        <div className="text-[10px] font-mono text-zinc-400 bg-[#05070c] p-2 rounded-lg border border-zinc-800 shrink-0">
                          <div className="text-zinc-500">Established By:</div>
                          <div className="text-amber-300 font-bold">{council.establishedByName}</div>
                          <div>({council.establishedByRank})</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spotlight: Supreme Lord / High Chief (1-Year Seat) */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isRegion
                        ? 'bg-gradient-to-r from-amber-950/30 via-[#07090e] to-black border-amber-500/30'
                        : 'bg-gradient-to-r from-indigo-950/30 via-[#07090e] to-black border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {leaderUser ? (
                        <>
                          <img
                            src={leaderUser.avatarUrl}
                            alt={leaderUser.fullName}
                            className={`w-14 h-14 rounded-xl object-cover border-2 shadow-lg shrink-0 ${
                              isRegion ? 'border-amber-400' : 'border-indigo-400'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold">
                                {isRegion ? 'Supreme Lord of Region' : 'High Chief of Domaine'}
                              </span>
                              <CouncilBadge title={council.leaderTitle || (isRegion ? 'Supreme Lord' : 'High Chief')} size="sm" />
                            </div>

                            <div
                              onClick={() => setSelectedProfileUser(leaderUser)}
                              className="font-cinzel text-base font-bold text-zinc-100 hover:text-amber-300 cursor-pointer flex items-center gap-1.5 mt-0.5 group"
                            >
                              <span>{leaderUser.fullName}</span>
                              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-amber-400" />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400 mt-1">
                              <RankBadge rank={leaderUser.rank} size="xs" />
                              <span>@{leaderUser.gtaHandle}</span>
                              <span className="text-zinc-500">•</span>
                              <span className="text-amber-400/90 font-bold">
                                Seniority ({new Date(leaderUser.joinedAt || '').toLocaleDateString()})
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs font-mono text-amber-400 flex items-center gap-2">
                          <AlertTriangle size={15} />
                          <span>No {isRegion ? 'Supreme Lord' : 'High Chief'} currently installed in this seat.</span>
                        </div>
                      )}
                    </div>

                    {/* 1-Year Tenure Status Card */}
                    <div className="w-full md:w-auto p-3 bg-[#050505] rounded-xl border border-zinc-800/90 space-y-1.5 shrink-0 text-xs font-mono">
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Clock size={12} className="text-amber-400" />
                          <span>1-Year Term Standing</span>
                        </span>
                        <span className="text-amber-300 font-bold">Active Tenure</span>
                      </div>

                      <div className="text-[10px] text-zinc-400">
                        {council.tenureStartDate
                          ? `Commenced: ${new Date(council.tenureStartDate).toLocaleDateString()}`
                          : 'Standard 365-Day Imperial Term'}
                      </div>

                      {canConcludeTenure && (
                        <button
                          onClick={() => handleConcludeTenure(council.id)}
                          className="w-full mt-1 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold text-[11px] rounded-lg shadow font-mono transition-transform active:scale-95 flex items-center justify-center gap-1"
                        >
                          <Award size={12} />
                          <span>Conclude 1-Year Tenure & Promote</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Elders Council Roster (12 Lords for Region, 9 O.Gs for Domaine) */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className={isRegion ? 'text-amber-400' : 'text-indigo-400'} />
                        <h3 className="font-cinzel text-sm font-bold text-zinc-100">
                          {isRegion ? 'Regional Council Elders (12 Lords)' : 'Domaine Council Elders (9 O.Gs)'}
                        </h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {elders.length} / {maxElders} Seats Filled
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400">
                        {elders.length < maxElders
                          ? `★ Auto-assigns newly promoted ${isRegion ? 'Lords' : 'O.Gs'} to open seats`
                          : 'Full council assembled'}
                      </span>
                    </div>

                    {/* Elders Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {elders.map((elder, idx) => {
                        const isLeader = elder.id === council.leaderUserId;
                        const elderTitle: CouncilTitle = isLeader
                          ? isRegion
                            ? 'Supreme Lord'
                            : 'High Chief'
                          : isRegion
                          ? 'Regional Council Elder'
                          : 'Domaine Council Elder';

                        return (
                          <div
                            key={elder.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                              isLeader
                                ? isRegion
                                  ? 'bg-amber-950/20 border-amber-500/50'
                                  : 'bg-indigo-950/20 border-indigo-500/50'
                                : 'bg-[#05070c] border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            <div
                              onClick={() => setSelectedProfileUser(elder)}
                              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
                            >
                              <img
                                src={elder.avatarUrl}
                                alt={elder.fullName}
                                className={`w-9 h-9 rounded-lg object-cover border shrink-0 ${
                                  isLeader ? 'border-amber-400' : 'border-zinc-700'
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 truncate flex items-center gap-1">
                                  <span>{elder.fullName}</span>
                                  {isLeader && <Crown size={11} className="text-amber-400 shrink-0" />}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-mono truncate">
                                  {elderTitle}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-mono text-zinc-500 block">
                                Joined {new Date(elder.joinedAt || '').toLocaleDateString()}
                              </span>
                              {isLeader && (
                                <span className="text-[9px] font-mono text-amber-400 font-bold">
                                  Leader
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Render empty placeholders for vacant elder seats */}
                      {Array.from({ length: Math.max(0, maxElders - elders.length) }).map((_, i) => (
                        <div
                          key={`vacant-${i}`}
                          className="p-2.5 rounded-xl border border-dashed border-zinc-800 bg-[#05070c]/50 flex items-center justify-between text-zinc-500 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-600">
                              {i + elders.length + 1}
                            </div>
                            <div>
                              <div className="text-[11px] text-zinc-400">Vacant Seat #{elders.length + i + 1}</div>
                              <div className="text-[9px] text-zinc-600">
                                Awaiting new {isRegion ? 'Lord' : 'O.G'} promotion
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Succession Elections Section (11 Elders voting for next Supreme Lord / 8 Elders for High Chief) */}
                  <div className="p-4 rounded-xl bg-[#05070c] border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Vote size={16} className="text-amber-400" />
                        <h4 className="font-cinzel text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                          Succession Democratic Elections (Next {isRegion ? 'Supreme Lord' : 'High Chief'})
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {Object.keys(votes).length} Vote(s) Cast by Council Elders
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400">
                      While the current leader serves their 1-year tenure, the other {isRegion ? '11' : '8'} elders vote on who shall succeed them. When tenure concludes, votes determine the next sovereign ruler.
                    </p>

                    {candidates.length === 0 ? (
                      <div className="text-xs text-zinc-500 font-mono italic">
                        Not enough council elders yet to conduct succession voting.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {candidates.map((cand) => {
                          const candidateVoteCount = Object.values(votes).filter((id) => id === cand.id).length;
                          const hasMyVote = userVotedCandidateId === cand.id;

                          return (
                            <div
                              key={cand.id}
                              className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                                hasMyVote
                                  ? 'bg-amber-950/30 border-amber-500/60'
                                  : 'bg-[#090c13] border-zinc-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={cand.avatarUrl}
                                  alt={cand.fullName}
                                  className="w-7 h-7 rounded-md object-cover border border-zinc-700 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-zinc-200 truncate">{cand.fullName}</div>
                                  <div className="text-[10px] text-amber-400 font-mono">
                                    {candidateVoteCount} Vote{candidateVoteCount === 1 ? '' : 's'}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleVoteSubmit(council.id, cand.id)}
                                className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-colors ${
                                  hasMyVote
                                    ? 'bg-amber-500 text-zinc-950'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                }`}
                              >
                                {hasMyVote ? 'Voted ★' : 'Vote'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Custodians Section (Strictly for 31-JBs) */}
                  <div className="p-4 rounded-xl bg-[#05070c] border border-teal-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-teal-400" />
                        <div>
                          <h4 className="font-cinzel text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                            Territorial Custodians (Guards of {council.name})
                          </h4>
                          <span className="text-[10px] text-teal-300 font-mono">
                            Strict Rule: Only Junior Bosses (31-JB) can be appointed Custodians. Vacates upon promotion.
                          </span>
                        </div>
                      </div>

                      {canAccessAdmin(currentUser) && (
                        <button
                          onClick={() => {
                            setShowCustodianModal(council.id);
                            setSelectedCustodianUserId(availableUnassignedJBs[0]?.user.id || '');
                          }}
                          className="px-2.5 py-1 bg-teal-950 hover:bg-teal-900/80 text-teal-200 border border-teal-500/40 text-xs font-mono font-bold rounded-lg flex items-center gap-1"
                        >
                          <UserPlus size={12} />
                          <span>Appoint Custodian</span>
                        </button>
                      )}
                    </div>

                    {custodians.length === 0 ? (
                      <div className="text-xs text-zinc-500 font-mono italic">
                        No 31-JB Custodians currently appointed to this territory.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {custodians.map((cust) => (
                          <div
                            key={cust.id}
                            className="p-2 bg-[#090c13] border border-teal-500/30 rounded-lg flex items-center justify-between gap-2"
                          >
                            <div
                              onClick={() => setSelectedProfileUser(cust)}
                              className="flex items-center gap-2 cursor-pointer min-w-0 group"
                            >
                              <img
                                src={cust.avatarUrl}
                                alt={cust.fullName}
                                className="w-8 h-8 rounded-lg object-cover border border-teal-500/40 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-zinc-200 group-hover:text-teal-300 truncate">
                                  {cust.fullName}
                                </div>
                                <div className="text-[10px] text-teal-400 font-mono">
                                  Custodian (31-JB Guard)
                                </div>
                              </div>
                            </div>

                            {canAccessAdmin(currentUser) && (
                              <button
                                onClick={() => {
                                  const res = removeCustodian(council.id, cust.id);
                                  setFeedback({ message: res.message, isError: !res.success });
                                  setTimeout(() => setFeedback(null), 4000);
                                }}
                                className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-0.5 bg-red-950/40 rounded font-mono"
                                title="Remove Custodian"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past Leaders & Sovereign Hall of Fame */}
                  {council.pastLeaders && council.pastLeaders.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#05070c] border border-zinc-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-amber-300">
                        <History size={14} />
                        <span>Sovereign Hall of Fame & Concluded Tenures</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {council.pastLeaders.map((past, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-[#090c13] border border-zinc-800 rounded-lg text-xs font-mono flex items-center gap-2"
                          >
                            <span className="font-bold text-zinc-200">{past.name}</span>
                            {past.honoraryTitleBestowed && (
                              <SpecialTitleBadge title={past.honoraryTitleBestowed} size="sm" />
                            )}
                            {past.rankUpgradedTo && (
                              <RankBadge rank={past.rankUpgradedTo} size="xs" />
                            )}
                            <span className="text-[10px] text-zinc-500">
                              (Concluded {new Date(past.termConcludedAt).toLocaleDateString()})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ESTABLISH SOVEREIGN TERRITORY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#090c13] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-amber-400" />
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-200">
                  Establish Sovereign Territory
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-mono">
              {/* Type Selection: Region vs Domaine */}
              <div>
                <label className="block text-zinc-300 font-bold mb-2">
                  Territory Hierarchy Classification
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTerritoryType('REGION')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      territoryType === 'REGION'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500 shadow-md'
                        : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-cinzel font-bold text-xs">
                      <Crown size={15} className="text-amber-400" />
                      <span>1. Grand Region</span>
                    </div>
                    <span className="text-[10px] opacity-85">
                      Auto-assigns up to <strong className="text-amber-300">12 Lords</strong>. Eldest becomes <strong>Supreme Lord</strong>.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTerritoryType('DOMAINE')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      territoryType === 'DOMAINE'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500 shadow-md'
                        : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-cinzel font-bold text-xs">
                      <Swords size={15} className="text-indigo-400" />
                      <span>2. District Domaine</span>
                    </div>
                    <span className="text-[10px] opacity-85">
                      Auto-assigns up to <strong className="text-indigo-300">9 O.Gs</strong>. Eldest becomes <strong>High Chief</strong>.
                    </span>
                  </button>
                </div>
              </div>

              {/* Council Name */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  {territoryType === 'REGION' ? 'Region Name' : 'Domaine Name'}
                </label>
                <input
                  type="text"
                  value={councilName}
                  onChange={(e) => setCouncilName(e.target.value)}
                  placeholder={
                    territoryType === 'REGION'
                      ? 'e.g. Vice City Greater Metropolitan Region'
                      : 'e.g. Ocean Beach & Starfish Boulevard Domaine'
                  }
                  required
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* If Domaine: Parent Region */}
              {territoryType === 'DOMAINE' && (
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Parent Grand Region <span className="text-amber-400">(Mandatory Hierarchy)</span>
                  </label>
                  <select
                    value={parentRegionName}
                    onChange={(e) => setParentRegionName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Select Parent Region...</option>
                    {grandRegions.map((r) => (
                      <option key={r.id} value={r.name}>
                        👑 {r.name}
                      </option>
                    ))}
                    <option value="Vice City Sovereign Region">Vice City Sovereign Region</option>
                    <option value="Leonida State Grand Region">Leonida State Grand Region</option>
                  </select>
                </div>
              )}

              {/* Sector */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Geographical Sector / Territorial Boundary
                </label>
                <input
                  type="text"
                  value={territorySector}
                  onChange={(e) => setTerritorySector(e.target.value)}
                  placeholder="e.g. Sector Alpha — Ocean Drive, Marina & Downtown"
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Territorial Mandate & Operations
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the operational mandate, economic jurisdiction, and security protocol..."
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md"
                >
                  Establish {territoryType === 'REGION' ? 'Grand Region' : 'Domaine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPOINT 31-JB CUSTODIAN MODAL */}
      {showCustodianModal && (() => {
        const activeCouncil = councils.find((c) => c.id === showCustodianModal);
        const currentCustodians = activeCouncil?.custodianUserIds || [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#090c13] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-teal-400" />
                  <h3 className="font-cinzel text-base font-bold text-zinc-100">
                    Appoint Territorial Custodian
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowCustodianModal(null);
                    setSelectedCustodianUserId('');
                  }}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              {/* Territory context */}
              {activeCouncil && (
                <div className="p-2.5 bg-[#05070c] border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Territory:</span>
                  <span className="text-teal-300 font-bold">{activeCouncil.name}</span>
                </div>
              )}

              {/* Mandatory 1-Region Rule Notice */}
              <div className="p-3 bg-teal-950/40 border border-teal-500/40 rounded-xl text-xs space-y-1.5 font-mono text-teal-200">
                <div className="font-bold flex items-center gap-1.5 text-teal-300">
                  <ShieldAlert size={14} />
                  <span>Strict Custodian Doctrine: 1 Region Per Person</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  • <strong>Rank Restriction:</strong> Custodians must strictly hold the rank of <strong>Junior Boss (31-JB)</strong>.<br />
                  • <strong>One Region Limit:</strong> An operative can only serve as Custodian in <strong>ONE region</strong> at a time. They cannot be assigned to multiple territories simultaneously.<br />
                  • <strong>Auto-Vacate:</strong> If a Custodian is promoted out of 31-JB, their post is automatically vacated.
                </p>
              </div>

              <form onSubmit={handleAppointCustodianSubmit} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Select Eligible 31-JB Operative
                  </label>
                  {juniorBossesWithStatus.length > 0 ? (
                    <select
                      value={selectedCustodianUserId}
                      onChange={(e) => setSelectedCustodianUserId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">Select a Junior Boss...</option>
                      {juniorBossesWithStatus.map(({ user: jb, assignedCouncil, isAssignedElsewhere, isAssignedToCurrentModal }) => {
                        if (isAssignedToCurrentModal) {
                          return (
                            <option key={jb.id} value={jb.id} disabled>
                              {jb.fullName} — [31-JB] (Already Custodian in this territory)
                            </option>
                          );
                        }
                        if (isAssignedElsewhere) {
                          return (
                            <option key={jb.id} value={jb.id} disabled>
                              ⛔ {jb.fullName} — [31-JB] (Assigned in: {assignedCouncil?.name} — 1 region limit)
                            </option>
                          );
                        }
                        return (
                          <option key={jb.id} value={jb.id}>
                            ✓ {jb.fullName} — [31-JB] (@{jb.gtaHandle}) [Available]
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 text-[11px]">
                      No Junior Bosses (31-JB) currently available in the Family.
                    </div>
                  )}
                </div>

                {/* Status breakdown */}
                {availableUnassignedJBs.filter((i) => !i.isAssignedToCurrentModal).length === 0 && (
                  <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-lg text-amber-300 text-[11px]">
                    All current 31-JBs are already assigned to other sovereign territories. Relieve an operative from their current region first to reassign them here.
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustodianModal(null);
                      setSelectedCustodianUserId('');
                    }}
                    className="px-3.5 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedCustodianUserId}
                    className="px-4 py-1.5 bg-teal-500 disabled:opacity-40 text-zinc-950 font-bold rounded-lg shadow font-mono hover:bg-teal-400 transition-colors"
                  >
                    Confirm Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* EDIT SOVEREIGN TERRITORY MODAL */}
      {editingCouncil && (() => {
        const isRegion = editingCouncil.type === 'REGION';
        const eligibleLeaders = users.filter((u) => {
          if (u.isBanned) return false;
          return isRegion ? u.rank === 'Lord' : u.rank === 'O.G';
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-[#090c13] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 size={20} className={isRegion ? 'text-amber-400' : 'text-indigo-400'} />
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-zinc-100">
                    Edit {isRegion ? 'Grand Region' : 'District Domaine'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setEditingCouncil(null);
                    setShowDeleteConfirm(false);
                  }}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-mono">
                {/* Territory Type Badge */}
                <div className="flex items-center justify-between p-2.5 bg-[#050505] rounded-xl border border-zinc-800">
                  <span className="text-zinc-400">Classification:</span>
                  {isRegion ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                      <Crown size={12} /> Grand Region (12 Lords)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1">
                      <Swords size={12} /> District Domaine (9 O.Gs)
                    </span>
                  )}
                </div>

                {/* Territory Name */}
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    {isRegion ? 'Region Name' : 'Domaine Name'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    placeholder="e.g. Vice City Sovereign Region"
                    className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                  />
                  {isRegion && (
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Note: Renaming this region will automatically update all child Domaines linked to it.
                    </p>
                  )}
                </div>

                {/* If Domaine: Parent Region */}
                {!isRegion && (
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">
                      Parent Grand Region
                    </label>
                    <select
                      value={editParentRegion}
                      onChange={(e) => setEditParentRegion(e.target.value)}
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
                      <option value="Leonida State Grand Region">Leonida State Grand Region</option>
                    </select>
                  </div>
                )}

                {/* Geographical Sector */}
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Geographical Sector / Boundary
                  </label>
                  <input
                    type="text"
                    value={editSector}
                    onChange={(e) => setEditSector(e.target.value)}
                    placeholder="e.g. Sector 1 — Starfish Island & Port of Vice City"
                    className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Mandate & Operational Guidelines
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    placeholder="Operational protocol, commerce jurisdiction, and defense policy..."
                    className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none resize-none font-sans"
                  />
                </div>

                {/* Leader Reassignment */}
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    {isRegion ? 'Supreme Lord (Requires Lord Rank)' : 'High Chief (Requires O.G Rank)'}
                  </label>
                  <select
                    value={editLeaderUserId}
                    onChange={(e) => setEditLeaderUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Unassigned / Vacant Seat --</option>
                    {eligibleLeaders.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} [{u.rank}] (@{u.gtaHandle})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {isRegion
                      ? 'Only members holding the rank of Lord are eligible to lead a Region.'
                      : 'Only members holding the rank of O.G are eligible to lead a Domaine.'}
                  </p>
                </div>

                {/* Dissolve / Delete Territory Section */}
                <div className="pt-3 border-t border-zinc-800">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1.5 font-mono"
                    >
                      <Trash2 size={13} />
                      <span>Dissolve & Delete This Territory...</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl space-y-2 text-xs font-mono text-rose-200">
                      <div className="font-bold flex items-center gap-1 text-rose-300">
                        <AlertTriangle size={14} />
                        <span>Confirm Territory Dissolution</span>
                      </div>
                      <p className="text-[11px] opacity-90">
                        Are you sure you want to permanently dissolve <strong>"{editingCouncil.name}"</strong>? All elder seatings and custodian appointments in this territory will be vacated.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteCouncilSubmit(editingCouncil.id)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow transition-colors"
                        >
                          Yes, Dissolve Territory
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCouncil(null);
                      setShowDeleteConfirm(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-md flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* REQUEST AM / A13 MODAL */}
      {showAmRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#090c13] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-indigo-400" />
                <h3 className="font-cinzel text-base font-bold text-zinc-100">
                  Request AM / A13 Mentorship
                </h3>
              </div>
              <button
                onClick={() => setShowAmRequestModal(false)}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 font-mono leading-relaxed">
              As a Boss (Level 4) or higher, you can formally invite a lower-ranking operative into an AM/A13 brotherhood mentorship bond. An automated invitation notification will be dispatched to their radar.
            </p>

            <form onSubmit={handleSendAmRequest} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Select Target Operative (Lower Rank)
                </label>
                {eligibleAmTargets.length > 0 ? (
                  <select
                    value={selectedAmTargetUserId}
                    onChange={(e) => setSelectedAmTargetUserId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select an operative...</option>
                    {eligibleAmTargets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} — [{t.rank}] (@{t.gtaHandle})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-[11px]">
                    No eligible unmentored lower-rank operatives currently available.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAmRequestModal(false)}
                  className="px-3.5 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedAmTargetUserId}
                  className="px-4 py-1.5 bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow font-mono"
                >
                  Dispatch Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
