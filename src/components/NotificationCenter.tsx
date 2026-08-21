import React, { useState, useRef, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  AlertTriangle,
  Crown,
  ChevronRight,
  Shield,
  Clock,
  ExternalLink,
  Flame,
  Check,
  X,
} from 'lucide-react';
import { FamilyNotification } from '../types';

interface NotificationCenterProps {
  onNavigateTab?: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    userNotifications,
    unreadNotifsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    dismissAllNotifications,
    setSelectedProfileUser,
    users,
  } = useFamily();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'milestones' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const milestoneNotifs = userNotifications.filter(
    (n) => n.type === 'M19_MILESTONE_3DAYS' || n.type === 'M19_ELIGIBLE_NOW'
  );

  const filteredNotifs = userNotifications.filter((n) => {
    if (activeFilter === 'milestones') {
      return n.type === 'M19_MILESTONE_3DAYS' || n.type === 'M19_ELIGIBLE_NOW';
    }
    if (activeFilter === 'unread') {
      return !n.read;
    }
    return true;
  });

  const handleNotificationAction = (notif: FamilyNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.targetUserId) {
      const target = users.find((u) => u.id === notif.targetUserId);
      if (target) {
        setSelectedProfileUser(target);
      }
    }
    if (notif.actionTab && onNavigateTab) {
      onNavigateTab(notif.actionTab);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'M19_MILESTONE_3DAYS':
        return <AlertTriangle size={15} className="text-amber-400" />;
      case 'M19_ELIGIBLE_NOW':
        return <Flame size={15} className="text-red-400" />;
      case 'M19_CEREMONY_COMPLETED':
        return <Crown size={15} className="text-emerald-400" />;
      case 'RECRUIT_APPROVED':
        return <Shield size={15} className="text-blue-400" />;
      default:
        return <Sparkles size={15} className="text-amber-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-[#0a0c14] hover:bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-amber-300 transition-all flex items-center justify-center group"
        title="Syndicate Automated Milestone Notifications"
        aria-label="Syndicate Milestone Notifications"
      >
        <Bell
          size={16}
          className={`transition-transform group-hover:scale-110 ${
            unreadNotifsCount > 0 ? 'text-amber-400' : 'text-zinc-400'
          }`}
        />
        {unreadNotifsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse font-mono">
            {unreadNotifsCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Popover Card - Mobile Fixed viewport alignment & Desktop absolute dropdown */}
      {isOpen && (
        <div className="fixed left-2 right-2 top-[90px] sm:left-auto sm:right-0 sm:top-full sm:absolute sm:mt-2 sm:w-[410px] bg-[#0a0d16] border border-zinc-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[calc(85vh-90px)] sm:max-h-[82vh]">
          {/* Header */}
          <div className="p-3.5 bg-[#0e111d] border-b border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  <Bell size={15} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-cinzel text-xs font-bold text-zinc-100 uppercase tracking-wider truncate">
                    Syndicate Milestone Radar
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono truncate">
                    Automated M19 Eligibility Alerts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {unreadNotifsCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold whitespace-nowrap">
                    {unreadNotifsCount} UNREAD
                  </span>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Quick Actions Bar */}
            <div className="flex items-center justify-between gap-1 pt-1 text-[11px] font-mono">
              <div className="flex items-center gap-1 bg-[#05060b] p-0.5 rounded-lg border border-zinc-800 overflow-x-auto no-scrollbar max-w-[80%]">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All ({userNotifications.length})
                </button>
                <button
                  onClick={() => setActiveFilter('milestones')}
                  className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                    activeFilter === 'milestones'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  M19 3-Day ({milestoneNotifs.length})
                </button>
                <button
                  onClick={() => setActiveFilter('unread')}
                  className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                    activeFilter === 'unread'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Unread ({unreadNotifsCount})
                </button>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="p-1 rounded text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                {userNotifications.length > 0 && (
                  <button
                    onClick={dismissAllNotifications}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    title="Clear my alerts"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto divide-y divide-zinc-800/80 p-2 flex-1 space-y-1">
            {filteredNotifs.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <Check size={18} />
                </div>
                <p className="text-xs font-mono text-zinc-400">No active alerts</p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Automated alerts trigger when members enter within 3 days of Day 31 M19 induction.
                </p>
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const isMilestone =
                  notif.type === 'M19_MILESTONE_3DAYS' || notif.type === 'M19_ELIGIBLE_NOW';
                const isCritical = notif.priority === 'CRITICAL';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationAction(notif)}
                    className={`p-3 rounded-xl cursor-pointer transition-all space-y-2 ${
                      notif.read
                        ? 'bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 opacity-80'
                        : isCritical
                        ? 'bg-amber-950/25 hover:bg-amber-950/40 border border-amber-500/40 shadow-sm'
                        : 'bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-700/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span
                          className={`p-1 rounded mt-0.5 shrink-0 ${
                            notif.type === 'M19_ELIGIBLE_NOW'
                              ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                              : isMilestone
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                              : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {getNotificationIcon(notif.type)}
                        </span>
                        <span
                          className={`text-xs font-bold leading-snug break-words ${
                            notif.type === 'M19_ELIGIBLE_NOW'
                              ? 'text-red-300'
                              : isMilestone
                              ? 'text-amber-300'
                              : 'text-zinc-200'
                          }`}
                        >
                          {notif.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notif.id);
                          }}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-800 transition-colors"
                          title="Dismiss"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed font-sans break-words">
                      {notif.message}
                    </p>

                    {/* Metadata Pill Box (Days, Sponsor, Action) */}
                    {notif.meta && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                        {notif.meta.daysPassed !== undefined && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-amber-300 font-bold">
                            Day {notif.meta.daysPassed}/31
                          </span>
                        )}
                        {notif.meta.daysRemaining !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              notif.meta.daysRemaining === 0
                                ? 'bg-red-950/60 text-red-300 border border-red-500/40 animate-pulse'
                                : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {notif.meta.daysRemaining === 0
                              ? '🔥 Ready for M19!'
                              : `⏳ ${notif.meta.daysRemaining} day${
                                  notif.meta.daysRemaining === 1 ? '' : 's'
                                } left`}
                          </span>
                        )}
                        {notif.meta.sponsorName && (
                          <span className="text-zinc-400 truncate max-w-[150px]">
                            Mentor: {notif.meta.sponsorName.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    {notif.actionLabel && (
                      <div className="pt-1 flex justify-end">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 hover:text-amber-300 font-bold">
                          <span>{notif.actionLabel}</span>
                          <ChevronRight size={11} />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-[#0a0c14] border-t border-zinc-800 text-center">
            <span className="text-[9px] font-mono text-zinc-500">
              SBB Syndicate Automated Sentinel • 31-Day M19 Milestone Monitor
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
