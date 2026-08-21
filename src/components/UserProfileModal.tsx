import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge, SpecialTitleBadge, CouncilBadge, getRankVisualInfo } from './RankBadge';
import { InteractiveCelebrationBadge } from './InteractiveCelebrationBadge';
import { RankPromotionTimeline } from './RankPromotionTimeline';
import { RANK_LEVELS, RANK_HIERARCHY, MafiaRank } from '../types';
import {
  X,
  Crown,
  Shield,
  Eye,
  Flame,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  LogOut,
  Edit3,
  Save,
  Ban,
  Trash2,
  ShieldAlert,
  RotateCcw,
  TrendingUp,
  History,
  ChevronRight,
  Send,
} from 'lucide-react';

interface UserProfileModalProps {
  onOpenDenounceModal: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onOpenDenounceModal }) => {
  const {
    selectedProfileUser,
    setSelectedProfileUser,
    currentUser,
    users,
    approveRecruit,
    makeJuniorBossM19,
    advanceNewBornDays,
    promoteUserRank,
    logoutUser,
    updateUserProfile,
    banUser,
    unbanUser,
    permanentlyDeleteUser,
    isAboveFounders,
    isHonchoOrGhost,
    canAccessAdmin,
    sendAmA13Request,
    cancelAmA13Assignment,
    amRequests,
    respondToAmA13Request,
  } = useFamily();

  const [isEditing, setIsEditing] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedPromotionRank, setSelectedPromotionRank] = useState<MafiaRank>('Boss');
  const [amActionFeedback, setAmActionFeedback] = useState<string | null>(null);

  // Edit form fields
  const [fullName, setFullName] = useState(selectedProfileUser?.fullName || '');
  const [gtaHandle, setGtaHandle] = useState(selectedProfileUser?.gtaHandle || '');
  const [discordTag, setDiscordTag] = useState(selectedProfileUser?.discordTag || '');
  const [bio, setBio] = useState(selectedProfileUser?.bio || '');
  const [statusMessage, setStatusMessage] = useState(selectedProfileUser?.statusMessage || '');
  const [avatarUrl, setAvatarUrl] = useState(selectedProfileUser?.avatarUrl || '');

  if (!selectedProfileUser) return null;

  const user = selectedProfileUser;
  const isMe = currentUser?.id === user.id;
  const viewerLevel = RANK_LEVELS[currentUser?.rank || 'No Man'] || 1;
  const isViewerOGOrHigher = viewerLevel >= 6;
  const viewerCanModerate = isHonchoOrGhost(currentUser);

  const daysPassed = user.simulatedDaysPassed || 1;
  const isM19Ready = user.rank === 'New Born' && daysPassed >= 31;

  // Third Eyes / Recruits under this user
  const userRecruits = users.filter((u) => u.approvedByUserId === user.id);

  const handleStartEdit = () => {
    setFullName(user.fullName);
    setGtaHandle(user.gtaHandle);
    setDiscordTag(user.discordTag);
    setBio(user.bio);
    setStatusMessage(user.statusMessage || '');
    setAvatarUrl(user.avatarUrl);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (!fullName.trim()) return;
    updateUserProfile(user.id, {
      fullName: fullName.trim(),
      gtaHandle: gtaHandle.trim(),
      discordTag: discordTag.trim(),
      bio: bio.trim(),
      statusMessage: statusMessage.trim(),
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
    });
    setIsEditing(false);
  };

  const handleBan = () => {
    banUser(user.id, banReason || 'Violation of Family Omertà Code and High Table orders.');
    setShowBanConfirm(false);
    setBanReason('');
  };

  const handleUnban = () => {
    unbanUser(user.id);
  };

  const handleDelete = () => {
    permanentlyDeleteUser(user.id);
    setSelectedProfileUser(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex justify-center items-start sm:items-center p-2.5 sm:p-4 pt-4 sm:pt-6 pb-16 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsEditing(false);
          setSelectedProfileUser(null);
        }
      }}
    >
      <div
        className="w-full max-w-2xl bg-[#090c13] border border-zinc-800 rounded-2xl shadow-2xl relative my-2 sm:my-auto overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Top Bar with Header & Prominent Close Button */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800/90 bg-[#07090f] sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Shield size={13} />
            </div>
            <span className="font-cinzel text-xs sm:text-sm font-bold text-zinc-200 tracking-wide truncate">
              SBB Dossier Record
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0 hidden xs:inline-block">
              @{user.gtaHandle}
            </span>
          </div>

          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedProfileUser(null);
            }}
            aria-label="Close Dossier"
            className="w-8 h-8 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors shrink-0 active:scale-95 border border-zinc-700/60"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Banned Alert Banner if user is banned */}
          {user.isBanned && (
            <div className="p-3 bg-red-950/50 border border-red-500/60 rounded-lg flex items-center justify-between gap-3 text-red-200">
              <div className="flex items-center gap-2 text-xs font-mono">
                <ShieldAlert size={16} className="text-red-400 shrink-0" />
                <div>
                  <strong className="text-red-300 uppercase">MEMBER BANNED FROM SBB</strong>
                  <p className="text-[11px] text-red-300/80 mt-0.5">
                    Reason: {user.banReason || 'Banned by High Table directive.'} (By{' '}
                    {user.bannedBy || 'High Table'})
                  </p>
                </div>
              </div>
              {viewerCanModerate && (
                <button
                  onClick={handleUnban}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded font-mono shrink-0 flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  Unban
                </button>
              )}
            </div>
          )}

          {/* Top Header: Avatar & Main Identity */}
          {!isEditing ? (
            (() => {
              const visual = getRankVisualInfo(user.rank);
              const levelPercentage = Math.min(100, Math.round((visual.level / 10) * 100));

              return (
                <div className="space-y-3.5 border-b border-zinc-800/80 pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-5">
                    {/* Avatar with Status & Rank Halo */}
                    <div className="relative shrink-0 self-start sm:self-center">
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 transition-all duration-300 ${
                          user.isBanned
                            ? 'border-red-500 grayscale'
                            : `${visual.avatarHaloClass}`
                        } shadow-xl bg-zinc-900`}
                      />
                      {user.isBanned ? (
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-red-600 text-white rounded text-[8px] font-mono font-bold shadow">
                          BANNED
                        </span>
                      ) : (
                        <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 bg-black/90 border border-white/20 text-white rounded-full text-[9px] font-mono font-bold shadow-md flex items-center gap-0.5">
                          <span className="text-amber-400">L</span>{visual.level}
                        </span>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="space-y-2 min-w-0 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <InteractiveCelebrationBadge
                          user={user}
                          size="md"
                          showLevel={true}
                          showTimelineButton={true}
                          showCelebrationTrigger={true}
                          onOpenTimeline={() => setShowTimelineModal(true)}
                        />

                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-900/90 text-zinc-300 border border-zinc-700/80">
                          {visual.categoryLabel}
                        </span>

                        {isMe && (
                          <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                            You
                          </span>
                        )}

                        {(isMe || viewerCanModerate) && (
                          <button
                            onClick={handleStartEdit}
                            className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 flex items-center gap-1.5 ml-auto transition-colors shrink-0"
                          >
                            <Edit3 size={11} />
                            <span>Edit Profile</span>
                          </button>
                        )}
                      </div>

                      <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-zinc-100 break-words leading-tight">
                        {user.fullName}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono">
                        <span className="bg-[#050505] px-2.5 py-0.5 rounded-md border border-zinc-800 text-amber-300/90 flex items-center gap-1">
                          <span className="text-zinc-500">RP:</span> @{user.gtaHandle}
                        </span>
                        <span className="bg-[#050505] px-2.5 py-0.5 rounded-md border border-zinc-800 text-zinc-300 flex items-center gap-1">
                          <span className="text-zinc-500">Discord:</span> {user.discordTag}
                        </span>
                      </div>

                      {user.statusMessage && (
                        <p className="text-[11px] text-zinc-400 italic pt-0.5">"{user.statusMessage}"</p>
                      )}
                    </div>
                  </div>

                  {/* Hierarchy Power Standing Meter */}
                  <div className="p-2.5 rounded-xl bg-[#05070c] border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <TrendingUp size={12} className="text-amber-400" />
                        <span className="text-zinc-400">Hierarchy Standing:</span>
                        <strong className="text-zinc-100">{user.rank}</strong>
                      </div>
                      <span className="text-amber-400 font-bold">
                        Level {visual.level} of 10 ({levelPercentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-zinc-950 rounded-full h-2 p-0.5 border border-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${visual.accentColor}`}
                        style={{ width: `${levelPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()
        ) : (
          /* EDIT PROFILE FORM */
          <div className="border-b border-zinc-800 pb-4 space-y-3 bg-[#05070c] p-4 rounded-xl border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-amber-400" />
                <h3 className="font-cinzel font-bold text-base text-zinc-100">
                  Edit Dossier Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Full Name & Alias</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090c13] border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">GTA VI RP Character Handle</label>
                <input
                  type="text"
                  value={gtaHandle}
                  onChange={(e) => setGtaHandle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090c13] border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Discord Tag</label>
                <input
                  type="text"
                  value={discordTag}
                  onChange={(e) => setDiscordTag(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090c13] border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090c13] border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 mb-1">Personal Status Message / Motto</label>
                <input
                  type="text"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="e.g. Loyalty over everything."
                  className="w-full px-2.5 py-1.5 bg-[#090c13] border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 mb-1">Roleplay Dossier & Background</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090c13] border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow"
              >
                <Save size={13} />
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* PROMINENT REQUIREMENT: "Made You" info & Promotion Timeline */}
        <div className="p-3.5 bg-[#05070c] rounded-lg border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Crown size={12} className="text-amber-400" />
              <span>Family Lineage & Sponsor Standing</span>
            </div>

            <button
              onClick={() => setShowTimelineModal(true)}
              className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 text-[10px] font-mono flex items-center gap-1 transition-all shadow-sm"
              title="Open Rank Promotion Timeline"
            >
              <History size={11} className="text-amber-400" />
              <span>Timeline ({user.promotionHistory?.length || 1})</span>
              <ChevronRight size={10} />
            </button>
          </div>

          {user.approvedByName ? (
            <div className="text-xs text-zinc-200">
              {isMe ? (
                <>
                  <span className="font-bold text-amber-200">{user.approvedByName}</span>,{' '}
                  <span className="text-zinc-300">{user.approvedByRank}</span>,{' '}
                  <span className="text-amber-400 font-bold italic tracking-wide">Made You</span>
                </>
              ) : (
                <>
                  <span className="text-amber-400 font-bold italic tracking-wide">Made by</span>{' '}
                  <span className="font-bold text-amber-200">{user.approvedByName}</span>,{' '}
                  <span className="text-zinc-300">{user.approvedByRank}</span>
                </>
              )}
            </div>
          ) : user.rank === 'No Man' ? (
            <div className="text-xs text-amber-400/90 italic">
              Recruit (No Man) awaiting confirmation by an O.G or higher rank.
            </div>
          ) : (
            <div className="text-xs font-semibold text-amber-200">
              High Table Sovereign Command of SBB
            </div>
          )}

          {user.madeByName && (
            <div className="text-[11px] text-teal-300 font-mono pt-1 border-t border-zinc-800/80">
              ★ Officiated as 31-JB at M19 Ceremony by {user.madeByName} ({user.madeByRank}) on{' '}
              {new Date(user.madeAt || '').toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Special Titles & Council Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Special Titles */}
          <div className="p-3 bg-[#05070c] rounded-lg border border-zinc-800 space-y-1.5">
            <div className="text-[9px] uppercase font-mono text-zinc-400">Special Family Titles</div>
            {user.specialTitles && user.specialTitles.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {user.specialTitles.map((t) => (
                  <SpecialTitleBadge key={t} title={t} size="sm" />
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-zinc-500 italic">No special titles assigned yet.</div>
            )}
          </div>

          {/* Council Assignments */}
          <div className="p-3 bg-[#05070c] rounded-lg border border-zinc-800 space-y-1.5">
            <div className="text-[9px] uppercase font-mono text-zinc-400">
              Domaine & Regional Councils
            </div>
            {user.councilAssignments && user.councilAssignments.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {user.councilAssignments.map((ca) => (
                  <CouncilBadge
                    key={ca.councilId}
                    title={ca.title}
                    domaineName={ca.domaineName}
                    size="sm"
                  />
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-zinc-500 italic">General Syndicate Operative</div>
            )}
          </div>
        </div>

        {/* AM / A13 Mentorship & Brotherhood Section */}
        <div className="p-3.5 bg-[#05070c] rounded-xl border border-indigo-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="font-cinzel text-xs font-bold text-zinc-200 uppercase tracking-wider">
                AM / A13 Mentorship & Brotherhood Standing
              </span>
            </div>

            {/* If viewer is Boss+ and viewing a lower rank operative without an AM */}
            {!isMe &&
              !user.isBanned &&
              viewerLevel >= 4 &&
              (RANK_LEVELS[user.rank] || 1) < viewerLevel &&
              !user.myAmA13 && (
                <button
                  onClick={() => {
                    const res = sendAmA13Request(user.id);
                    setAmActionFeedback(res.message);
                    setTimeout(() => setAmActionFeedback(null), 4000);
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold rounded-lg shadow transition-colors flex items-center gap-1"
                >
                  <Send size={10} />
                  <span>Request AM/A13</span>
                </button>
              )}
          </div>

          {amActionFeedback && (
            <div className="p-2 bg-indigo-950/60 border border-indigo-500/50 rounded-lg text-indigo-200 font-mono text-[10px]">
              {amActionFeedback}
            </div>
          )}

          {user.myAmA13 ? (
            <div className="p-2.5 bg-[#090c13] rounded-lg border border-indigo-500/30 text-xs font-mono flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-indigo-400 font-bold">★ AM Mentor:</span>
                <span className="text-zinc-200 font-bold truncate">{user.myAmA13.amName}</span>
                <RankBadge rank={user.myAmA13.amRank} size="xs" />
              </div>
              <span className="text-[10px] text-zinc-500 shrink-0">
                Since {new Date(user.myAmA13.assignedAt).toLocaleDateString()}
              </span>
            </div>
          ) : user.amAssignments && user.amAssignments.length > 0 ? (
            <div className="space-y-1.5 font-mono text-xs">
              <div className="text-[10px] text-zinc-400">
                Mentoring under AM/A13 doctrine ({user.amAssignments.length} operative{user.amAssignments.length === 1 ? '' : 's'}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.amAssignments.map((a) => (
                  <span
                    key={a.targetUserId}
                    className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 rounded text-[10px] flex items-center gap-1"
                  >
                    ★ {a.targetName} ({a.targetRank})
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-zinc-500 italic font-mono">
              No AM/A13 mentorship bond currently active.
            </div>
          )}
        </div>

        {/* New Born 31-Day Progress (if New Born) */}
        {user.rank === 'New Born' && !user.isBanned && (
          <div className="p-3.5 bg-[#05070c] rounded-lg border border-amber-500/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
                <Flame size={14} className="text-amber-400" />
                <span>31-Day Crucible to M19</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                Day {daysPassed} / 31
              </span>
            </div>

            <div className="w-full bg-[#050505] rounded-full h-2 overflow-hidden border border-zinc-800">
              <div
                className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (daysPassed / 31) * 100)}%` }}
              />
            </div>

            <p className="text-[10px] text-zinc-400 italic">
              "Being confirmed as a New Born and Being Made are two completely different stages of
              membership and shall never be treated as the same process. M19 is hosted on the 31st
              day."
            </p>
          </div>
        )}

        {/* Bio */}
        {!isEditing && (
          <div className="p-3 bg-[#05070c] rounded-lg border border-zinc-800 space-y-1">
            <div className="text-[9px] uppercase font-mono text-zinc-400">
              Roleplay Biography & Dossier
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Proteges (if O.G+) */}
        {userRecruits.length > 0 && (
          <div className="p-3 bg-[#05070c] rounded-lg border border-zinc-800 space-y-1.5">
            <div className="text-[9px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
              <Eye size={11} className="text-indigo-400" />
              <span>
                Recruits Under {user.fullName.split(' ')[0]}'s Third Eye Watch (
                {userRecruits.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {userRecruits.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedProfileUser(r)}
                  className="px-2 py-0.5 bg-[#050505] hover:bg-zinc-800 rounded border border-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 font-mono"
                >
                  <img
                    src={r.avatarUrl}
                    alt={r.fullName}
                    className="w-3.5 h-3.5 rounded object-cover"
                  />
                  <span>{r.fullName}</span>
                  <span className="text-[9px] text-amber-400">({r.rank})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ban Confirmation Form */}
        {showBanConfirm && (
          <div className="p-3 bg-red-950/60 border border-red-500 rounded-lg space-y-2 text-xs">
            <div className="font-bold text-red-200 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-red-400" />
              Ban {user.fullName} from SBB Family
            </div>
            <p className="text-[11px] text-red-300">
              Enter reason for disciplinary ban (sent as High Table alert):
            </p>
            <input
              type="text"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g. Gross insubordination during district raid."
              className="w-full px-2.5 py-1 bg-[#090c13] border border-red-700 rounded text-zinc-100 font-mono text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowBanConfirm(false)}
                className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBan}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded font-mono"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Form */}
        {showDeleteConfirm && (
          <div className="p-3 bg-red-950/80 border border-red-600 rounded-lg space-y-2 text-xs">
            <div className="font-bold text-red-200 flex items-center gap-1.5">
              <Trash2 size={14} className="text-red-400" />
              Permanently Expunge {user.fullName}
            </div>
            <p className="text-[11px] text-red-300">
              WARNING: This will permanently delete this member's profile and remove them completely
              from all rosters and leadership positions. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white font-bold rounded font-mono"
              >
                Permanently Delete Member
              </button>
            </div>
          </div>
        )}

        {/* High Table Executive Rank Promotion Control */}
        {!isMe && viewerCanModerate && !user.isBanned && (
          <div className="p-3 bg-[#05070c] rounded-lg border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Crown size={13} className="text-amber-400" />
                High Table Rank Elevation
              </span>
              <span className="text-[10px] text-zinc-400">Current: {user.rank}</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedPromotionRank}
                onChange={(e) => setSelectedPromotionRank(e.target.value as MafiaRank)}
                className="flex-1 px-2.5 py-1.5 bg-[#090c13] border border-zinc-700 rounded text-xs text-zinc-200 font-mono focus:border-amber-500 focus:outline-none"
              >
                {RANK_HIERARCHY.map((r) => (
                  <option key={r} value={r}>
                    {r} (Level {RANK_LEVELS[r]})
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  promoteUserRank(user.id, selectedPromotionRank);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold rounded text-xs font-mono flex items-center gap-1.5 shadow transition-transform active:scale-95"
              >
                <Sparkles size={12} />
                <span>Elevate Rank</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2.5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* O.G+ approving a No Man */}
          {!isMe && isViewerOGOrHigher && user.rank === 'No Man' && !user.isBanned && (
            <button
              onClick={() => {
                approveRecruit(user.id);
                setSelectedProfileUser(null);
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 size={13} />
              <span>Approve as New Born</span>
            </button>
          )}

          {/* O.G+ officiating M19 for Day 31 New Born */}
          {!isMe && isViewerOGOrHigher && isM19Ready && !user.isBanned && (
            <button
              onClick={() => {
                makeJuniorBossM19(user.id);
                setSelectedProfileUser(null);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-lg shadow-sm flex items-center gap-1.5 animate-pulse"
            >
              <Award size={13} />
              <span>Officiate M19 Ceremony (Make 31-JB)</span>
            </button>
          )}

          {/* High Table & Admin Moderation Action Bar */}
          {!isMe && viewerCanModerate && (
            <div className="flex items-center gap-2">
              {!user.isBanned ? (
                <button
                  onClick={() => {
                    setShowBanConfirm(true);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-medium rounded-lg flex items-center gap-1 font-mono"
                >
                  <Ban size={12} />
                  <span>Ban Member</span>
                </button>
              ) : (
                <button
                  onClick={handleUnban}
                  className="px-2.5 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/30 font-medium rounded-lg flex items-center gap-1 font-mono"
                >
                  <RotateCcw size={12} />
                  <span>Unban</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowBanConfirm(false);
                }}
                className="px-2.5 py-1.5 bg-red-900/30 hover:bg-red-800/50 text-red-400 border border-red-700/40 font-medium rounded-lg flex items-center gap-1 font-mono"
                title="Permanently Delete User"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>
          )}

          {/* Denounce Membership and Log Out (If viewing own profile) */}
          {isMe && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedProfileUser(null);
                  onOpenDenounceModal();
                }}
                className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-medium rounded-lg flex items-center gap-1.5 transition-colors font-mono"
              >
                <AlertTriangle size={13} />
                <span>Denounce Membership</span>
              </button>
              <button
                onClick={() => {
                  logoutUser();
                  setSelectedProfileUser(null);
                }}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 font-medium rounded-lg flex items-center gap-1.5 transition-colors font-mono"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedProfileUser(null);
            }}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg ml-auto"
          >
            Close
          </button>
        </div>
      </div>

      {/* Rank Promotion History Timeline Modal */}
      {showTimelineModal && (
        <RankPromotionTimeline
          user={user}
          onClose={() => setShowTimelineModal(false)}
        />
      )}
    </div>
  </div>
);
};
