import React, { useState, useRef, useEffect } from 'react';
import { MafiaRank, User } from '../types';
import { RankBadge, getRankVisualInfo } from './RankBadge';
import { History, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface InteractiveCelebrationBadgeProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  showTimelineButton?: boolean;
  showCelebrationTrigger?: boolean;
  onOpenTimeline?: () => void;
  className?: string;
  autoCelebrateOnMount?: boolean;
}

export const InteractiveCelebrationBadge: React.FC<InteractiveCelebrationBadgeProps> = ({
  user,
  size = 'md',
  showLevel = true,
  showTimelineButton = true,
  showCelebrationTrigger = true,
  onOpenTimeline,
  className = '',
  autoCelebrateOnMount = false,
}) => {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const prevRankRef = useRef<MafiaRank>(user.rank);
  const visual = getRankVisualInfo(user.rank);

  const triggerCelebration = (e?: React.MouseEvent) => {
    setIsCelebrating(true);

    let originX = 0.5;
    let originY = 0.5;

    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      originX = (rect.left + rect.width / 2) / window.innerWidth;
      originY = (rect.top + rect.height / 2) / window.innerHeight;
    } else if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      originX = (rect.left + rect.width / 2) / window.innerWidth;
      originY = (rect.top + rect.height / 2) / window.innerHeight;
    }

    // High Table gold & apex color confetti burst
    const colors =
      visual.level >= 10
        ? ['#f59e0b', '#fbbf24', '#f43f5e', '#ffffff', '#fb7185', '#ffd700']
        : visual.level >= 6
        ? ['#818cf8', '#c084fc', '#22d3ee', '#fbbf24', '#ffffff']
        : ['#10b981', '#38bdf8', '#fb923c', '#d4d4d8', '#ffffff'];

    // Stage 1: Fast localized burst
    confetti({
      particleCount: 35,
      spread: 60,
      startVelocity: 25,
      origin: { x: originX, y: originY },
      colors,
      ticks: 200,
      gravity: 0.9,
      scalar: 0.9,
    });

    // Stage 2: Starburst sparkle shower after 150ms
    setTimeout(() => {
      confetti({
        particleCount: 20,
        angle: 90,
        spread: 100,
        startVelocity: 30,
        origin: { x: originX, y: originY },
        shapes: ['star', 'circle'],
        colors: ['#ffd700', '#ffffff', '#f59e0b'],
        scalar: 1.1,
      });
    }, 150);

    setTimeout(() => {
      setIsCelebrating(false);
    }, 2200);
  };

  // Trigger celebration if rank changes
  useEffect(() => {
    if (prevRankRef.current !== user.rank) {
      prevRankRef.current = user.rank;
      triggerCelebration();
    }
  }, [user.rank]);

  useEffect(() => {
    if (autoCelebrateOnMount) {
      const timer = setTimeout(() => {
        triggerCelebration();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const promoCount = user.promotionHistory?.length || 1;

  return (
    <div
      ref={badgeRef}
      className={`relative inline-flex items-center gap-1.5 ${className}`}
    >
      {/* Shockwave Aura on celebration */}
      {isCelebrating && (
        <div
          className="absolute -inset-1.5 rounded-xl animate-badge-shockwave pointer-events-none -z-10"
          style={{
            background: `radial-gradient(circle, ${visual.glowColorHex}66 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Sparkle Particles on celebration */}
      {isCelebrating && (
        <>
          <span className="absolute -top-3 -right-2 text-amber-300 animate-sparkle-spin pointer-events-none">
            ✨
          </span>
          <span
            className="absolute -bottom-2 -left-2 text-amber-200 animate-sparkle-spin pointer-events-none"
            style={{ animationDelay: '0.4s' }}
          >
            ★
          </span>
          <span
            className="absolute -top-2 left-1/2 text-rose-300 animate-sparkle-spin pointer-events-none"
            style={{ animationDelay: '0.8s' }}
          >
            ✦
          </span>
        </>
      )}

      {/* Badge container with click-to-celebrate */}
      <div
        onClick={triggerCelebration}
        className={`cursor-pointer transition-all duration-300 transform active:scale-95 ${
          isCelebrating ? 'animate-badge-celebration' : 'hover:scale-[1.03]'
        }`}
        title="Click to trigger rank celebration salute!"
      >
        <RankBadge rank={user.rank} size={size} showLevel={showLevel} withShimmer />
      </div>

      {/* Trigger Celebration Action Icon */}
      {showCelebrationTrigger && (
        <button
          type="button"
          onClick={triggerCelebration}
          title="Trigger celebratory rank salute"
          className="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400 transition-all shadow-sm active:scale-90"
        >
          <Sparkles size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} className={isCelebrating ? 'animate-spin' : ''} />
        </button>
      )}

      {/* Rank Timeline Icon Button */}
      {showTimelineButton && onOpenTimeline && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenTimeline();
          }}
          title={`View Rank Promotion Timeline (${promoCount} milestone${promoCount === 1 ? '' : 's'})`}
          className="group relative p-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-500/50 transition-all shadow-sm flex items-center gap-1 active:scale-90"
        >
          <History size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} className="group-hover:rotate-[-20deg] transition-transform" />
          {promoCount > 1 && (
            <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
              {promoCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
