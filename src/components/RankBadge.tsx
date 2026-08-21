import React from 'react';
import { MafiaRank, SpecialTitle, CouncilTitle, RANK_LEVELS } from '../types';
import { Shield, Crown, Sparkles, Flame, UserCheck, Award, Swords, Skull, Eye, Zap } from 'lucide-react';

interface RankBadgeProps {
  rank: MafiaRank;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  withShimmer?: boolean;
  className?: string;
}

export type HierarchyTierCategory =
  | 'SOVEREIGN_COMMAND'
  | 'HIGH_TABLE'
  | 'SYNDICATE_OFFICERS'
  | 'MADE_CIRCLE'
  | 'INITIATION'
  | 'GATE_RECRUITS';

export interface RankVisualInfo {
  level: number;
  category: HierarchyTierCategory;
  categoryLabel: string;
  badgeClass: string;
  avatarHaloClass: string;
  textColor: string;
  icon: React.ElementType;
  label: string;
  shortLabel: string;
  accentColor: string;
  glowColorHex: string;
}

export const getRankVisualInfo = (rank: MafiaRank): RankVisualInfo => {
  const rankStr = String(rank || 'No Man');

  if (rankStr.startsWith('PONTUS') || rankStr.startsWith('Pontus')) {
    return {
      level: 11,
      category: 'SOVEREIGN_COMMAND',
      categoryLabel: 'Venerable Sovereign Patriarch (Former Honcho)',
      badgeClass: 'rank-badge-gold-apex rank-shimmer-fx shadow-[0_0_15px_rgba(245,158,11,0.6)]',
      avatarHaloClass: 'avatar-halo-gold',
      textColor: 'text-amber-100 font-bold font-cinzel',
      icon: Crown,
      label: rankStr,
      shortLabel: rankStr,
      accentColor: 'from-amber-300 via-yellow-400 to-amber-600',
      glowColorHex: '#f59e0b',
    };
  }

  if (rankStr.startsWith('HIGH PRIEST') || rankStr.startsWith('High Priest')) {
    return {
      level: 10,
      category: 'HIGH_TABLE',
      categoryLabel: 'High Table Venerable Patriarch (Former Ghost)',
      badgeClass: 'rank-badge-cyan rank-shimmer-fx shadow-[0_0_12px_rgba(6,182,212,0.5)]',
      avatarHaloClass: 'avatar-halo-cyan',
      textColor: 'text-cyan-100 font-bold font-cinzel',
      icon: Skull,
      label: rankStr,
      shortLabel: rankStr,
      accentColor: 'from-cyan-300 via-teal-400 to-blue-600',
      glowColorHex: '#06b6d4',
    };
  }

  if (rankStr === 'BARON' || rankStr === 'Baron') {
    return {
      level: 8,
      category: 'HIGH_TABLE',
      categoryLabel: 'High Table Aristocracy (Former Don)',
      badgeClass: 'rank-badge-purple rank-shimmer-fx shadow-[0_0_10px_rgba(168,85,247,0.4)]',
      avatarHaloClass: 'avatar-halo-purple',
      textColor: 'text-purple-200 font-semibold',
      icon: Award,
      label: 'BARON',
      shortLabel: 'Baron',
      accentColor: 'from-purple-400 via-indigo-500 to-amber-500',
      glowColorHex: '#a855f7',
    };
  }

  switch (rank) {
    case 'Honcho (King)':
      return {
        level: 10,
        category: 'SOVEREIGN_COMMAND',
        categoryLabel: 'Sovereign King Directorate',
        badgeClass: 'rank-badge-gold-apex rank-shimmer-fx',
        avatarHaloClass: 'avatar-halo-gold',
        textColor: 'text-amber-200 font-bold',
        icon: Crown,
        label: 'Honcho (King)',
        shortLabel: 'Honcho',
        accentColor: 'from-amber-400 via-yellow-400 to-amber-600',
        glowColorHex: '#f59e0b',
      };
    case 'Don':
      return {
        level: 8,
        category: 'HIGH_TABLE',
        categoryLabel: 'High Table Council (12 Active Dons)',
        badgeClass: 'rank-badge-gold rank-shimmer-fx',
        avatarHaloClass: 'avatar-halo-gold',
        textColor: 'text-amber-300 font-semibold',
        icon: Sparkles,
        label: 'Don',
        shortLabel: 'Don',
        accentColor: 'from-amber-500 to-yellow-600',
        glowColorHex: '#d97706',
      };
    case 'Ghost (007)':
      return {
        level: 9,
        category: 'HIGH_TABLE',
        categoryLabel: 'High Table Covert Directorate',
        badgeClass: 'rank-badge-cyan rank-shimmer-fx',
        avatarHaloClass: 'avatar-halo-cyan',
        textColor: 'text-cyan-200 font-semibold',
        icon: Skull,
        label: 'Ghost (007)',
        shortLabel: 'Ghost',
        accentColor: 'from-cyan-400 to-teal-500',
        glowColorHex: '#06b6d4',
      };
    case 'Lord':
      return {
        level: 7,
        category: 'HIGH_TABLE',
        categoryLabel: 'High Table Aristocracy (Grand Region Rulers)',
        badgeClass: 'rank-badge-purple rank-shimmer-fx',
        avatarHaloClass: 'avatar-halo-purple',
        textColor: 'text-purple-200 font-semibold',
        icon: Award,
        label: 'Lord',
        shortLabel: 'Lord',
        accentColor: 'from-purple-400 to-indigo-500',
        glowColorHex: '#a855f7',
      };
    case 'O.G':
      return {
        level: 6,
        category: 'HIGH_TABLE',
        categoryLabel: 'Original Gentleman High Table (Domaine Rulers)',
        badgeClass: 'rank-badge-indigo rank-shimmer-fx',
        avatarHaloClass: 'avatar-halo-indigo',
        textColor: 'text-indigo-200 font-semibold',
        icon: Swords,
        label: 'O.G (Original Gentleman)',
        shortLabel: 'O.G',
        accentColor: 'from-indigo-400 to-blue-500',
        glowColorHex: '#6366f1',
      };
    case 'Cartel Man':
      return {
        level: 5,
        category: 'SYNDICATE_OFFICERS',
        categoryLabel: 'Syndicate Operational Command',
        badgeClass: 'rank-badge-emerald',
        avatarHaloClass: 'avatar-halo-emerald',
        textColor: 'text-emerald-200 font-medium',
        icon: Shield,
        label: 'Cartel Man',
        shortLabel: 'Cartel',
        accentColor: 'from-emerald-400 to-teal-600',
        glowColorHex: '#10b981',
      };
    case 'Boss':
      return {
        level: 4,
        category: 'SYNDICATE_OFFICERS',
        categoryLabel: 'Syndicate Operational Command',
        badgeClass: 'rank-badge-blue',
        avatarHaloClass: 'avatar-halo-blue',
        textColor: 'text-blue-200 font-medium',
        icon: Shield,
        label: 'Boss',
        shortLabel: 'Boss',
        accentColor: 'from-blue-400 to-cyan-600',
        glowColorHex: '#0ea5e9',
      };
    case 'Junior Boss (31-JB)':
      return {
        level: 3,
        category: 'MADE_CIRCLE',
        categoryLabel: 'Full Made Man Circle',
        badgeClass: 'rank-badge-teal',
        avatarHaloClass: 'avatar-halo-teal',
        textColor: 'text-teal-200 font-medium',
        icon: Award,
        label: 'Junior Boss (31-JB)',
        shortLabel: '31-JB',
        accentColor: 'from-teal-400 to-emerald-600',
        glowColorHex: '#14b8a6',
      };
    case 'New Born':
      return {
        level: 2,
        category: 'INITIATION',
        categoryLabel: '31-Day Initiation Trial',
        badgeClass: 'rank-badge-amber',
        avatarHaloClass: 'avatar-halo-amber',
        textColor: 'text-amber-200 font-medium',
        icon: Flame,
        label: 'New Born',
        shortLabel: 'New Born',
        accentColor: 'from-amber-500 to-orange-600',
        glowColorHex: '#f97316',
      };
    case 'No Man':
    default:
      return {
        level: 1,
        category: 'GATE_RECRUITS',
        categoryLabel: 'Unconfirmed Recruit at The Gate',
        badgeClass: 'rank-badge-silver',
        avatarHaloClass: 'avatar-halo-silver',
        textColor: 'text-zinc-200 font-medium',
        icon: UserCheck,
        label: 'No Man (Recruit)',
        shortLabel: 'No Man',
        accentColor: 'from-zinc-400 to-zinc-600',
        glowColorHex: '#a1a1aa',
      };
  }
};

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 'md',
  showLevel = false,
  withShimmer = true,
  className = '',
}) => {
  const visual = getRankVisualInfo(rank);
  const Icon = visual.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.2 gap-1 rounded',
    sm: 'text-xs px-2 py-0.5 gap-1.5 rounded-md',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5 rounded-lg',
    lg: 'text-sm md:text-base px-3.5 py-1.5 gap-2 rounded-xl font-bold',
    xl: 'text-base md:text-lg px-4 py-2 gap-2.5 rounded-xl font-bold tracking-wider',
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
  };

  const shimmerClass = withShimmer ? 'rank-shimmer-fx' : '';

  return (
    <span
      className={`inline-flex items-center font-cinzel tracking-wider uppercase whitespace-nowrap shadow-sm transition-all duration-300 ${visual.badgeClass} ${shimmerClass} ${sizeClasses[size]} ${className}`}
      title={`${visual.label} (Level ${visual.level}/11 - ${visual.categoryLabel})`}
    >
      <Icon size={iconSizes[size]} className="shrink-0 drop-shadow" />
      <span className="drop-shadow">{visual.label}</span>
      {showLevel && (
        <span className="ml-1 opacity-80 font-mono text-[10px] bg-black/50 px-1.5 py-0.2 rounded border border-white/10 font-bold">
          L{visual.level}
        </span>
      )}
    </span>
  );
};

