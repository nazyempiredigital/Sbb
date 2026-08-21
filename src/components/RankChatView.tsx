import React, { useState, useEffect, useRef } from 'react';
import { useFamily } from '../context/FamilyContext';
import { RankBadge, SpecialTitleBadge } from './RankBadge';
import { RANK_LEVELS, ChatRoom } from '../types';
import {
  Send,
  Lock,
  Radio,
  DoorOpen,
  Flame,
  ShieldCheck,
  Briefcase,
  Crown,
  Sparkles,
  Users,
  LogOut,
  LogIn,
  Volume2,
  VolumeX,
  MessageSquare,
  Menu,
  X,
  Info,
} from 'lucide-react';

export const RankChatView: React.FC = () => {
  const {
    currentUser,
    chatRooms,
    messages,
    activeRoomId,
    setActiveRoomId,
    sendMessage,
    leaveRoom,
    rejoinRoom,
    leftRooms,
    canAccessRoom,
    setSelectedProfileUser,
    users,
  } = useFamily();

  const [inputMessage, setInputMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoom = chatRooms.find((r) => r.id === activeRoomId) || chatRooms[0];
  const roomMessages = messages[activeRoomId] || [];

  const userCanAccess = currentUser ? canAccessRoom(currentUser, activeRoom) : false;
  const userHasLeft = leftRooms.includes(activeRoomId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const playBlip = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !userCanAccess || userHasLeft) return;

    sendMessage(activeRoomId, inputMessage.trim());
    setInputMessage('');
    playBlip();
  };

  const handleQuickRadio = (text: string) => {
    if (!userCanAccess || userHasLeft) return;
    sendMessage(activeRoomId, text);
    playBlip();
  };

  const getRoomIcon = (iconName: string) => {
    switch (iconName) {
      case 'DoorOpen':
        return DoorOpen;
      case 'Flame':
        return Flame;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Briefcase':
        return Briefcase;
      case 'Crown':
        return Crown;
      case 'Sparkles':
        return Sparkles;
      default:
        return MessageSquare;
    }
  };

  const selectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="relative rounded-2xl bg-[#090c13] border border-zinc-800 shadow-2xl overflow-hidden flex flex-row h-[calc(100dvh-130px)] min-h-[580px] max-h-[920px]">
      {/* Desktop Sidebar (Permanent side-by-side) */}
      <div className="hidden md:flex w-80 bg-[#05070c] border-r border-zinc-800 flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-amber-400 animate-pulse" />
            <h2 className="font-cinzel text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Rank Channels
            </h2>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-zinc-400 hover:text-amber-300 transition-colors p-1.5 rounded hover:bg-zinc-800"
            title={soundEnabled ? 'Mute Radio Audio' : 'Unmute Radio Audio'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>

        {/* Room Channels */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 min-h-0">
          {chatRooms.map((room) => {
            const Icon = getRoomIcon(room.iconName);
            const isAccessible = currentUser ? canAccessRoom(currentUser, room) : false;
            const isSelected = activeRoomId === room.id;
            const isLeft = leftRooms.includes(room.id);
            const msgCount = (messages[room.id] || []).length;

            return (
              <button
                key={room.id}
                onClick={() => selectRoom(room.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 relative ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-200 shadow-sm'
                    : 'bg-[#050505] hover:bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : isAccessible
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  {isAccessible ? <Icon size={16} /> : <Lock size={16} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-amber-200' : isAccessible ? 'text-zinc-200' : 'text-zinc-500'
                      }`}
                    >
                      {room.name}
                    </span>
                    {isLeft && (
                      <span className="text-[9px] font-mono bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                        Left
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{room.tagline}</p>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded border text-[9px] uppercase font-semibold ${
                        isAccessible
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30'
                          : 'border-zinc-800 text-zinc-500 bg-zinc-900'
                      }`}
                    >
                      Req: {room.minRank}+
                    </span>
                    <span className="text-zinc-400 font-medium">{msgCount} msgs</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current user rank note */}
        {currentUser && (
          <div className="p-3 bg-[#050505] border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-mono">Your Clearance:</span>
            <RankBadge rank={currentUser.rank} size="sm" />
          </div>
        )}
      </div>

      {/* Mobile Channel Switcher Drawer Modal */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="m-auto w-[92%] max-w-sm max-h-[85vh] bg-[#090c13] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 bg-[#05070c] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio size={18} className="text-amber-400 animate-pulse" />
                <h3 className="font-cinzel text-sm font-bold text-zinc-100">Select Rank Channel</h3>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatRooms.map((room) => {
                const Icon = getRoomIcon(room.iconName);
                const isAccessible = currentUser ? canAccessRoom(currentUser, room) : false;
                const isSelected = activeRoomId === room.id;
                const isLeft = leftRooms.includes(room.id);
                const msgCount = (messages[room.id] || []).length;

                return (
                  <button
                    key={room.id}
                    onClick={() => selectRoom(room.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 shadow-md'
                        : 'bg-[#050505] hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isAccessible
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {isAccessible ? <Icon size={16} /> : <Lock size={16} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate text-zinc-100">{room.name}</span>
                        {isLeft && (
                          <span className="text-[9px] font-mono bg-red-950 text-red-300 px-1 py-0.5 rounded border border-red-500/30">
                            Left
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{room.tagline}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded border text-[9px] uppercase font-semibold ${
                            isAccessible
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30'
                              : 'border-zinc-800 text-zinc-500 bg-zinc-900'
                          }`}
                        >
                          Req: {room.minRank}+
                        </span>
                        <span className="text-zinc-400">{msgCount} transmissions</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {currentUser && (
              <div className="p-3 bg-[#050505] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-[11px]">Your Rank Clearance:</span>
                <RankBadge rank={currentUser.rank} size="sm" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area (Full height flex column) */}
      <div className="flex-1 flex flex-col bg-[#070a10] overflow-hidden min-w-0">
        {/* Room Header */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-[#05070c] border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Channel Switcher Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 flex items-center gap-1.5 shrink-0 shadow-sm"
              title="Switch Rank Channel"
            >
              <Menu size={16} />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Channels</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-200 truncate">
                  {activeRoom.name}
                </h3>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] uppercase font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  Min: {activeRoom.minRank}
                </span>
              </div>
              <p className="hidden sm:block text-xs text-zinc-400 truncate mt-0.5">
                {activeRoom.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Info toggle on mobile */}
            <button
              onClick={() => setShowRoomInfo(!showRoomInfo)}
              className="sm:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              title="Room Information"
            >
              <Info size={16} />
            </button>

            {/* Leave / Rejoin Action */}
            {userCanAccess && (
              <>
                {userHasLeft ? (
                  <button
                    onClick={() => rejoinRoom(activeRoomId)}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors font-mono shadow-sm"
                  >
                    <LogIn size={13} />
                    <span className="hidden xs:inline">Rejoin</span>
                  </button>
                ) : (
                  <button
                    onClick={() => leaveRoom(activeRoomId)}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-zinc-900 hover:bg-red-950/60 border border-zinc-700 hover:border-red-500/40 text-zinc-400 hover:text-red-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors font-mono"
                    title="Leave channel"
                  >
                    <LogOut size={13} />
                    <span className="hidden xs:inline">Leave</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Expanded Room Info Banner (Collapsible) */}
        {showRoomInfo && (
          <div className="sm:hidden p-3 bg-[#0a0f1c] border-b border-zinc-800 text-xs text-zinc-300 space-y-1 animate-in slide-in-from-top-2 duration-150 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
              <span>Req. Rank: {activeRoom.minRank}</span>
              <span>{roomMessages.length} Transmissions</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">{activeRoom.description}</p>
          </div>
        )}

        {/* Message Feed (Dominant Area) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 sm:space-y-4 bg-[#070a10] min-h-0">
          {!userCanAccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#050505] border border-zinc-800 flex items-center justify-center text-zinc-600 shadow-inner">
                <Lock size={26} />
              </div>
              <h4 className="font-cinzel text-base sm:text-lg font-bold text-zinc-300">
                Clearance Denied: Rank Restricted
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed font-mono">
                This channel is strictly reserved for members ranked <strong>{activeRoom.minRank}</strong>{' '}
                or higher. Your current rank is{' '}
                <strong>{currentUser ? currentUser.rank : 'Guest'}</strong>.
              </p>
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="md:hidden mt-2 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-mono text-xs rounded-lg border border-zinc-700"
              >
                Browse Other Channels
              </button>
            </div>
          ) : userHasLeft ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
                <LogOut size={26} />
              </div>
              <h4 className="font-cinzel text-base sm:text-lg font-bold text-red-300">You Left This Channel</h4>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md font-mono">
                You chose to leave {activeRoom.name}. Click Rejoin Channel to receive transmissions and post
                messages again.
              </p>
              <button
                onClick={() => rejoinRoom(activeRoomId)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs sm:text-sm rounded-lg shadow flex items-center gap-2 font-mono transition-all"
              >
                <LogIn size={15} />
                Rejoin Channel
              </button>
            </div>
          ) : roomMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 text-xs sm:text-sm font-mono">
              No transmissions logged yet in this channel. Send the first message to open communications.
            </div>
          ) : (
            roomMessages.map((msg) => {
              const isMe = currentUser?.id === msg.senderId;
              const isSystem = msg.isSystem;

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="p-3 sm:p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/40 text-xs sm:text-sm text-amber-200 font-mono text-center my-2 leading-relaxed max-w-2xl mx-auto shadow-sm"
                  >
                    {msg.text}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 sm:gap-3.5 items-start ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    onClick={() => {
                      const userObj = users.find((u) => u.id === msg.senderId);
                      if (userObj) setSelectedProfileUser(userObj);
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-amber-500/30 shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-md"
                  />

                  <div className={`space-y-1 max-w-[88%] sm:max-w-[78%] ${isMe ? 'items-end text-right' : ''}`}>
                    <div
                      className={`flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                        isMe ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span
                        onClick={() => {
                          const userObj = users.find((u) => u.id === msg.senderId);
                          if (userObj) setSelectedProfileUser(userObj);
                        }}
                        className="font-bold text-zinc-100 hover:text-amber-300 cursor-pointer transition-colors text-xs sm:text-sm tracking-tight"
                      >
                        {msg.senderName}
                      </span>
                      <RankBadge rank={msg.senderRank} size="sm" />
                      {msg.senderSpecialTitles?.map((t) => (
                        <SpecialTitleBadge key={t} title={t} size="sm" />
                      ))}
                      <span className="text-[10px] sm:text-xs text-zinc-500 font-mono ml-0.5">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Message Reading Body */}
                    <div
                      className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md break-words whitespace-pre-wrap ${
                        isMe
                          ? 'bg-gradient-to-br from-amber-500 to-amber-400 text-zinc-950 font-medium rounded-tr-sm border border-amber-300/40 shadow-amber-950/20'
                          : 'bg-[#0f1422] border border-zinc-700/80 text-zinc-100 rounded-tl-sm shadow-zinc-950/40'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Tactical Radio Quick Chips */}
        {userCanAccess && !userHasLeft && (
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#05070c] border-t border-zinc-800 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] sm:text-xs text-zinc-400 font-mono uppercase font-semibold shrink-0">
              Quick:
            </span>
            <button
              onClick={() => handleQuickRadio('⚔️ Family loyalty above all. SBB standing by.')}
              className="text-[11px] sm:text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 whitespace-nowrap transition-colors border border-zinc-700/60 shrink-0"
            >
              "Loyalty Above All"
            </button>
            <button
              onClick={() => handleQuickRadio('👁️ Third Eye watchful oversight active. SBB discipline maintained.')}
              className="text-[11px] sm:text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 whitespace-nowrap transition-colors border border-zinc-700/60 shrink-0"
            >
              "Third Eye Oversight"
            </button>
            <button
              onClick={() => handleQuickRadio('👑 M19 protocol acknowledged. All vows will be honored.')}
              className="text-[11px] sm:text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 whitespace-nowrap transition-colors border border-zinc-700/60 shrink-0"
            >
              "M19 Acknowledged"
            </button>
            <button
              onClick={() => handleQuickRadio('🏎️ Vice City convoy assembly at marina waypoint.')}
              className="text-[11px] sm:text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 whitespace-nowrap transition-colors border border-zinc-700/60 shrink-0"
            >
              "Convoy Assembly"
            </button>
          </div>
        )}

        {/* Message Input Box */}
        {userCanAccess && !userHasLeft ? (
          <form onSubmit={handleSend} className="p-2.5 sm:p-3.5 bg-[#05070c] border-t border-zinc-800 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Transmit to ${activeRoom.name}...`}
              className="flex-1 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#050505] border border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2.5 sm:px-5 sm:py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl flex items-center justify-center transition-all shadow-md shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        ) : (
          <div className="p-3 bg-[#05070c] border-t border-zinc-800 text-center text-xs text-zinc-400 font-mono shrink-0">
            Transmit controls disabled for this channel.
          </div>
        )}
      </div>
    </div>
  );
};
