import React from 'react';
import {
  Crown,
  Shield,
  Flame,
  Award,
  HeartHandshake,
  Eye,
  CheckCircle2,
  Sparkles,
  Users,
  Target,
} from 'lucide-react';

export const CreedAndRulesView: React.FC = () => {
  return (
    <div className="space-y-6 w-full max-w-full lg:max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-widest">
          <Sparkles size={11} className="text-amber-400" />
          <span>Fictional Royal Mafia Family | GTA VI Roleplay</span>
        </div>

        <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-wider">
          SBB – "SUCCESSFUL BAD BOYS"
        </h1>

        <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mx-auto italic font-serif leading-relaxed">
          "Power, wealth, elegance, and strategy — smooth like Scarface, not flashy for no reason."
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 rounded bg-[#050505] border border-zinc-800 text-xs font-mono text-amber-300 font-bold">
            ⚔️ LOYALTY
          </span>
          <span className="px-3 py-1 rounded bg-[#050505] border border-zinc-800 text-xs font-mono text-teal-300 font-bold">
            🛡️ DISCIPLINE
          </span>
          <span className="px-3 py-1 rounded bg-[#050505] border border-zinc-800 text-xs font-mono text-indigo-300 font-bold">
            👑 BROTHERHOOD
          </span>
          <span className="px-3 py-1 rounded bg-[#050505] border border-zinc-800 text-xs font-mono text-rose-300 font-bold">
            📜 LEGACY
          </span>
        </div>
      </div>

      {/* Grid: Who We Are & Our Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Who We Are */}
        <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
            <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-400">
              <Crown size={16} />
            </div>
            <h2 className="font-cinzel text-base font-bold text-zinc-100">Who We Are</h2>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            A brotherhood, not just a crew. We’re building a name with weight that will be recognized across
            every GTA RP server, not just one. We represent power, wealth, elegance, and strategy - smooth
            like Scarface, not flashy for no reason.
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            When you step into Vice City with SBB, you carry the backing of an organized criminal
            aristocracy built on trust, coordination, and mutual elevation.
          </p>
        </div>

        {/* Our Goal */}
        <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
            <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-400">
              <Target size={16} />
            </div>
            <h2 className="font-cinzel text-base font-bold text-zinc-100">Our Strategic Goal</h2>
          </div>
          <ul className="space-y-2 text-xs text-zinc-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span>Roleplay together, level each other up, and dominate GTA 6</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span>Become the most respected, feared, and populated fictional family in GTA 6</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span>Build our community and legacy before the game even drops</span>
            </li>
          </ul>
        </div>
      </div>

      {/* What We Stand For */}
      <div className="rounded-xl bg-[#090c13] border border-zinc-800 p-5 shadow-xl space-y-4">
        <div className="border-b border-zinc-800 pb-2.5 flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-300">
            <Shield size={16} />
          </div>
          <h2 className="font-cinzel text-base font-bold text-zinc-100">What We Stand For</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#05070c] rounded-lg border border-zinc-800 space-y-1">
            <div className="text-xs font-bold text-amber-300 font-cinzel">Loyalty & Discipline</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Unshakable fidelity to the Family and disciplined execution in all roleplay encounters.
            </p>
          </div>

          <div className="p-3.5 bg-[#05070c] rounded-lg border border-zinc-800 space-y-1">
            <div className="text-xs font-bold text-teal-300 font-cinzel">Brotherhood & Growth</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Helping each other with missions, strategies, protection, and continuous progression.
            </p>
          </div>

          <div className="p-3.5 bg-[#05070c] rounded-lg border border-zinc-800 space-y-1">
            <div className="text-xs font-bold text-indigo-300 font-cinzel">Respect & Good Vibes</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Smart gameplay, mature communication, and zero toxicity within our syndicate ranks.
            </p>
          </div>

          <div className="p-3.5 bg-[#05070c] rounded-lg border border-zinc-800 space-y-1">
            <div className="text-xs font-bold text-rose-300 font-cinzel">Open Sanctuary</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              No discrimination. Open to anyone eligible and dedicated to playing GTA 6 roleplay.
            </p>
          </div>
        </div>
      </div>

      {/* THE SACRED DOCTRINES: The Rule, M19 Protocol, Third Eye, Freedom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* The Rule */}
        <div className="rounded-xl bg-[#090c13] p-5 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-cinzel text-base font-bold border-b border-zinc-800 pb-2.5">
            <Crown size={16} />
            <span>The Rule of SBB</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">
            "When you wear the SBB name, you represent the Family’s standards and reputation. Leadership sets
            direction, but every member leads with maturity."
          </p>
          <p className="text-xs text-amber-400/90 font-mono italic">
            "Not everyone will make it in. Those who do will help write SBB history."
          </p>
        </div>

        {/* The M19 Induction Mandate */}
        <div className="rounded-xl bg-[#090c13] p-5 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-teal-300 font-cinzel text-base font-bold border-b border-zinc-800 pb-2.5">
            <Award size={16} />
            <span>The M19 Ceremony Mandate</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">
            "The M19 is the Family’s official ceremony of membership and induction. Hosted strictly on the{' '}
            <strong>31st day, not the 30th</strong>. It represents the taking of the Family vows and formal
            recognition into the Brotherhood, conferring the rank of <strong>Junior Boss (31-JB)</strong>."
          </p>
          <p className="text-xs text-teal-400 font-mono italic">
            "Attendance at the M19 is compulsory for every New Born on their 31st day."
          </p>
        </div>

        {/* The Third Eye Tradition */}
        <div className="rounded-xl bg-[#090c13] p-5 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-300 font-cinzel text-base font-bold border-b border-zinc-800 pb-2.5">
            <Eye size={16} />
            <span>The Third Eye Tradition</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">
            "New members (No Man) must be approved by an O.G or higher rank. The approver shall serve as the
            recruit's <strong>Third Eye</strong> throughout their 31-day New Born training, fostering personal
            mentorship, guidance, and tactical readiness."
          </p>
        </div>

        {/* Territorial Command Doctrine */}
        <div className="rounded-xl bg-[#090c13] p-5 border border-amber-500/40 shadow-xl space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2 text-amber-300 font-cinzel text-base font-bold border-b border-zinc-800 pb-2.5">
            <Crown size={16} />
            <span>Territorial Governance: Regions & Domaines Doctrine</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#050505] rounded-lg border border-amber-500/30 space-y-1.5">
              <div className="font-bold text-amber-300 font-cinzel flex items-center gap-1.5">
                <span>1. Grand Regions (Ruled by Lords Only)</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Regions are sovereign territorial divisions across Leonida and hold precedence in the Family hierarchy. By High Table decree, <strong className="text-amber-200">Regions are ruled strictly and exclusively by members holding the rank of Lord (Level 7)</strong>.
              </p>
            </div>
            <div className="p-3 bg-[#050505] rounded-lg border border-indigo-500/30 space-y-1.5">
              <div className="font-bold text-indigo-300 font-cinzel flex items-center gap-1.5">
                <span>2. District Domaines (Ruled by O.Gs Only)</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Domaines are specialized operational and economic sectors organized directly within their parent Region. By High Table decree, <strong className="text-indigo-200">Domaines are ruled strictly and exclusively by members holding the rank of O.G (Level 6)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Freedom of Denunciation */}
        <div className="rounded-xl bg-[#090c13] p-5 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-300 font-cinzel text-base font-bold border-b border-zinc-800 pb-2.5">
            <HeartHandshake size={16} />
            <span>Freedom of Denunciation</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">
            "Every member is always free to denounce their membership and delete their account.{' '}
            <strong>No member shall ever be forced to remain within the Family.</strong> A departing member
            leaves with all records wiped clean and without penalty."
          </p>
        </div>
      </div>
    </div>
  );
};