export const SpecialTitleBadge: React.FC<{ title: string; size?: 'sm' | 'md' }> = ({
  title,
  size = 'sm',
}) => {
  const getStyle = (t: string) => {
    if (t.startsWith('AM/A13 to ') || t === 'AM (A13)') {
      return 'bg-gradient-to-r from-indigo-950 to-purple-900 border-indigo-500/70 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.3)]';
    }

    switch (t) {
      case 'Supreme Lord':
        return 'bg-gradient-to-r from-amber-950 via-rose-950 to-red-950 border-amber-400/90 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
      case 'Regional Council Elder':
        return 'bg-gradient-to-r from-purple-950 to-indigo-950 border-purple-500/80 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.35)]';
      case 'High Chief':
        return 'bg-gradient-to-r from-amber-950 to-yellow-950 border-amber-500/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.35)]';
      case 'Domaine Council Elder':
        return 'bg-gradient-to-r from-indigo-950 to-blue-950 border-indigo-500/80 text-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.35)]';
      case 'Custodian':
        return 'bg-gradient-to-r from-teal-950 to-emerald-950 border-teal-400/80 text-teal-200 shadow-[0_0_8px_rgba(20,184,166,0.35)]';
      case 'Ash-Lord':
      case 'Ash Lord':
        return 'bg-gradient-to-r from-rose-950 to-red-900 border-rose-500/80 text-rose-200 shadow-[0_0_8px_rgba(244,63,94,0.35)]';
      case 'Caesar':
        return 'bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 border-amber-400/90 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.45)]';
      case 'Pontus':
        return 'bg-gradient-to-r from-amber-950 via-yellow-950 to-orange-950 border-amber-400/90 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-bold';
      case 'High Priest':
        return 'bg-gradient-to-r from-cyan-950 via-teal-950 to-purple-950 border-cyan-400/90 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)] font-bold';
      case 'Baron':
        return 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-purple-400/90 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)] font-bold';
      case 'Silenzio / Silent Killer / 07':
        return 'bg-gradient-to-r from-cyan-950 to-slate-900 border-cyan-500/70 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]';
      case 'Problem Man / P-Man':
        return 'bg-gradient-to-r from-orange-950 to-amber-900 border-orange-500/70 text-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.3)]';
      case 'Bishop':
        return 'bg-gradient-to-r from-purple-950 to-indigo-900 border-purple-500/70 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]';
      case 'FM (Front man)':
        return 'bg-gradient-to-r from-blue-950 to-cyan-900 border-blue-500/70 text-blue-300 shadow-[0_0_8px_rgba(14,165,233,0.3)]';
      case 'O.R':
        return 'bg-gradient-to-r from-emerald-950 to-teal-900 border-emerald-500/70 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
      case 'AM (A13)':
        return 'bg-gradient-to-r from-indigo-950 to-purple-900 border-indigo-500/70 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.3)]';
      default:
        return 'bg-zinc-900 border-zinc-700 text-zinc-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded border font-mono tracking-wider whitespace-nowrap uppercase font-semibold ${getStyle(
        title
      )} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
    >
      ★ {title}
    </span>
  );
};

