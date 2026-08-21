import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { LogIn, UserPlus, Shield, Crown, X, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { users, loginUser, signupUser } = useFamily();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login state
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');

  // Signup state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [gtaHandle, setGtaHandle] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    loginUser(selectedUserId);
    onClose();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = signupUser({
      username,
      fullName,
      gtaHandle,
      discordTag,
      bio,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to submit induction application.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-2.5 sm:p-4 pt-4 sm:pt-6 pb-16 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md bg-[#090c13] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-zinc-200 relative my-2 sm:my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors text-xs"
        >
          <X size={14} />
        </button>

        {/* Tab switch */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-[#050505] rounded-lg border border-zinc-800">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LogIn size={13} />
            <span>Member Login</span>
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserPlus size={13} />
            <span>Apply as Recruit</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 text-xs font-medium">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="block text-zinc-300 font-mono text-[11px]">Select Family Member Dossier</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none font-medium text-xs"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.rank}) - @{u.gtaHandle}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-[#05070c] rounded-lg border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed font-mono">
              💡 Select any pre-configured character above to immediately test with their specific rank
              permissions (e.g. Don Salvatore for Apex leadership, O.G Marcus for recruit approvals, New Born
              Leo for 31-day M19 countdown, or Trevor for No Man recruit status).
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <LogIn size={14} />
              <span>Access SBB Portal</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-mono text-[11px] mb-1">Character Full Name / Alias</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Lorenzo 'The Shadow' Falcone"
                required
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-zinc-300 font-mono text-[11px] mb-1">Username / Login ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. lorenzo_falcone"
                  required
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-mono text-[11px] mb-1">GTA VI RP Gamertag</label>
                <input
                  type="text"
                  value={gtaHandle}
                  onChange={(e) => setGtaHandle(e.target.value)}
                  placeholder="e.g. SBB_Lorenzo"
                  required
                  className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-mono text-[11px] mb-1">Discord Tag</label>
              <input
                type="text"
                value={discordTag}
                onChange={(e) => setDiscordTag(e.target.value)}
                placeholder="e.g. Lorenzo#1234"
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-mono text-[11px] mb-1">Roleplay Bio & Aspirations</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Share your GTA VI RP experience, skills, and why you want to serve SBB..."
                className="w-full px-3 py-2 bg-[#050505] border border-zinc-700 rounded-lg text-zinc-200 focus:border-amber-500 focus:outline-none resize-none text-xs"
              />
            </div>

            <div className="p-2.5 bg-[#05070c] border border-amber-500/30 rounded-lg text-[10px] text-amber-300 leading-relaxed font-mono">
              ℹ️ <strong>Initial Standing: No Man.</strong> Your account will be created with recruit standing.
              You will remain a No Man until reviewed and approved by an O.G or higher rank, starting your
              31-day New Born training.
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <UserPlus size={14} />
              <span>Submit Induction Application</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
