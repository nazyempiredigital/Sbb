import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge, SpecialTitleBadge, CouncilBadge, getRankVisualInfo } from './RankBadge';
import { MafiaRank, RANK_HIERARCHY, RANK_LEVELS, ALL_SPECIAL_TITLES, SpecialTitle, User } from '../types';
import {
  Users,
  Search,
  Filter,
  Crown,
  MapPin,
  X,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Award,
} from 'lucide-react';

/**
 * Strict Syndicate Law Hierarchy Sorting:
 * 1. Rank Level (e.g., Level 10 down to Level 1)
 * 2. For LORDS:
 *    - 1st: Lords with "Caesar" title (Senior Retired Supreme Lords)
 *    - 2nd: Lords with "Ash-Lord" title (Senior Retired Council Elders)
 *    - 3rd: Lords with "Supreme Lord" title (Active Regional Council Leaders)
 *    - 4th: Lords with "Regional Council Elder" title (Active Council Elders)
 *    - 5th: Lords without title
 * 3. For O.G (Original Gentlemen in Domaines):
 *    - 1st: O.Gs with "Caesar" / Emeritus title
 *    - 2nd: O.Gs with "Ash-Lord" / Emeritus Elder title
 *    - 3rd: O.Gs with "High Chief" title (Active Domaine Council Leaders)
 *    - 4th: O.Gs with "Domaine Council Elder" title (Active Domaine Elders)
 *    - 5th: O.Gs without title
 * 4. Seniority tie breaker: joinedAt (earliest joined first)
 */
export function getHierarchySortPriority(user: User): number {
  const rankLevel = RANK_LEVELS[user.rank] || 0;
  let subScore = 50; // Higher is earlier in list

  const titles = user.specialTitles || [];
  const assignments = user.councilAssignments || [];

  if (user.rank === 'Lord') {
    const hasCaesar = titles.some((t) => t.toLowerCase() === 'caesar');
    const hasAshLord = titles.some((t) => t.toLowerCase() === 'ash-lord' || t.toLowerCase() === 'ashlord');
    const hasSupremeLord = titles.some((t) => t.toLowerCase() === 'supreme lord') || assignments.some((ca) => ca.title === 'Supreme Lord');
    const hasRegionalElder = titles.some((t) => t.toLowerCase() === 'regional council elder') || assignments.some((ca) => ca.title === 'Regional Council Elder');

    if (hasCaesar) {
      subScore = 90; // 1st: Caesar
    } else if (hasAshLord) {
      subScore = 80; // 2nd: Ash-Lord
    } else if (hasSupremeLord) {
      subScore = 70; // 3rd: Supreme Lord
    } else if (hasRegionalElder) {
      subScore = 60; // 4th: Regional Council Elder
    } else {
      subScore = 10; // 5th: Untitled Lord
    }
  } else if (user.rank === 'O.G') {
    const hasCaesar = titles.some((t) => t.toLowerCase() === 'caesar' || t.toLowerCase().includes('emeritus'));
    const hasAshLord = titles.some((t) => t.toLowerCase() === 'ash-lord' || t.toLowerCase() === 'ashlord');
    const hasHighChief = titles.some((t) => t.toLowerCase() === 'high chief') || assignments.some((ca) => ca.title === 'High Chief');
    const hasDomaineElder = titles.some((t) => t.toLowerCase() === 'domaine council elder') || assignments.some((ca) => ca.title === 'Domaine Council Elder');

    if (hasCaesar) {
      subScore = 90; // 1st: Emeritus / Caesar
    } else if (hasAshLord) {
      subScore = 80; // 2nd: Emeritus Elder / Ash-Lord
    } else if (hasHighChief) {
      subScore = 70; // 3rd: Active High Chief
    } else if (hasDomaineElder) {
      subScore = 60; // 4th: Active Domaine Elder
    } else {
      subScore = 10; // 5th: Untitled O.G
    }
  }

  return rankLevel * 1000 + subScore;
}

export function compareUsersByHierarchy(a: User, b: User): number {
  const scoreA = getHierarchySortPriority(a);
  const scoreB = getHierarchySortPriority(b);
  if (scoreA !== scoreB) {
    return scoreB - scoreA; // Higher score comes first
  }
  // Seniority tie-breaker (earliest join date first)
  const dateA = new Date(a.joinedAt || 0).getTime();
  const dateB = new Date(b.joinedAt || 0).getTime();
  if (dateA !== dateB) return dateA - dateB;
  return a.fullName.localeCompare(b.fullName);
}