export const CouncilBadge: React.FC<{
  title: CouncilTitle | string;
  domaineName?: string;
  size?: 'sm' | 'md';
}> = ({ title, domaineName, size = 'sm' }) => {
  const getStyle = (t: string) => {
    switch (t) {
      case 'Supreme Lord':
        return 'bg-gradient-to-r from-amber-950 via-rose-950 to-red-950 border-amber-400/90 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.35)]';
      case 'Regional Council Elder':
        return 'bg-gradient-to-r from-purple-950 to-indigo-950 border-purple-500/80 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.35)]';
      case 'High Chief':
        return 'bg-gradient-to-r from-amber-950 to-yellow-950 border-amber-500/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.35)]';
      case 'Domaine Council Elder':
        return 'bg-gradient-to-r from-indigo-950 to-blue-950 border-indigo-500/80 text-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.35)]';
      case 'Custodian':
        return 'bg-gradient-to-r from-teal-950 to-emerald-950 border-teal-400/80 text-teal-200 shadow-[0_0_8px_rgba(20,184,166,0.35)]';
      case 'Council Elder':
        return 'bg-gradient-to-r from-purple-950 to-indigo-950 border-purple-500/80 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.35)]';
      default:
        return 'bg-zinc-900 border-zinc-700 text-zinc-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border tracking-wider whitespace-nowrap uppercase font-semibold font-mono ${getStyle(
        title
      )} ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
    >
      <Eye size={12} className="shrink-0" />
      <span>{title}</span>
      {domaineName && <span className="text-[9px] opacity-80 font-normal">({domaineName})</span>}
    </span>
  );
};

