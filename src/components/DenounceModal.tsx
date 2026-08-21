import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { AlertTriangle, Trash2, Shield, HeartHandshake } from 'lucide-react';

interface DenounceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DenounceModal: React.FC<DenounceModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, denounceMembership } = useFamily();
  const [confirmText, setConfirmText] = useState('');
  const [denounced, setDenounced] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleDenounce = () => {
    if (confirmText.trim().toLowerCase() !== 'denounce') return;

    denounceMembership(currentUser.id);
    setDenounced(true);
    setTimeout(() => {
      setDenounced(false);
      setConfirmText('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-2.5 sm:p-4 pt-4 sm:pt-6 pb-16 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-[#090c13] border border-red-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-zinc-200 my-2 sm:my-auto">
        {!denounced ? (
          <>
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="p-2 bg-red-950/80 rounded-lg border border-red-500/40 text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-red-200">
                  Denounce Family Membership
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono">The SBB Freedom Covenant</p>
              </div>
            </div>

            {/* Sacred Covenant Box */}
            <div className="p-3 bg-[#050505] rounded-lg border border-red-500/30 text-xs text-zinc-300 space-y-1.5 leading-relaxed font-mono">
              <p className="font-semibold text-amber-200 flex items-center gap-1.5 font-sans">
                <HeartHandshake size={14} className="text-amber-400" />
                "No member shall ever be forced to remain within the Family."
              </p>
              <p className="text-[11px] text-zinc-400">
                Every member is always free to denounce their membership and delete their account at any
                time. If you proceed, all your records, rank standing (<strong>{currentUser.rank}</strong>),
                Third Eye sponsorships, recruit records, and dossiers will be completely wiped from the Family registry.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300 font-mono">
                To confirm permanent account deletion, type{' '}
                <span className="text-red-400 font-mono font-bold">DENOUNCE</span> below:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DENOUNCE here"
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 focus:border-red-500 rounded-lg text-xs font-mono text-red-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors font-medium"
              >
                Remain With Family
              </button>
              <button
                type="button"
                disabled={confirmText.trim().toLowerCase() !== 'denounce'}
                onClick={handleDenounce}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Trash2 size={13} />
                <span>Denounce & Wipe</span>
              </button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#050505] border border-zinc-700 text-amber-400 flex items-center justify-center mx-auto">
              <HeartHandshake size={24} />
            </div>
            <h3 className="font-cinzel text-lg font-bold text-zinc-100">
              Membership Denounced with Honor
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-mono">
              Your dossier and records have been wiped clean from the Family database. We wish you success
              in GTA VI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
