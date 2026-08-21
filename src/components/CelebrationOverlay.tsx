import React, { useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge } from './RankBadge';
import confetti from 'canvas-confetti';
import { Crown, Sparkles, X, Award, Flame, CheckCircle2 } from 'lucide-react';
import { MafiaRank } from '../types';

export const CelebrationOverlay: React.FC = () => {
  const { celebration, dismissCelebration } = useFamily();

  useEffect(() => {
    if (celebration?.active) {
      // Trigger golden confetti cannon sequence
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#FBBF24', '#D97706', '#FEF3C7', '#FFFFFF', '#10B981'],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });

      // Auto dismiss after 8 seconds if not manually closed
      const timer = setTimeout(() => {
        dismissCelebration();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [celebration, dismissCelebration]);

  if (!celebration?.active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      {/* Golden Glowing Ambient Ring */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#181309] to-[#0a0c14] border-2 border-amber-400/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-center space-y-4 overflow-hidden animate-scale-up">
        {/* Shimmer effect bar */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

        {/* Close Button */}
        <button
          onClick={dismissCelebration}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-700 transition-colors"
        >
          <X size={15} />
        </button>

        {/* Icon & Crest */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-xl flex items-center justify-center">
          <div className="w-full h-full bg-[#0d0b06] rounded-[14px] flex items-center justify-center text-amber-300">
            {celebration.type === 'M19_MADE' ? (
              <Flame size={32} className="text-amber-400 animate-bounce" />
            ) : celebration.type === 'RECRUIT_APPROVED' ? (
              <CheckCircle2 size={32} className="text-emerald-400 animate-pulse" />
            ) : (
              <Crown size={32} className="text-amber-400 animate-pulse" />
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 inline-flex items-center gap-1">
            <Sparkles size={11} />
            FAMILY CEREMONY & MILESTONE
          </span>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100 drop-shadow-md">
            {celebration.title}
          </h2>
          <p className="text-xs text-zinc-300 font-mono leading-relaxed">
            {celebration.subtitle}
          </p>
        </div>

        {/* Member Card */}
        <div className="p-3 bg-[#050505] rounded-xl border border-amber-500/30 flex items-center justify-center gap-3">
          <div className="text-left">
            <div className="font-bold text-sm text-zinc-100">{celebration.userName}</div>
            <div className="mt-0.5">
              <RankBadge rank={celebration.rank as MafiaRank} size="sm" showLevel />
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <button
            onClick={dismissCelebration}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition-all"
          >
            Honor The Decree
          </button>
        </div>
      </div>
    </div>
  );
};