export const HierarchyRosterView: React.FC = () => {
  const { currentUser, users, councils, setSelectedProfileUser } = useFamily();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRankFilter, setSelectedRankFilter] = useState<string>('ALL');
  const [selectedTitleFilter, setSelectedTitleFilter] = useState<string>('ALL');
  const [selectedDomaineFilter, setSelectedDomaineFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'roster' | 'pyramid'>('roster');

  // Collect distinct territories (Regions & Domaines) from councils and user assignments
  const distinctDomaines = useMemo(() => {
    const set = new Set<string>();
    councils.forEach((c) => {
      if (c.name) set.add(c.name);
      if (c.domaine) set.add(c.domaine);
      if (c.regionName) set.add(c.regionName);
    });
    users.forEach((u) => {
      u.councilAssignments?.forEach((ca) => {
        if (ca.councilName) set.add(ca.councilName);
        if (ca.domaineName) set.add(ca.domaineName);
        if (ca.regionName) set.add(ca.regionName);
      });
    });
    return Array.from(set).filter(Boolean).sort();
  }, [councils, users]);

  const filteredUsers = useMemo(() => {
    const list = users.filter((u) => {
      const q = searchTerm.toLowerCase().trim();
      const userDomaines = (u.councilAssignments || []).map((ca) =>
        (ca.domaineName || '').toLowerCase()
      );
      const userCouncilNames = (u.councilAssignments || []).map((ca) =>
        (ca.councilName || '').toLowerCase()
      );
      const userRegionNames = (u.councilAssignments || []).map((ca) =>
        (ca.regionName || '').toLowerCase()
      );

      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.gtaHandle.toLowerCase().includes(q) ||
        u.discordTag.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        u.rank.toLowerCase().includes(q) ||
        userDomaines.some((d) => d.includes(q)) ||
        userCouncilNames.some((c) => c.includes(q)) ||
        userRegionNames.some((r) => r.includes(q));

      const matchesRank = selectedRankFilter === 'ALL' || u.rank === selectedRankFilter;
      const matchesTitle =
        selectedTitleFilter === 'ALL' ||
        (u.specialTitles && u.specialTitles.includes(selectedTitleFilter as SpecialTitle));

      const matchesDomaine =
        selectedDomaineFilter === 'ALL' ||
        (u.councilAssignments &&
          u.councilAssignments.some(
            (ca) =>
              ca.domaineName === selectedDomaineFilter ||
              ca.regionName === selectedDomaineFilter ||
              ca.councilName === selectedDomaineFilter
          ));

      return matchesSearch && matchesRank && matchesTitle && matchesDomaine;
    });

    return list.sort(compareUsersByHierarchy);
  }, [users, searchTerm, selectedRankFilter, selectedTitleFilter, selectedDomaineFilter]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedRankFilter !== 'ALL' ||
    selectedTitleFilter !== 'ALL' ||
    selectedDomaineFilter !== 'ALL';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRankFilter('ALL');
    setSelectedTitleFilter('ALL');
    setSelectedDomaineFilter('ALL');
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Header Banner */}
      <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-amber-400" />
            <h1 className="font-cinzel text-lg sm:text-xl font-bold text-zinc-100">
              Family Hierarchy & Registry
            </h1>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
            Official roster across the 10 ranks of SBB (Successful Bad Boys).
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[#050505] p-1 rounded-lg border border-zinc-800 shrink-0">
          <button
            onClick={() => setViewMode('roster')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'roster'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Roster Grid
          </button>
          <button
            onClick={() => setViewMode('pyramid')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'pyramid'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Hierarchy Tree
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3.5 rounded-xl bg-[#090c13] border border-zinc-800 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Bar */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, handle, domaine..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#050505] border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Rank Filter */}
          <div className="flex items-center gap-1.5 bg-[#050505] border border-zinc-700 rounded-lg px-2 py-1">
            <Filter size={13} className="text-amber-400 shrink-0" />
            <select
              value={selectedRankFilter}
              onChange={(e) => setSelectedRankFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none font-mono"
            >
              <option value="ALL" className="bg-zinc-900 text-zinc-200">
                All Ranks ({users.length})
              </option>
              {RANK_HIERARCHY.map((r) => (
                <option key={r} value={r} className="bg-zinc-900 text-zinc-200">
                  {r} ({users.filter((u) => u.rank === r).length})
                </option>
              ))}
            </select>
          </div>

          {/* Domaine / Region Filter */}
          <div className="flex items-center gap-1.5 bg-[#050505] border border-zinc-700 rounded-lg px-2 py-1">
            <MapPin size={13} className="text-emerald-400 shrink-0" />
            <select
              value={selectedDomaineFilter}
              onChange={(e) => setSelectedDomaineFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none font-mono"
            >
              <option value="ALL" className="bg-zinc-900 text-zinc-200">
                All Domaines / Regions
              </option>
              {distinctDomaines.map((dom) => (
                <option key={dom} value={dom} className="bg-zinc-900 text-zinc-200">
                  📍 {dom}
                </option>
              ))}
            </select>
          </div>

          {/* Special Title Filter */}
          <div className="flex items-center gap-1.5 bg-[#050505] border border-zinc-700 rounded-lg px-2 py-1">
            <Crown size={13} className="text-amber-400 shrink-0" />
            <select
              value={selectedTitleFilter}
              onChange={(e) => setSelectedTitleFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none font-mono"
            >
              <option value="ALL" className="bg-zinc-900 text-zinc-200">
                All Special Titles
              </option>
              {ALL_SPECIAL_TITLES.map((t) => (
                <option key={t} value={t} className="bg-zinc-900 text-zinc-200">
                  ★ {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Badges & Clear */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px] font-mono">
            <span className="text-zinc-400">
              Showing <strong className="text-amber-400">{filteredUsers.length}</strong> matching{' '}
              {filteredUsers.length === 1 ? 'member' : 'members'}
            </span>
            <button
              onClick={clearFilters}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700"
            >
              <X size={11} />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* PYRAMID / HIERARCHY TREE VIEW */}
      {viewMode === 'pyramid' && (
        <div className="space-y-3">
          {[...RANK_HIERARCHY].reverse().map((rank) => {
            const rankUsers = filteredUsers.filter((u) => u.rank === rank);
            const levelNum = RANK_LEVELS[rank] || getRankVisualInfo(rank).level;

            return (
              <div
                key={rank}
                className="rounded-xl bg-[#090c13] border border-zinc-800 p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-amber-400 bg-[#050505] px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                      LVL {levelNum}
                    </span>
                    <RankBadge rank={rank} size="sm" />
                    <span className="text-xs text-zinc-400 font-mono">
                      ({rankUsers.length} {rankUsers.length === 1 ? 'Member' : 'Members'})
                    </span>
                  </div>

                  {rank === 'New Born' && (
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                      31-Day Initiation Period
                    </span>
                  )}
                  {rank === 'Junior Boss (31-JB)' && (
                    <span className="text-[10px] font-mono text-teal-300 bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-500/30">
                      Made via M19 Ceremony
                    </span>
                  )}
                  {rank === 'No Man' && (
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800">
                      Awaiting O.G+ Approval
                    </span>
                  )}
                </div>

                {rankUsers.length === 0 ? (
                  <div className="text-xs text-zinc-500 italic py-1 pl-1 font-mono">
                    No active members match current filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-0.5">
                    {rankUsers.map((u) => {
                      const visual = getRankVisualInfo(u.rank);
                      return (
                        <div
                          key={u.id}
                          onClick={() => setSelectedProfileUser(u)}
                          className={`p-2.5 rounded-lg bg-[#050505] hover:bg-zinc-900 border ${
                            u.isBanned
                              ? 'border-red-600/60 bg-red-950/10'
                              : 'border-zinc-800 hover:border-amber-500/40'
                          } cursor-pointer transition-all flex items-center gap-2.5 group`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={u.avatarUrl}
                              alt={u.fullName}
                              className={`w-8 h-8 rounded-lg object-cover border transition-all ${
                                u.isBanned ? 'border-red-500 grayscale' : `${visual.avatarHaloClass}`
                              } group-hover:scale-105 transition-transform`}
                            />
                            {u.isBanned && (
                              <span className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full">
                                <ShieldAlert size={8} />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 truncate transition-colors flex items-center gap-1">
                              <span className="truncate">{u.fullName}</span>
                              {u.isBanned && (
                                <span className="text-[8px] bg-red-950 text-red-400 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                                  BANNED
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono truncate">
                              @{u.gtaHandle}
                            </div>
                            {u.specialTitles && u.specialTitles.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {u.specialTitles.map((t) => (
                                  <SpecialTitleBadge key={t} title={t} size="sm" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ROSTER GRID VIEW */}
      {viewMode === 'roster' && (
        <div>
          {filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-zinc-400 bg-[#090c13] rounded-xl border border-zinc-800 space-y-2">
              <Users size={32} className="mx-auto text-zinc-600 mb-1" />
              <h3 className="text-sm font-bold text-zinc-300">No Members Match Filter</h3>
              <p className="text-xs text-zinc-500 font-mono">
                Try adjusting your search keyword, rank selection, or domaine filter.
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 px-3 py-1 bg-amber-500 text-zinc-950 font-bold text-xs rounded shadow font-mono"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredUsers.map((user) => {
                const days = user.simulatedDaysPassed || 1;
                const visual = getRankVisualInfo(user.rank);

                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedProfileUser(user)}
                    className={`p-4 rounded-xl bg-[#090c13] border ${
                      user.isBanned
                        ? 'border-red-600/60 bg-red-950/10'
                        : 'border-zinc-800 hover:border-amber-500/50'
                    } hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-3 group`}
                  >
                    {/* Top Row: Avatar & Name */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className={`w-11 h-11 rounded-xl object-cover border transition-all ${
                            user.isBanned
                              ? 'border-red-500 grayscale'
                              : `${visual.avatarHaloClass}`
                          } group-hover:scale-105 transition-transform`}
                        />
                        {user.isBanned && (
                          <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-red-600 text-white rounded text-[8px] font-mono font-bold">
                            BANNED
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-xs text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                            {user.fullName}
                          </h3>
                          <ExternalLink
                            size={12}
                            className="text-zinc-500 group-hover:text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>

                        <div className="text-[10px] text-amber-400/90 font-mono">
                          GTA: {user.gtaHandle}
                        </div>

                        <div className="pt-0.5">
                          <RankBadge rank={user.rank} size="sm" showLevel />
                        </div>
                      </div>
                    </div>

                    {/* Special Titles & Councils */}
                    {(user.specialTitles?.length > 0 || user.councilAssignments?.length > 0) && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {user.specialTitles?.map((t) => (
                          <SpecialTitleBadge key={t} title={t} size="sm" />
                        ))}
                        {user.councilAssignments?.map((ca) => (
                          <CouncilBadge
                            key={ca.councilId}
                            title={ca.title}
                            domaineName={ca.domaineName}
                            size="sm"
                          />
                        ))}
                      </div>
                    )}

                    {/* Bio snippet */}
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {user.bio}
                    </p>

                    {/* Lineage / Made You Banner */}
                    <div className="pt-2.5 border-t border-zinc-800 text-[10px] text-zinc-400 space-y-0.5 font-mono">
                      {user.isBanned ? (
                        <div className="text-red-400 font-mono text-[10px]">
                          🚨 Banned by: {user.bannedBy || 'Above Founders (AB)'}
                        </div>
                      ) : user.approvedByName ? (
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Crown size={11} className="text-amber-400 shrink-0" />
                          <span className="truncate">
                            {currentUser?.id === user.id ? (
                              <>
                                <strong className="text-amber-200">{user.approvedByName}</strong> (
                                {user.approvedByRank}) Made You
                              </>
                            ) : (
                              <>
                                Made by <strong className="text-amber-200">{user.approvedByName}</strong> (
                                {user.approvedByRank})
                              </>
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="text-zinc-500 text-[10px]">
                          Founding High Table Member
                        </div>
                      )}

                      {user.rank === 'New Born' && !user.isBanned && (
                        <div className="text-amber-400 font-mono text-[10px] flex items-center justify-between">
                          <span>Initiation:</span>
                          <span className="font-bold">Day {days}/31</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
