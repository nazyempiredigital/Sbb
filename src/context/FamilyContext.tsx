import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  MafiaRank,
  SpecialTitle,
  CouncilTitle,
  DomaineCouncil,
  ChatRoom,
  ChatMessage,
  FamilyEvent,
  FamilyAnnouncement,
  FamilyNotification,
  RankPromotionRecord,
  AmA13Request,
  AmA13Assignment,
  RANK_LEVELS,
  PontusRecord,
  HighPriestRecord,
  GhostElectionState,
  DonAppointmentState,
  YearlyPromotionCandidate,
  toRomanNumeral,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COUNCILS,
  CHAT_ROOMS,
  INITIAL_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import confetti from 'canvas-confetti';

export interface M19MilestoneCandidate {
  user: User;
  daysPassed: number;
  daysRemaining: number;
  isReady: boolean;
  statusText: string;
}

export interface CelebrationState {
  active: boolean;
  user: User;
  title: string;
  subtitle: string;
  rank: MafiaRank;
}

interface FamilyContextType {
  currentUser: User | null;
  users: User[];
  councils: DomaineCouncil[];
  chatRooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  announcements: FamilyAnnouncement[];
  events: FamilyEvent[];
  activeRoomId: string;
  leftRooms: string[];
  
  // Notification State
  notifications: FamilyNotification[];
  userNotifications: FamilyNotification[];
  unreadNotifsCount: number;
  m19MilestoneCandidates: M19MilestoneCandidate[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  
  // AM / A13 Mentorship & Assignment State
  amRequests: AmA13Request[];
  sendAmA13Request: (targetUserId: string) => { success: boolean; message: string };
  respondToAmA13Request: (requestId: string, accept: boolean) => { success: boolean; message: string };
  cancelAmA13Assignment: (targetUserId: string) => { success: boolean; message: string };
  
  // Navigation / Modal states
  selectedProfileUser: User | null;
  setSelectedProfileUser: (user: User | null) => void;
  setActiveRoomId: (id: string) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  isQuickActionsOpen: boolean;
  setIsQuickActionsOpen: (open: boolean) => void;
  
  // User Actions
  loginUser: (userId: string) => void;
  logoutUser: () => void;
  signupUser: (data: {
    username: string;
    fullName: string;
    gtaHandle: string;
    discordTag: string;
    bio: string;
  }) => { success: boolean; error?: string };
  updateProfile: (data: Partial<User>) => void;
  updateUserProfile: (userId: string, data: Partial<User>) => { success: boolean; message: string };
  denounceMembership: (userId: string) => void;

  // Rank & Approval Actions
  approveRecruit: (recruitId: string) => { success: boolean; message: string };
  makeJuniorBossM19: (recruitId: string) => { success: boolean; message: string };
  advanceNewBornDays: (userId: string, targetDays: number) => void;
  promoteUserRank: (userId: string, newRank: MafiaRank) => { success: boolean; message: string };
  addPromotionRecord: (
    userId: string,
    record: Omit<RankPromotionRecord, 'id'>
  ) => { success: boolean; message: string };

  // Moderation & Governance (Honcho & Ghost strict authority)
  isHonchoOrGhost: (user?: User | null) => boolean;
  canAccessAdmin: (user?: User | null) => boolean;
  isAboveFounders: (user?: User | null) => boolean;
  banUser: (userId: string, reason?: string) => { success: boolean; message: string };
  unbanUser: (userId: string) => { success: boolean; message: string };
  permanentlyDeleteUser: (userId: string) => { success: boolean; message: string };

  // Celebration state
  celebration: CelebrationState | null;
  triggerCelebration: (user: User, title: string, subtitle: string, rank: MafiaRank) => void;
  dismissCelebration: () => void;

  // Chat Actions
  sendMessage: (roomId: string, text: string) => void;
  leaveRoom: (roomId: string) => void;
  rejoinRoom: (roomId: string) => void;
  canAccessRoom: (user: User | null, room: ChatRoom) => boolean;

  // Admin, Region & Domaine Territorial Governance
  createRegion: (name: string, description?: string, sector?: string) => { success: boolean; message: string };
  createDomaine: (name: string, parentRegionName: string, description?: string, sector?: string) => { success: boolean; message: string };
  updateCouncil: (
    councilId: string,
    updates: {
      name?: string;
      description?: string;
      territorySector?: string;
      regionName?: string;
      leaderUserId?: string;
      leaderTitle?: CouncilTitle;
    }
  ) => { success: boolean; message: string };
  deleteCouncil: (councilId: string) => { success: boolean; message: string };
  appointCustodian: (councilId: string, userId: string) => { success: boolean; message: string };
  removeCustodian: (councilId: string, userId: string) => { success: boolean; message: string };
  appointCouncilElder: (councilId: string, elderUserId: string) => { success: boolean; message: string };
  removeCouncilElder: (councilId: string, elderUserId: string) => { success: boolean; message: string };
  voteForNextLeader: (councilId: string, candidateUserId: string) => { success: boolean; message: string };
  concludeTenureAndElectNextLeader: (councilId: string) => { success: boolean; message: string };

  assignSpecialTitle: (targetUserId: string, title: SpecialTitle, add: boolean) => { success: boolean; message: string };
  createCouncil: (council: Omit<DomaineCouncil, 'id' | 'memberCount'>) => void;
  assignCouncilLeader: (councilId: string, userId: string, title: CouncilTitle) => { success: boolean; message: string };
  createEvent: (event: Omit<FamilyEvent, 'id' | 'createdBy' | 'creatorRank' | 'rsvps' | 'createdAt'>) => void;
  toggleRsvp: (eventId: string) => void;
  createAnnouncement: (ann: Omit<FamilyAnnouncement, 'id' | 'author' | 'authorRank' | 'date'>) => void;
  resetAllData: () => void;

  // High Table Succession, Voting & Appointment System
  pontusRecords: PontusRecord[];
  highPriestRecords: HighPriestRecord[];
  ghostElectionState: GhostElectionState;
  donAppointmentState: DonAppointmentState;
  triggerHonchoStepDown: (customHonchoId?: string) => { success: boolean; message: string };
  triggerGhostStepDown: (customGhostId?: string) => { success: boolean; message: string };
  castGhostVote: (voterDonId: string, candidateDonId: string) => { success: boolean; message: string };
  finalizeGhostElection: () => { success: boolean; message: string };
  appointLordAsDon: (lordUserId: string, appointedByRole: 'HONCHO' | 'GHOST') => { success: boolean; message: string };
  batchAppointLordsForRole: (lordUserIds: string[], role: 'HONCHO' | 'GHOST') => { success: boolean; message: string };
  batchAppointLordsAsDons: (lordUserIds: string[]) => { success: boolean; message: string };
  batchAppointAll12Dons: () => { success: boolean; message: string };
  resetSuccessionWorkflow: () => void;

  // Annual 1-Year Automatic Promotion (JB -> Boss -> Cartel Man -> O.G)
  yearlyPromotionCandidates: YearlyPromotionCandidate[];
  runYearlyPromotions: () => { success: boolean; count: number; message: string };
  promoteSingleYearlyCandidate: (userId: string) => { success: boolean; message: string };
}

const STORAGE_KEY_USERS = 'sbb_mafia_users_v11';
const STORAGE_KEY_CURRENT = 'sbb_mafia_curr_user_v11';
const STORAGE_KEY_COUNCILS = 'sbb_mafia_councils_v11';
const STORAGE_KEY_MESSAGES = 'sbb_mafia_messages_v11';
const STORAGE_KEY_EVENTS = 'sbb_mafia_events_v11';
const STORAGE_KEY_ANNOUNCEMENTS = 'sbb_mafia_announcements_v11';
const STORAGE_KEY_LEFT_ROOMS = 'sbb_mafia_left_rooms_v11';
const STORAGE_KEY_NOTIFICATIONS = 'sbb_mafia_notifs_v11';
const STORAGE_KEY_AM_REQUESTS = 'sbb_mafia_am_reqs_v11';
const STORAGE_KEY_PONTUS = 'sbb_mafia_pontus_v11';
const STORAGE_KEY_HIGH_PRIEST = 'sbb_mafia_high_priest_v11';
const STORAGE_KEY_GHOST_ELECTION = 'sbb_mafia_ghost_election_v11';
const STORAGE_KEY_DON_APPOINTMENT = 'sbb_mafia_don_appointment_v11';

export function cleanThirdEyeString(str?: string): string {
  if (!str) return '';
  return str
    .replace(/Approved as New Born and assigned as Third Eye to /gi, 'Approved as New Born under the Third Eye of ')
    .replace(/assigned as Third Eye to /gi, 'under the Third Eye of ')
    .replace(/Serving as Third Eye to /gi, 'Under the Third Eye of ')
    .replace(/serving as Third Eye to /gi, 'under the Third Eye of ')
    .replace(/assigned as Third Eye/gi, 'under Third Eye sponsorship')
    .replace(/assigned as your Third Eye/gi, 'under your Third Eye watch')
    .replace(/They shall serve as my Third Eye/gi, 'I shall serve as their Third Eye')
    .replace(/serve as my Third Eye/gi, 'I shall serve as their Third Eye')
    .replace(/serve as your Third Eye/gi, 'you serve as their Third Eye');
}

export function sanitizeUserData(userList: User[]): User[] {
  return userList
    .filter((u) => u.rank !== ('AB' as any) && u.id !== 'user-ab-apex')
    .map((u) => {
      let assignments = u.councilAssignments || [];
      let titles = u.specialTitles || [];

      // 1. Honcho, Ghost, Dons, and BARONs CANNOT be Supreme Lord, High Chief, Regional Council Elder, or Domaine Council Elder
      if (
        u.rank === 'Honcho (King)' ||
        u.rank === 'Ghost (007)' ||
        u.rank === 'Ghost' ||
        u.rank === 'Don' ||
        u.rank === 'BARON' ||
        u.rank === 'Pontus' ||
        u.rank === 'High Priest' ||
        u.rank.startsWith('PONTUS') ||
        u.rank.startsWith('HIGH PRIEST')
      ) {
        assignments = assignments.filter(
          (ca) =>
            ca.title !== 'Supreme Lord' &&
            ca.title !== 'High Chief' &&
            ca.title !== 'Regional Council Elder' &&
            ca.title !== 'Domaine Council Elder'
        );
        titles = titles.filter(
          (t) =>
            t !== 'Supreme Lord' &&
            t !== 'High Chief' &&
            t !== 'Regional Council Elder' &&
            t !== 'Domaine Council Elder'
        );
      }

      // 2. Lord can only have Region assignments / titles (Supreme Lord / Regional Council Elder / Caesar / Ash-Lord)
      if (u.rank === 'Lord') {
        assignments = assignments.filter(
          (ca) => ca.title !== 'High Chief' && ca.title !== 'Domaine Council Elder'
        );
        titles = titles.filter(
          (t) => t !== 'High Chief' && t !== 'Domaine Council Elder'
        );
      }

      // 3. O.G can only have Domaine assignments / titles (High Chief / Domaine Council Elder)
      if (u.rank === 'O.G') {
        assignments = assignments.filter(
          (ca) => ca.title !== 'Supreme Lord' && ca.title !== 'Regional Council Elder'
        );
        titles = titles.filter(
          (t) =>
            t !== 'Supreme Lord' &&
            t !== 'Regional Council Elder' &&
            t !== 'Caesar' &&
            t !== 'Ash-Lord'
        );
      }

      // 4. Other ranks (No Man, New Born, Junior Boss, Boss, Cartel Man) cannot have council elder / leader titles or Caesar / Ash-Lord
      if (
        u.rank === 'No Man' ||
        u.rank === 'New Born' ||
        u.rank === 'Junior Boss (31-JB)' ||
        u.rank === 'Boss' ||
        u.rank === 'Cartel Man'
      ) {
        assignments = assignments.filter(
          (ca) =>
            ca.title !== 'Supreme Lord' &&
            ca.title !== 'High Chief' &&
            ca.title !== 'Regional Council Elder' &&
            ca.title !== 'Domaine Council Elder'
        );
        titles = titles.filter(
          (t) =>
            t !== 'Supreme Lord' &&
            t !== 'High Chief' &&
            t !== 'Regional Council Elder' &&
            t !== 'Domaine Council Elder' &&
            t !== 'Caesar' &&
            t !== 'Ash-Lord'
        );
      }

      return {
        ...u,
        specialTitles: titles,
        councilAssignments: assignments,
        bio: cleanThirdEyeString(u.bio),
        statusMessage: cleanThirdEyeString(u.statusMessage),
        promotionHistory: (u.promotionHistory || [])
          .filter((p) => p.rank !== ('AB' as any))
          .map((p) => ({
            ...p,
            note: cleanThirdEyeString(p.note),
          })),
      };
    });
}

export function mergeUsersWithInitial(savedUsers: User[]): User[] {
  const sanitizedSaved = sanitizeUserData(savedUsers);
  const savedMap = new Map<string, User>(sanitizedSaved.map((u) => [u.id, u]));

  // Ensure all initial users exist (especially newly added ranks like Lord & Cartel Man)
  INITIAL_USERS.forEach((initUser) => {
    if (!savedMap.has(initUser.id)) {
      savedMap.set(initUser.id, initUser);
    } else {
      const existing = savedMap.get(initUser.id)!;
      // Merge initial properties
      savedMap.set(initUser.id, {
        ...initUser,
        ...existing,
        // Preserve or upgrade council assignments if empty
        councilAssignments:
          existing.councilAssignments && existing.councilAssignments.length > 0
            ? existing.councilAssignments
            : initUser.councilAssignments,
      });
    }
  });

  return sanitizeUserData(Array.from(savedMap.values()));
}

export function mergeCouncilsWithInitial(savedCouncils: DomaineCouncil[]): DomaineCouncil[] {
  const savedMap = new Map<string, DomaineCouncil>(savedCouncils.map((c) => [c.id, c]));

  INITIAL_COUNCILS.forEach((initCouncil) => {
    if (!savedMap.has(initCouncil.id)) {
      savedMap.set(initCouncil.id, initCouncil);
    } else {
      const existing = savedMap.get(initCouncil.id)!;
      savedMap.set(initCouncil.id, {
        ...initCouncil,
        ...existing,
        type: existing.type || initCouncil.type,
        governingRank: existing.governingRank || initCouncil.governingRank,
      });
    }
  });

  return Array.from(savedMap.values()).map((c) => {
    if (c.type === 'REGION') {
      // Leader and elders must be Lords (remove Honcho, Ghost, Dons, JBs)
      const invalidIds = ['user-king-honcho', 'user-ghost-vito', 'user-jb-dante'];
      const filteredElders = (c.elderUserIds || []).filter(
        (id) => !invalidIds.includes(id) && !id.startsWith('user-don-')
      );
      const isLeaderInvalid =
        !c.leaderUserId || invalidIds.includes(c.leaderUserId) || c.leaderUserId.startsWith('user-don-');
      const initMatch = INITIAL_COUNCILS.find((ic) => ic.id === c.id);
      return {
        ...c,
        governingRank: 'Lord' as const,
        elderUserIds: filteredElders.length > 0 ? filteredElders : (initMatch?.elderUserIds || []),
        leaderUserId: isLeaderInvalid ? (initMatch?.leaderUserId || filteredElders[0]) : c.leaderUserId,
        leaderName: isLeaderInvalid ? (initMatch?.leaderName || 'Vacant') : c.leaderName,
        leaderTitle: 'Supreme Lord' as CouncilTitle,
      };
    } else {
      // Domaine: Leader and elders must be O.Gs
      const invalidIds = ['user-king-honcho', 'user-ghost-vito', 'user-jb-dante'];
      const filteredElders = (c.elderUserIds || []).filter(
        (id) =>
          !invalidIds.includes(id) &&
          !id.startsWith('user-don-') &&
          !id.startsWith('user-lord-')
      );
      const isLeaderInvalid =
        !c.leaderUserId ||
        invalidIds.includes(c.leaderUserId) ||
        c.leaderUserId.startsWith('user-don-') ||
        c.leaderUserId.startsWith('user-lord-');
      const initMatch = INITIAL_COUNCILS.find((ic) => ic.id === c.id);
      return {
        ...c,
        governingRank: 'O.G' as const,
        elderUserIds: filteredElders.length > 0 ? filteredElders : (initMatch?.elderUserIds || []),
        leaderUserId: isLeaderInvalid ? (initMatch?.leaderUserId || filteredElders[0]) : c.leaderUserId,
        leaderName: isLeaderInvalid ? (initMatch?.leaderName || 'Vacant') : c.leaderName,
        leaderTitle: 'High Chief' as CouncilTitle,
      };
    }
  });
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users (merging any existing saved data with full initial rank set)
  const [users, setUsers] = useState<User[]>(() => {
    const saved =
      localStorage.getItem(STORAGE_KEY_USERS) ||
      localStorage.getItem('sbb_mafia_users_v7') ||
      localStorage.getItem('sbb_mafia_users_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return mergeUsersWithInitial(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return sanitizeUserData(INITIAL_USERS);
  });

  // Current User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId =
      localStorage.getItem(STORAGE_KEY_CURRENT) ||
      localStorage.getItem('sbb_mafia_curr_user_v7') ||
      localStorage.getItem('sbb_mafia_curr_user_v6');
    if (savedId) {
      const found = users.find((u) => u.id === savedId);
      if (found) return found;
    }
    // Default to Don Salvatore for instant rich experience
    return users.find((u) => u.id === 'user-king-honcho') || users[0] || null;
  });

  // Councils (merging regions & domaines)
  const [councils, setCouncils] = useState<DomaineCouncil[]>(() => {
    const saved =
      localStorage.getItem(STORAGE_KEY_COUNCILS) ||
      localStorage.getItem('sbb_mafia_councils_v7') ||
      localStorage.getItem('sbb_mafia_councils_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return mergeCouncilsWithInitial(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COUNCILS;
  });

  // Messages
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const cleaned: Record<string, ChatMessage[]> = {};
          Object.keys(parsed).forEach((key) => {
            cleaned[key] = (parsed[key] || []).map((m: ChatMessage) => ({
              ...m,
              text: cleanThirdEyeString(m.text),
            }));
          });
          return cleaned;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MESSAGES;
  });

  // Events
  const [events, setEvents] = useState<FamilyEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EVENTS;
  });

  // Announcements
  const [announcements, setAnnouncements] = useState<FamilyAnnouncement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((a: FamilyAnnouncement) => ({
            ...a,
            title: cleanThirdEyeString(a.title),
            content: cleanThirdEyeString(a.content),
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  // Notifications State
  const [notifications, setNotifications] = useState<FamilyNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((n: FamilyNotification) => ({
            ...n,
            title: cleanThirdEyeString(n.title),
            message: cleanThirdEyeString(n.message),
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // AM / A13 Requests State
  const [amRequests, setAmRequests] = useState<AmA13Request[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AM_REQUESTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [activeRoomId, setActiveRoomId] = useState<string>('room-sbb-general');
  const [leftRooms, setLeftRooms] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LEFT_ROOMS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);

  // Pontus Records (Historical stepped-down Honchos: PONTUS I, PONTUS II, etc.)
  const [pontusRecords, setPontusRecords] = useState<PontusRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PONTUS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // High Priest Records (Historical concluded Ghosts: HIGH PRIEST I, HIGH PRIEST II, etc.)
  const [highPriestRecords, setHighPriestRecords] = useState<HighPriestRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HIGH_PRIEST);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Ghost Election State (12 Dons voting for the new Ghost)
  const [ghostElectionState, setGhostElectionState] = useState<GhostElectionState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_GHOST_ELECTION);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return {
      status: 'INACTIVE',
      votes: {},
    };
  });

  // Don Appointment State (Honcho and Ghost appointing 12 new Dons from Lords)
  const [donAppointmentState, setDonAppointmentState] = useState<DonAppointmentState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DON_APPOINTMENT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return {
      status: 'INACTIVE',
      honchoAppointedLordIds: [],
      ghostAppointedLordIds: [],
    };
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT, currentUser.id);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COUNCILS, JSON.stringify(councils));
  }, [councils]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LEFT_ROOMS, JSON.stringify(leftRooms));
  }, [leftRooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AM_REQUESTS, JSON.stringify(amRequests));
  }, [amRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PONTUS, JSON.stringify(pontusRecords));
  }, [pontusRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HIGH_PRIEST, JSON.stringify(highPriestRecords));
  }, [highPriestRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GHOST_ELECTION, JSON.stringify(ghostElectionState));
  }, [ghostElectionState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DON_APPOINTMENT, JSON.stringify(donAppointmentState));
  }, [donAppointmentState]);

  // Automated M19 Milestone Notification Engine
  // Automatically evaluates New Born members and generates/updates notifications for those within 3 days of Day 31 (Days 28-31)
  useEffect(() => {
    const newBorns = users.filter((u) => u.rank === 'New Born');
    if (newBorns.length === 0) return;

    setNotifications((prev) => {
      let updated = [...prev];
      let changed = false;

      newBorns.forEach((nb) => {
        const daysPassed = nb.simulatedDaysPassed || 1;
        const daysRemaining = Math.max(0, 31 - daysPassed);
        const isWithin3Days = daysPassed >= 28; // Day 28 (3 left), Day 29 (2 left), Day 30 (1 left), Day 31 (Ready)

        if (isWithin3Days) {
          const isReady = daysPassed >= 31;
          const recruitNotifId = `auto-m19-${nb.id}-${daysPassed >= 31 ? 'ready' : `day${daysPassed}`}`;
          const sponsorNotifId = nb.approvedByUserId
            ? `auto-m19-sponsor-${nb.approvedByUserId}-${nb.id}-${daysPassed >= 31 ? 'ready' : `day${daysPassed}`}`
            : null;

          // 1. Check/Add Recruit Notification
          const existingRecruitNotifIndex = updated.findIndex(
            (n) => n.id === recruitNotifId || (n.meta?.recruitId === nb.id && (n.type === 'M19_MILESTONE_3DAYS' || n.type === 'M19_ELIGIBLE_NOW'))
          );

          const recruitNotif: FamilyNotification = {
            id: recruitNotifId,
            userId: nb.id,
            type: isReady ? 'M19_ELIGIBLE_NOW' : 'M19_MILESTONE_3DAYS',
            title: isReady
              ? '🔥 31-DAY TRIAL COMPLETED: M19 CEREMONY READY!'
              : `⚡ M19 MILESTONE IMMINENT: DAY ${daysPassed} OF 31`,
            message: isReady
              ? `Congratulations! You have completed all 31 mandatory probation days under ${nb.approvedByName || 'your Third Eye sponsor'}. You are officially eligible for the sacred M19 Induction Ceremony to be Made a Junior Boss (31-JB). Contact your sponsor or High Command to officiate.`
              : `You are on Day ${daysPassed} of your 31-day trial. Only ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remain until your M19 Ceremony! Review the Family Blood Oath with ${nb.approvedByName || 'your sponsor'}.`,
            priority: 'CRITICAL',
            createdAt: new Date().toISOString(),
            read: false,
            actionLabel: isReady ? 'Review Ceremony Oath' : 'View Milestone Progress',
            actionTab: 'third-eye',
            targetUserId: nb.id,
            meta: {
              recruitId: nb.id,
              recruitName: nb.fullName,
              daysPassed,
              daysRemaining,
              sponsorId: nb.approvedByUserId,
              sponsorName: nb.approvedByName,
            },
          };

          if (existingRecruitNotifIndex >= 0) {
            // Update if day or readiness changed
            const curr = updated[existingRecruitNotifIndex];
            if (curr.meta?.daysPassed !== daysPassed || curr.type !== recruitNotif.type) {
              updated[existingRecruitNotifIndex] = {
                ...recruitNotif,
                read: curr.meta?.daysPassed === daysPassed ? curr.read : false,
              };
              changed = true;
            }
          } else {
            updated = [recruitNotif, ...updated];
            changed = true;
          }

          // 2. Check/Add Sponsor Notification (if recruit has an assigned sponsor)
          if (sponsorNotifId && nb.approvedByUserId) {
            const existingSponsorNotifIndex = updated.findIndex(
              (n) => n.id === sponsorNotifId || (n.userId === nb.approvedByUserId && n.meta?.recruitId === nb.id && (n.type === 'M19_MILESTONE_3DAYS' || n.type === 'M19_ELIGIBLE_NOW'))
            );

            const sponsorNotif: FamilyNotification = {
              id: sponsorNotifId,
              userId: nb.approvedByUserId,
              type: isReady ? 'M19_ELIGIBLE_NOW' : 'M19_MILESTONE_3DAYS',
              title: isReady
                ? `⚡ ACTION REQUIRED: ${nb.fullName} Ready for M19 Officiation`
                : `👁️ THIRD EYE MILESTONE: ${nb.fullName} (Day ${daysPassed}/31)`,
              message: isReady
                ? `Your recruit ${nb.fullName} (@${nb.gtaHandle}) under your Third Eye mentorship has completed all 31 mandatory days. Officiate the M19 Induction Ceremony now in the Third Eye console to confer the rank of Junior Boss (31-JB).`
                : `Your recruit ${nb.fullName} has reached Day ${daysPassed} of 31 (${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining). Prepare their ceremony dossier and schedule the M19 induction vows.`,
              priority: isReady ? 'CRITICAL' : 'HIGH',
              createdAt: new Date().toISOString(),
              read: false,
              actionLabel: isReady ? 'Officiate M19 Now' : 'Inspect Protege Dossier',
              actionTab: 'third-eye',
              targetUserId: nb.id,
              meta: {
                recruitId: nb.id,
                recruitName: nb.fullName,
                daysPassed,
                daysRemaining,
                sponsorId: nb.approvedByUserId,
                sponsorName: nb.approvedByName,
              },
            };

            if (existingSponsorNotifIndex >= 0) {
              const curr = updated[existingSponsorNotifIndex];
              if (curr.meta?.daysPassed !== daysPassed || curr.type !== sponsorNotif.type) {
                updated[existingSponsorNotifIndex] = {
                  ...sponsorNotif,
                  read: curr.meta?.daysPassed === daysPassed ? curr.read : false,
                };
                changed = true;
              }
            } else {
              updated = [sponsorNotif, ...updated];
              changed = true;
            }
          }
        }
      });

      return changed ? updated : prev;
    });
  }, [users]);

  // Candidates list for quick UI bindings
  const m19MilestoneCandidates: M19MilestoneCandidate[] = useMemo(() => {
    return users
      .filter((u) => u.rank === 'New Born' && (u.simulatedDaysPassed || 1) >= 28)
      .map((u) => {
        const daysPassed = u.simulatedDaysPassed || 1;
        const daysRemaining = Math.max(0, 31 - daysPassed);
        const isReady = daysPassed >= 31;
        return {
          user: u,
          daysPassed,
          daysRemaining,
          isReady,
          statusText: isReady
            ? '🔥 31 Days Completed — Eligible for M19 Officiation Now'
            : `⚡ Within 3-Day Milestone (${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left)`,
        };
      })
      .sort((a, b) => b.daysPassed - a.daysPassed);
  }, [users]);

  // User-specific notifications
  const userNotifications = useMemo(() => {
    if (!currentUser) return notifications.filter((n) => n.userId === 'all');
    const isLeadership = currentUser.isAdmin || (RANK_LEVELS[currentUser.rank] || 0) >= 6;

    return notifications.filter((n) => {
      if (n.userId === currentUser.id) return true;
      if (n.userId === 'all') return true;
      // High command can see all critical M19 milestone alerts across the syndicate
      if (isLeadership && (n.type === 'M19_MILESTONE_3DAYS' || n.type === 'M19_ELIGIBLE_NOW' || n.type === 'M19_CEREMONY_COMPLETED')) {
        return true;
      }
      return false;
    });
  }, [currentUser, notifications]);

  const unreadNotifsCount = useMemo(() => {
    return userNotifications.filter((n) => !n.read).length;
  }, [userNotifications]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.userId === currentUser.id || n.userId === 'all') {
          return { ...n, read: true };
        }
        return n;
      })
    );
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const dismissAllNotifications = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.filter((n) => n.userId !== currentUser.id && n.userId !== 'all')
    );
  };

  // Keep currentUser synced with users array changes
  useEffect(() => {
    if (currentUser) {
      const refreshed = users.find((u) => u.id === currentUser.id);
      if (refreshed && JSON.stringify(refreshed) !== JSON.stringify(currentUser)) {
        setCurrentUser(refreshed);
      }
    }
  }, [users]);

  const loginUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const signupUser = (data: {
    username: string;
    fullName: string;
    gtaHandle: string;
    discordTag: string;
    bio: string;
  }) => {
    if (!data.username.trim() || !data.fullName.trim() || !data.gtaHandle.trim()) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    const exists = users.some(
      (u) => u.username.toLowerCase() === data.username.toLowerCase() || u.gtaHandle.toLowerCase() === data.gtaHandle.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'Username or GTA RP handle already exists in the Family registry.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: data.username.trim(),
      fullName: data.fullName.trim(),
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80`,
      gtaHandle: data.gtaHandle.trim(),
      discordTag: data.discordTag.trim() || `${data.username}#0000`,
      rank: 'No Man', // Starts as No Man until approved by O.G or higher
      specialTitles: [],
      councilAssignments: [],
      bio: data.bio.trim() || 'New aspirant seeking entry into SBB GTA VI Roleplay Family.',
      joinedAt: new Date().toISOString(),
      promotionHistory: [
        {
          id: `promo-${Date.now()}`,
          rank: 'No Man',
          promotedAt: new Date().toISOString(),
          note: 'Entered SBB Syndicate as an unconfirmed recruit at The Gate.',
          ceremonyType: 'GATE_APPROVAL',
        },
      ],
      isAdmin: false,
      statusMessage: 'Recruit (No Man) awaiting O.G or higher sponsorship.',
    };

    const updated = [...users, newUser];
    setUsers(updated);
    setCurrentUser(newUser);

    // Notify in SBB General chat
    const gateMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      roomId: 'room-sbb-general',
      senderId: 'system',
      senderName: 'SBB Family Sentinel',
      senderRank: 'Honcho (King)',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      text: `🚪 A new recruit has arrived at The Gate: ${newUser.fullName} (@${newUser.gtaHandle}). Status: No Man. Awaiting review by an O.G or higher rank.`,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      'room-sbb-general': [...(prev['room-sbb-general'] || []), gateMsg],
    }));

    return { success: true };
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = users.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u));
    setUsers(updated);
    setCurrentUser({ ...currentUser, ...data });
  };

  const updateUserProfile = (userId: string, data: Partial<User>) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }
    const isSelf = currentUser.id === userId;
    const canEdit = isSelf || canAccessAdmin(currentUser);

    if (!canEdit) {
      return {
        success: false,
        message: 'Permission denied. Only the member themselves or High Command (Don, Honcho, Ghost) can edit profile details.',
      };
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));

    if (currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
    if (selectedProfileUser?.id === userId) {
      setSelectedProfileUser((prev) => (prev ? { ...prev, ...data } : null));
    }

    return { success: true, message: 'Member profile updated successfully.' };
  };

  const denounceMembership = (userId: string) => {
    const userToDenounce = users.find((u) => u.id === userId);
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);

    // Also update any councils where they were leader
    setCouncils((prev) =>
      prev.map((c) =>
        c.leaderUserId === userId
          ? { ...c, leaderUserId: undefined, leaderName: undefined, leaderTitle: undefined }
          : c
      )
    );

    if (currentUser?.id === userId) {
      setCurrentUser(updatedUsers[0] || null);
    }
    if (selectedProfileUser?.id === userId) {
      setSelectedProfileUser(null);
    }

    if (userToDenounce) {
      const denouncementMsg: ChatMessage = {
        id: `msg-denounce-${Date.now()}`,
        roomId: 'room-sbb-general',
        senderId: 'system',
        senderName: 'SBB Family Sentinel',
        senderRank: 'Honcho (King)',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        text: `🕊️ Notice: ${userToDenounce.fullName} (${userToDenounce.rank}) has exercised their right to denounce membership and departed the Family with honor. All records wiped.`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => ({
        ...prev,
        'room-sbb-general': [...(prev['room-sbb-general'] || []), denouncementMsg],
      }));
    }
  };

  const triggerCelebration = (
    user: User,
    title: string,
    subtitle: string,
    rank: MafiaRank
  ) => {
    setCelebration({
      active: true,
      user,
      title,
      subtitle,
      rank,
    });

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#eab308', '#ffffff', '#ef4444', '#10b981'],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const dismissCelebration = () => {
    setCelebration(null);
  };

  // Strict Honcho & Ghost Check: Only Honcho (King) and Ghost (007) hold ultimate executive authority
  const isHonchoOrGhost = (user?: User | null): boolean => {
    const target = user !== undefined ? user : currentUser;
    if (!target) return false;
    const rankStr = target.rank || '';
    return (
      rankStr === 'Honcho (King)' ||
      rankStr === 'Ghost (007)' ||
      rankStr === 'Ghost' ||
      rankStr === 'Pontus' ||
      rankStr === 'High Priest' ||
      rankStr.startsWith('PONTUS') ||
      rankStr.startsWith('HIGH PRIEST') ||
      Boolean(target.isAdmin)
    );
  };

  // Rule: Rank from O.G and up have access to Admin Council section since voting & appointment happens there.
  const canAccessAdmin = (user?: User | null): boolean => {
    const target = user !== undefined ? user : currentUser;
    if (!target) return false;
    const rankStr = target.rank || '';
    const level = RANK_LEVELS[rankStr] || 0;
    return (
      level >= 6 || // O.G (6), Lord (7), BARON (8), Ghost (9), Don (9), Honcho (10)
      rankStr === 'O.G' ||
      rankStr === 'Lord' ||
      rankStr === 'BARON' ||
      rankStr === 'Don' ||
      rankStr === 'Ghost (007)' ||
      rankStr === 'Honcho (King)' ||
      rankStr === 'Pontus' ||
      rankStr === 'High Priest' ||
      rankStr.startsWith('PONTUS') ||
      rankStr.startsWith('HIGH PRIEST') ||
      Boolean(target.isAdmin) ||
      (target.specialTitles || []).some(
        (t) =>
          t === 'Pontus' ||
          t === 'High Priest' ||
          t === 'Baron' ||
          t.startsWith('PONTUS') ||
          t.startsWith('HIGH PRIEST')
      )
    );
  };

  const isAboveFounders = (_user?: User | null): boolean => {
    return false;
  };

  // High Command disciplinary moderation (Honcho & Ghost only)
  const banUser = (userId: string, reason?: string) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }
    if (!isHonchoOrGhost(currentUser)) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only Honcho (King) and Ghost (007) hold authority to ban member accounts.',
      };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'Member not found.' };
    }

    const banReason = reason || 'Executive Decree of High Table Command';
    const now = new Date().toISOString();

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              isBanned: true,
              banReason,
              bannedAt: now,
              bannedBy: currentUser.fullName,
              statusMessage: `[ACCOUNT BANNED] - ${banReason}`,
            }
          : u
      )
    );

    // Create Critical System Alert Notification
    const notif: FamilyNotification = {
      id: `notif-ban-${Date.now()}`,
      userId: 'all',
      type: 'SYSTEM_ALERT',
      title: '🚨 Member Account Banned by High Table',
      message: `${target.fullName} (${target.rank}) has been banned from the Family by ${currentUser.fullName} (${currentUser.rank}). Reason: ${banReason}`,
      priority: 'CRITICAL',
      createdAt: now,
      read: false,
      meta: {
        recruitId: target.id,
        recruitName: target.fullName,
      },
    };
    setNotifications((prev) => [notif, ...prev]);

    // Send decree to general chat
    const chatAlert: ChatMessage = {
      id: `msg-ban-${Date.now()}`,
      roomId: 'room-sbb-general',
      senderId: 'system',
      senderName: 'High Table Directorate',
      senderRank: currentUser.rank,
      senderAvatar: currentUser.avatarUrl,
      text: `🚨 BAN DECREE: Member ${target.fullName} (@${target.gtaHandle}) has been officially BANNED by ${currentUser.fullName} (${currentUser.rank}). Reason: ${banReason}`,
      createdAt: now,
    };
    setMessages((prev) => ({
      ...prev,
      'room-sbb-general': [...(prev['room-sbb-general'] || []), chatAlert],
      'room-cabinet': [...(prev['room-cabinet'] || []), chatAlert],
    }));

    return {
      success: true,
      message: `Account for ${target.fullName} has been banned.`,
    };
  };

  const unbanUser = (userId: string) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }
    if (!isHonchoOrGhost(currentUser)) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only Honcho (King) and Ghost (007) can reinstate banned accounts.',
      };
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              isBanned: false,
              banReason: undefined,
              bannedAt: undefined,
              bannedBy: undefined,
              statusMessage: 'Reinstated to good standing by High Table Command.',
            }
          : u
      )
    );

    return { success: true, message: 'Member account reinstated successfully.' };
  };

  const permanentlyDeleteUser = (userId: string) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }
    if (!isHonchoOrGhost(currentUser)) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only Honcho (King) and Ghost (007) hold authority to permanently delete accounts.',
      };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'Member not found.' };
    }

    // Permanently filter out the user
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    // Remove any council leadership
    setCouncils((prev) =>
      prev.map((c) =>
        c.leaderUserId === userId
          ? { ...c, leaderUserId: undefined, leaderName: undefined, leaderTitle: undefined }
          : c
      )
    );

    if (currentUser.id === userId) {
      setCurrentUser(users.find((u) => u.id !== userId) || null);
    }
    if (selectedProfileUser?.id === userId) {
      setSelectedProfileUser(null);
    }

    const chatAlert: ChatMessage = {
      id: `msg-purge-${Date.now()}`,
      roomId: 'room-sbb-general',
      senderId: 'system',
      senderName: 'High Table Directorate',
      senderRank: currentUser.rank,
      senderAvatar: currentUser.avatarUrl,
      text: `⚡ PERMANENT PURGE: The account records of ${target.fullName} have been permanently expunged and deleted from the SBB Family registry by ${currentUser.fullName} (${currentUser.rank}).`,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      'room-sbb-general': [...(prev['room-sbb-general'] || []), chatAlert],
      'room-cabinet': [...(prev['room-cabinet'] || []), chatAlert],
    }));

    return {
      success: true,
      message: `Member ${target.fullName} has been permanently deleted and expunged from the Family registry.`,
    };
  };

  const promoteUserRank = (userId: string, newRank: MafiaRank) => {
    if (!currentUser || !isHonchoOrGhost(currentUser)) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only Honcho (King) and Ghost (007) can elevate member ranks.',
      };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'Member not found.' };
    }

    const prevRank = target.rank;
    const now = new Date().toISOString();

    const promoRecord: RankPromotionRecord = {
      id: `promo-${Date.now()}`,
      rank: newRank,
      previousRank: prevRank,
      promotedAt: now,
      promotedByUserId: currentUser.id,
      promotedByName: currentUser.fullName,
      promotedByRank: currentUser.rank,
      note: `Decreed by High Table Command: ${currentUser.fullName} (${currentUser.rank}).`,
      ceremonyType: newRank === 'Honcho (King)' ? 'FOUNDER_ASCENSION' : 'HIGH_TABLE_DECREE',
    };

    let updatedSpecialTitles = [...(target.specialTitles || [])];
    let updatedCouncilAssignments = [...(target.councilAssignments || [])];

    // RULE: If promoted from Junior Boss to higher rank, vacate Custodian seat!
    if (prevRank === 'Junior Boss (31-JB)' && newRank !== 'Junior Boss (31-JB)') {
      updatedSpecialTitles = updatedSpecialTitles.filter((t) => t !== 'Custodian');
      updatedCouncilAssignments = updatedCouncilAssignments.filter((ca) => ca.title !== 'Custodian');
      setCouncils((prev) =>
        prev.map((c) => ({
          ...c,
          custodianUserIds: (c.custodianUserIds || []).filter((id) => id !== userId),
        }))
      );
    }

    // RULE: Honcho, Ghost, Don, and BARON cannot be Supreme Lord, High Chief, Regional Council Elder, or Domaine Council Elder!
    if (
      newRank === 'Honcho (King)' ||
      newRank === 'Ghost (007)' ||
      newRank === 'Ghost' ||
      newRank === 'Don' ||
      newRank === 'BARON'
    ) {
      updatedSpecialTitles = updatedSpecialTitles.filter(
        (t) =>
          t !== 'Supreme Lord' &&
          t !== 'High Chief' &&
          t !== 'Regional Council Elder' &&
          t !== 'Domaine Council Elder'
      );
      updatedCouncilAssignments = updatedCouncilAssignments.filter(
        (ca) =>
          ca.title !== 'Supreme Lord' &&
          ca.title !== 'High Chief' &&
          ca.title !== 'Regional Council Elder' &&
          ca.title !== 'Domaine Council Elder'
      );
      setCouncils((prev) =>
        prev.map((c) => {
          const isElder = (c.elderUserIds || []).includes(userId);
          const isLeader = c.leaderUserId === userId;
          if (!isElder && !isLeader) return c;
          const filtered = (c.elderUserIds || []).filter((id) => id !== userId);
          return {
            ...c,
            elderUserIds: filtered,
            leaderUserId: isLeader ? undefined : c.leaderUserId,
            leaderName: isLeader ? undefined : c.leaderName,
            leaderTitle: isLeader ? undefined : c.leaderTitle,
            memberCount: filtered.length,
          };
        })
      );
    }

    // AUTO-ASSIGNMENT RULE:
    // If promoted to Lord, auto-assign to the first Region with < 12 elders if not already in a Region
    let assignedCouncilNotif: FamilyNotification | null = null;
    if (newRank === 'Lord') {
      const existingRegion = councils.find(
        (c) => c.type === 'REGION' && ((c.elderUserIds || []).length < 12 || !c.leaderUserId)
      );
      if (existingRegion) {
        const isLeaderVacant = !existingRegion.leaderUserId;
        const assignedTitle: CouncilTitle = isLeaderVacant ? 'Supreme Lord' : 'Regional Council Elder';
        const specialTitle: SpecialTitle = isLeaderVacant ? 'Supreme Lord' : 'Regional Council Elder';

        if (!updatedSpecialTitles.includes(specialTitle)) {
          updatedSpecialTitles.push(specialTitle);
        }

        updatedCouncilAssignments = [
          ...updatedCouncilAssignments.filter((ca) => ca.councilId !== existingRegion.id),
          {
            councilId: existingRegion.id,
            councilName: existingRegion.name,
            type: 'REGION',
            regionName: existingRegion.name,
            title: assignedTitle,
            assignedAt: now.split('T')[0],
          },
        ];

        setCouncils((prev) =>
          prev.map((c) => {
            if (c.id === existingRegion.id) {
              const elders = Array.from(new Set([...(c.elderUserIds || []), userId]));
              return {
                ...c,
                elderUserIds: elders,
                leaderUserId: isLeaderVacant ? userId : c.leaderUserId,
                leaderName: isLeaderVacant ? target.fullName : c.leaderName,
                leaderTitle: isLeaderVacant ? 'Supreme Lord' : c.leaderTitle,
                memberCount: elders.length,
              };
            }
            return c;
          })
        );

        assignedCouncilNotif = {
          id: `notif-council-auto-${Date.now()}`,
          userId: target.id,
          type: 'COUNCIL_ASSIGNED',
          title: `🏛️ Auto-Assigned to ${existingRegion.name}`,
          message: `As an ascended Lord, you have been automatically assigned to ${existingRegion.name} as ${assignedTitle}!`,
          createdAt: now,
          read: false,
          priority: 'HIGH',
          meta: { councilId: existingRegion.id, councilName: existingRegion.name, councilTitle: assignedTitle },
        };
      }
    }

    // If promoted to O.G, auto-assign to first Domaine with < 9 elders
    if (newRank === 'O.G') {
      const existingDomaine = councils.find(
        (c) => c.type === 'DOMAINE' && ((c.elderUserIds || []).length < 9 || !c.leaderUserId)
      );
      if (existingDomaine) {
        const isLeaderVacant = !existingDomaine.leaderUserId;
        const assignedTitle: CouncilTitle = isLeaderVacant ? 'High Chief' : 'Domaine Council Elder';
        const specialTitle: SpecialTitle = isLeaderVacant ? 'High Chief' : 'Domaine Council Elder';

        if (!updatedSpecialTitles.includes(specialTitle)) {
          updatedSpecialTitles.push(specialTitle);
        }

        updatedCouncilAssignments = [
          ...updatedCouncilAssignments.filter((ca) => ca.councilId !== existingDomaine.id),
          {
            councilId: existingDomaine.id,
            councilName: existingDomaine.name,
            type: 'DOMAINE',
            regionName: existingDomaine.regionName,
            domaineName: existingDomaine.domaine || existingDomaine.name,
            title: assignedTitle,
            assignedAt: now.split('T')[0],
          },
        ];

        setCouncils((prev) =>
          prev.map((c) => {
            if (c.id === existingDomaine.id) {
              const elders = Array.from(new Set([...(c.elderUserIds || []), userId]));
              return {
                ...c,
                elderUserIds: elders,
                leaderUserId: isLeaderVacant ? userId : c.leaderUserId,
                leaderName: isLeaderVacant ? target.fullName : c.leaderName,
                leaderTitle: isLeaderVacant ? 'High Chief' : c.leaderTitle,
                memberCount: elders.length,
              };
            }
            return c;
          })
        );

        assignedCouncilNotif = {
          id: `notif-council-auto-${Date.now()}`,
          userId: target.id,
          type: 'COUNCIL_ASSIGNED',
          title: `⚔️ Auto-Assigned to ${existingDomaine.name}`,
          message: `As an ascended O.G, you have been automatically assigned to ${existingDomaine.name} as ${assignedTitle}!`,
          createdAt: now,
          read: false,
          priority: 'HIGH',
          meta: { councilId: existingDomaine.id, councilName: existingDomaine.name, councilTitle: assignedTitle },
        };
      }
    }

    const updatedUser: User = {
      ...target,
      rank: newRank,
      specialTitles: updatedSpecialTitles,
      councilAssignments: updatedCouncilAssignments,
      promotionHistory: [...(target.promotionHistory || []), promoRecord],
      statusMessage: `Promoted to ${newRank} by ${currentUser.fullName} (${currentUser.rank}).`,
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    if (currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }
    if (selectedProfileUser?.id === userId) {
      setSelectedProfileUser(updatedUser);
    }

    // Create Rank Promotion Notification
    const promoNotif: FamilyNotification = {
      id: `notif-promo-${Date.now()}`,
      userId: target.id,
      type: 'RANK_PROMOTED',
      title: `🎖️ Rank Elevated: ${newRank}`,
      message: `You have been elevated to the rank of ${newRank} by ${currentUser.fullName} (${currentUser.rank})!`,
      createdAt: now,
      read: false,
      priority: 'HIGH',
      meta: { promotedRank: newRank },
    };

    // System-wide broadcast notification
    const broadcastNotif: FamilyNotification = {
      id: `notif-broadcast-promo-${Date.now()}`,
      userId: 'all',
      type: 'RANK_PROMOTED',
      title: `👑 Ascension Decree: ${updatedUser.fullName}`,
      message: `High Table decree: ${updatedUser.fullName} has been elevated to the rank of ${newRank}!`,
      createdAt: now,
      read: false,
      priority: 'HIGH',
      meta: { promotedRank: newRank, recruitId: updatedUser.id, recruitName: updatedUser.fullName },
    };

    setNotifications((prev) => [
      promoNotif,
      broadcastNotif,
      ...(assignedCouncilNotif ? [assignedCouncilNotif] : []),
      ...prev,
    ]);

    // Send chat broadcast
    const chatMsg: ChatMessage = {
      id: `msg-promo-${Date.now()}`,
      roomId: 'room-prestige',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRank: currentUser.rank,
      senderAvatar: currentUser.avatarUrl,
      text: `🎖️ ASCENSION DECREE: ${updatedUser.fullName} (@${updatedUser.gtaHandle}) has been officially elevated to the rank of ${newRank}! All members give due honor.`,
      createdAt: now,
    };

    setMessages((prev) => ({
      ...prev,
      'room-prestige': [...(prev['room-prestige'] || []), chatMsg],
      'room-sbb-general': [
        ...(prev['room-sbb-general'] || []),
        { ...chatMsg, id: `msg-promo-gen-${Date.now()}`, roomId: 'room-sbb-general' },
      ],
    }));

    triggerCelebration(
      updatedUser,
      `Ascension to ${newRank}`,
      `By High Table Decree, ${updatedUser.fullName} has attained ${newRank} standing!`,
      newRank
    );

    return {
      success: true,
      message: `${target.fullName} has been promoted to ${newRank}.`,
    };
  };

  // Approval mechanic: O.G or higher approves No Man into New Born
  const approveRecruit = (recruitId: string) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }

    const approverLevel = RANK_LEVELS[currentUser.rank];
    if (approverLevel < 6) {
      return {
        success: false,
        message: 'Only O.G (Original Gentleman) or higher ranks (Lord, Ghost, Don, Honcho, AB) can approve recruits into New Borns.',
      };
    }

    const recruit = users.find((u) => u.id === recruitId);
    if (!recruit) {
      return { success: false, message: 'Recruit not found.' };
    }

    if (recruit.rank !== 'No Man') {
      return { success: false, message: `Member is already ranked as ${recruit.rank}.` };
    }

    const now = new Date().toISOString();
    const approveRecord: RankPromotionRecord = {
      id: `promo-${Date.now()}`,
      rank: 'New Born',
      previousRank: 'No Man',
      promotedAt: now,
      promotedByUserId: currentUser.id,
      promotedByName: currentUser.fullName,
      promotedByRank: currentUser.rank,
      note: `Approved as New Born under the Third Eye of ${currentUser.fullName} (${currentUser.rank}).`,
      ceremonyType: 'GATE_APPROVAL',
    };

    const updatedRecruit: User = {
      ...recruit,
      rank: 'New Born',
      approvedAt: now,
      approvedByUserId: currentUser.id,
      approvedByName: currentUser.fullName,
      approvedByRank: currentUser.rank,
      simulatedDaysPassed: 1, // Day 1 starts today!
      promotionHistory: [...(recruit.promotionHistory || []), approveRecord],
      statusMessage: `New Born (Day 1 of 31) - Under the Third Eye of ${currentUser.fullName} (${currentUser.rank}).`,
    };

    setUsers((prev) => prev.map((u) => (u.id === recruitId ? updatedRecruit : u)));

    // Send confirmation message to General and Prestige
    const sysMsg: ChatMessage = {
      id: `msg-appr-${Date.now()}`,
      roomId: 'room-prestige',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRank: currentUser.rank,
      senderAvatar: currentUser.avatarUrl,
      text: `⚔️ By the authority of ${currentUser.fullName} (${currentUser.rank}), recruit ${recruit.fullName} has been approved as a New Born! I shall serve as their Third Eye for the next 31 days until the M19 Ceremony.`,
      createdAt: now,
    };

    setMessages((prev) => ({
      ...prev,
      'room-prestige': [...(prev['room-prestige'] || []), sysMsg],
      'room-sbb-general': [
        ...(prev['room-sbb-general'] || []),
        {
          ...sysMsg,
          id: `msg-appr-gen-${Date.now()}`,
          roomId: 'room-sbb-general',
        },
      ],
    }));

    // Notification for recruit
    const recruitNotif: FamilyNotification = {
      id: `notif-appr-${Date.now()}`,
      userId: recruit.id,
      type: 'RECRUIT_APPROVED',
      title: '⚔️ Welcome to the Syndicate: Day 1 Begins',
      message: `You have been approved as a New Born under the Third Eye of ${currentUser.fullName} (${currentUser.rank})! Complete your 31-day trial for the M19 Ceremony.`,
      createdAt: now,
      read: false,
      priority: 'HIGH',
    };
    setNotifications((prev) => [recruitNotif, ...prev]);

    triggerCelebration(
      updatedRecruit,
      'Approved as New Born',
      `Day 1 Begins! Under the Third Eye of ${currentUser.fullName} (${currentUser.rank}).`,
      'New Born'
    );

    return {
      success: true,
      message: `${recruit.fullName} is now confirmed as a New Born! Their Day 1 begins today and you are serving as their Third Eye.`,
    };
  };

  // M19 Ceremony: Make New Born into Junior Boss (31-JB) on Day 31
  const makeJuniorBossM19 = (recruitId: string) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }

    const hostLevel = RANK_LEVELS[currentUser.rank];
    if (hostLevel < 6) {
      return {
        success: false,
        message: 'Only O.G or higher ranks can officiate the M19 Induction Ceremony.',
      };
    }

    const candidate = users.find((u) => u.id === recruitId);
    if (!candidate) {
      return { success: false, message: 'Candidate not found.' };
    }

    if (candidate.rank !== 'New Born') {
      return {
        success: false,
        message: `Only New Borns can undergo the M19 Ceremony to become a 31-JB. Current rank: ${candidate.rank}.`,
      };
    }

    // Verify 31 days
    const daysPassed = candidate.simulatedDaysPassed || 1;
    if (daysPassed < 31) {
      return {
        success: false,
        message: `Candidate has only completed Day ${daysPassed} of 31. M19 is hosted strictly on the 31st day, not before!`,
      };
    }

    const now = new Date().toISOString();
    const m19Record: RankPromotionRecord = {
      id: `promo-${Date.now()}`,
      rank: 'Junior Boss (31-JB)',
      previousRank: 'New Born',
      promotedAt: now,
      promotedByUserId: currentUser.id,
      promotedByName: currentUser.fullName,
      promotedByRank: currentUser.rank,
      note: `Officially Made at solemn M19 Ceremony on Day 31 by ${currentUser.fullName} (${currentUser.rank}).`,
      ceremonyType: 'M19_INDUCTION',
    };

    const madeUser: User = {
      ...candidate,
      rank: 'Junior Boss (31-JB)',
      madeAt: now,
      madeByUserId: currentUser.id,
      madeByName: currentUser.fullName,
      madeByRank: currentUser.rank,
      promotionHistory: [...(candidate.promotionHistory || []), m19Record],
      statusMessage: `Officially Made as Junior Boss (31-JB) at M19 Ceremony by ${currentUser.fullName}.`,
    };

    setUsers((prev) => prev.map((u) => (u.id === recruitId ? madeUser : u)));

    // Send announcement to Prestige and General and Cabinet
    const ceremonyMsg: ChatMessage = {
      id: `msg-m19-${Date.now()}`,
      roomId: 'room-prestige',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRank: currentUser.rank,
      senderAvatar: currentUser.avatarUrl,
      text: `👑 M19 CEREMONY CONCLUDED: ${candidate.fullName} (@${candidate.gtaHandle}) has taken the solemn Family vows and is officially MADE as a Junior Boss (31-JB)! Welcome to the Brotherhood!`,
      createdAt: now,
    };

    setMessages((prev) => ({
      ...prev,
      'room-prestige': [...(prev['room-prestige'] || []), ceremonyMsg],
      'room-sbb-general': [
        ...(prev['room-sbb-general'] || []),
        {
          ...ceremonyMsg,
          id: `msg-m19-gen-${Date.now()}`,
          roomId: 'room-sbb-general',
        },
      ],
      'room-cabinet': [
        ...(prev['room-cabinet'] || []),
        {
          ...ceremonyMsg,
          id: `msg-m19-cab-${Date.now()}`,
          roomId: 'room-cabinet',
        },
      ],
    }));

    const madeNotif: FamilyNotification = {
      id: `notif-made-${Date.now()}`,
      userId: candidate.id,
      type: 'M19_CEREMONY_COMPLETED',
      title: '👑 Officially Made: Junior Boss (31-JB)',
      message: `You have successfully completed the M19 Ceremony under ${currentUser.fullName} and are officially recognized as a Made Man (Junior Boss 31-JB)!`,
      createdAt: now,
      read: false,
      priority: 'CRITICAL',
    };
    setNotifications((prev) => [madeNotif, ...prev]);

    triggerCelebration(
      madeUser,
      'Made Man: Junior Boss (31-JB)',
      `Completed the 31-Day Crucible and M19 Induction vows under ${currentUser.fullName}!`,
      'Junior Boss (31-JB)'
    );

    return {
      success: true,
      message: `M19 Induction complete! ${candidate.fullName} has been officially Made into a Junior Boss (31-JB).`,
    };
  };

  const addPromotionRecord = (userId: string, record: Omit<RankPromotionRecord, 'id'>) => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'Member not found.' };
    }

    const newRecord: RankPromotionRecord = {
      ...record,
      id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    const updatedUser: User = {
      ...target,
      promotionHistory: [...(target.promotionHistory || []), newRecord],
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (selectedProfileUser?.id === userId) {
      setSelectedProfileUser(updatedUser);
    }
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    return { success: true, message: 'Historical promotion record added successfully.' };
  };

  const advanceNewBornDays = (userId: string, targetDays: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              simulatedDaysPassed: Math.min(31, Math.max(1, targetDays)),
              statusMessage:
                targetDays >= 31
                  ? 'Day 31 reached! Ready for the M19 Induction Ceremony.'
                  : `New Born (Day ${targetDays} of 31).`,
            }
          : u
      )
    );
  };

  const canAccessRoom = (user: User | null, room: ChatRoom): boolean => {
    if (!user) return false;
    const userLevel = RANK_LEVELS[user.rank] || 0;
    const reqLevel = RANK_LEVELS[room.minRank] || 0;
    return userLevel >= reqLevel;
  };

  const sendMessage = (roomId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const room = CHAT_ROOMS.find((r) => r.id === roomId);
    if (!room || !canAccessRoom(currentUser, room)) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRank: currentUser.rank,
      senderAvatar: currentUser.avatarUrl,
      senderSpecialTitles: currentUser.specialTitles,
      senderCouncilTitle: currentUser.councilAssignments?.[0]?.title,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg],
    }));
  };

  const leaveRoom = (roomId: string) => {
    if (!leftRooms.includes(roomId)) {
      setLeftRooms([...leftRooms, roomId]);
    }
  };

  const rejoinRoom = (roomId: string) => {
    setLeftRooms(leftRooms.filter((id) => id !== roomId));
  };

  // Special title assignment by Admin - strictly Honcho & Ghost
  const assignSpecialTitle = (targetUserId: string, title: SpecialTitle, add: boolean) => {
    const isHonchoOrGhost =
      currentUser?.rank === 'Honcho (King)' ||
      currentUser?.rank === 'Ghost (007)' ||
      currentUser?.rank === 'Ghost' ||
      currentUser?.isAdmin;

    if (!isHonchoOrGhost) {
      return { success: false, message: 'Only Honcho (King) and Ghost (007) can bestow or revoke Special Titles.' };
    }

    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: 'User not found.' };
    }

    // STRICT RULE: Custodian is ONLY for 31-JBs!
    if (title === 'Custodian' && targetUser.rank !== 'Junior Boss (31-JB)') {
      return {
        success: false,
        message: 'The "Custodian" title is strictly reserved only for Junior Bosses (31-JB)!',
      };
    }

    let updatedTitles = targetUser.specialTitles || [];
    if (add) {
      // STRICT SYNDICATE LAW: Mutual Exclusivity
      // Someone can’t be an active Supreme Lord or Regional Council Elder and also a Caesar or Ash-Lord.
      if (title === 'Supreme Lord') {
        updatedTitles = updatedTitles.filter(
          (t) => t !== 'Caesar' && t !== 'Ash-Lord' && t !== 'Regional Council Elder'
        );
      } else if (title === 'Regional Council Elder') {
        updatedTitles = updatedTitles.filter(
          (t) => t !== 'Ash-Lord' && t !== 'Caesar' && t !== 'Supreme Lord'
        );
      } else if (title === 'Caesar') {
        updatedTitles = updatedTitles.filter(
          (t) => t !== 'Supreme Lord' && t !== 'High Chief'
        );
      } else if (title === 'Ash-Lord') {
        updatedTitles = updatedTitles.filter(
          (t) => t !== 'Regional Council Elder' && t !== 'Domaine Council Elder'
        );
      } else if (title === 'High Chief') {
        updatedTitles = updatedTitles.filter(
          (t) => t !== 'Caesar' && t !== 'Ash-Lord' && t !== 'Domaine Council Elder'
        );
      } else if (title === 'Domaine Council Elder') {
        updatedTitles = updatedTitles.filter(
          (t) => t !== 'Ash-Lord' && t !== 'Caesar' && t !== 'High Chief'
        );
      }

      if (!updatedTitles.includes(title)) {
        updatedTitles = [...updatedTitles, title];
      }
    } else {
      updatedTitles = updatedTitles.filter((t) => t !== title);
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, specialTitles: updatedTitles } : u))
    );

    return {
      success: true,
      message: `${add ? 'Granted' : 'Revoked'} title "${title}" ${add ? 'to' : 'from'} ${targetUser.fullName}.`,
    };
  };

  // ==========================================
  // TERRITORIAL ESTABLISHMENT & GOVERNANCE
  // ==========================================

  // ESTABLISH REGION: Honcho or Ghost only. Auto-assigns up to 12 Lords. Eldest becomes Supreme Lord.
  // STRICT RULE: Only Lords without any assigned region can be appointed.
  const createRegion = (name: string, description?: string, sector?: string) => {
    const isHonchoOrGhost =
      currentUser?.rank === 'Honcho (King)' ||
      currentUser?.rank === 'Ghost (007)' ||
      currentUser?.rank === 'Ghost' ||
      currentUser?.isAdmin;

    if (!isHonchoOrGhost) {
      return {
        success: false,
        message: 'A Region can ONLY be established by Honcho (King) or Ghost (007)!',
      };
    }

    if (!name.trim()) {
      return { success: false, message: 'Region name is required.' };
    }

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const regionId = `region-${Date.now()}`;

    // Find all Lords currently available (strictly not assigned to another Region)
    const availableLords = users
      .filter(
        (u) =>
          u.rank === 'Lord' &&
          !(u.councilAssignments || []).some((ca) => ca.type === 'REGION') &&
          !councils.some(
            (c) =>
              c.type === 'REGION' &&
              ((c.elderUserIds || []).includes(u.id) || c.leaderUserId === u.id)
          )
      )
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
      .slice(0, 12);

    const elderUserIds: string[] = [];
    let leaderUserId: string | undefined = undefined;
    let leaderName: string | undefined = undefined;
    let leaderTitle: CouncilTitle | undefined = undefined;

    const userUpdates: { id: string; specialTitles: SpecialTitle[]; councilAssignment: User['councilAssignments'][0] }[] = [];
    const assignmentNotifs: FamilyNotification[] = [];

    availableLords.forEach((lord, index) => {
      elderUserIds.push(lord.id);
      const isEldest = index === 0;
      const assignedTitle: CouncilTitle = isEldest ? 'Supreme Lord' : 'Regional Council Elder';
      const assignedSpecial: SpecialTitle = isEldest ? 'Supreme Lord' : 'Regional Council Elder';

      if (isEldest) {
        leaderUserId = lord.id;
        leaderName = lord.fullName;
        leaderTitle = 'Supreme Lord';
      }

      const existingTitles = lord.specialTitles || [];
      const newTitles = existingTitles.includes(assignedSpecial)
        ? existingTitles
        : [...existingTitles, assignedSpecial];

      const assignment: User['councilAssignments'][0] = {
        councilId: regionId,
        councilName: name.trim(),
        type: 'REGION',
        regionName: name.trim(),
        title: assignedTitle,
        assignedAt: now.toISOString().split('T')[0],
      };

      userUpdates.push({
        id: lord.id,
        specialTitles: newTitles,
        councilAssignment: assignment,
      });

      assignmentNotifs.push({
        id: `notif-council-assign-${Date.now()}-${lord.id}`,
        userId: lord.id,
        type: 'COUNCIL_ASSIGNED',
        title: isEldest ? '👑 Decreed Supreme Lord' : '🏛️ Appointed Regional Council Elder',
        message: isEldest
          ? `By registration seniority, you have been established as the Supreme Lord of the newly formed Region "${name.trim()}"!`
          : `You have been appointed as a Regional Council Elder of the newly formed Region "${name.trim()}"!`,
        createdAt: now.toISOString(),
        read: false,
        priority: 'HIGH',
        meta: { councilId: regionId, councilName: name.trim(), councilTitle: assignedTitle },
      });
    });

    const newRegion: DomaineCouncil = {
      id: regionId,
      name: name.trim(),
      type: 'REGION',
      governingRank: 'Lord',
      memberCount: elderUserIds.length,
      elderUserIds,
      custodianUserIds: [],
      leaderUserId,
      leaderName,
      leaderTitle,
      description: description?.trim() || `Sovereign Region governed by 12 Regional Council Elders and Supreme Lord.`,
      territorySector: sector?.trim() || 'Prime Territory',
      establishedByUserId: currentUser.id,
      establishedByName: currentUser.fullName,
      establishedByRank: currentUser.rank,
      establishedAt: now.toISOString(),
      tenureStartDate: now.toISOString(),
      tenureEndDate: oneYearLater.toISOString(),
      nextLeaderVotes: {},
      pastLeaders: [],
    };

    setCouncils((prev) => [newRegion, ...prev]);

    // Apply updates to Lords
    setUsers((prev) =>
      prev.map((u) => {
        const update = userUpdates.find((up) => up.id === u.id);
        if (update) {
          const filteredAssignments = (u.councilAssignments || []).filter((ca) => ca.councilId !== regionId);
          return {
            ...u,
            specialTitles: update.specialTitles,
            councilAssignments: [...filteredAssignments, update.councilAssignment],
          };
        }
        return u;
      })
    );

    // Broadcast notification
    const broadcastNotif: FamilyNotification = {
      id: `notif-region-created-${Date.now()}`,
      userId: 'all',
      type: 'COUNCIL_ESTABLISHED',
      title: `🏛️ New Region Established: ${name.trim()}`,
      message: `Region "${name.trim()}" has been officially established by ${currentUser.fullName} (${currentUser.rank}). ${elderUserIds.length} Lords assigned${leaderName ? `, led by Supreme Lord ${leaderName}` : ''}.`,
      createdAt: now.toISOString(),
      read: false,
      priority: 'HIGH',
      meta: { councilId: regionId, councilName: name.trim() },
    };

    setNotifications((prev) => [broadcastNotif, ...assignmentNotifs, ...prev]);

    // Chat broadcast
    const chatMsg: ChatMessage = {
      id: `msg-region-${Date.now()}`,
      roomId: 'room-cabinet',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRank: currentUser.rank,
      senderAvatar: currentUser.avatarUrl,
      text: `🏛️ TERRITORIAL DECREE: Sovereign Region "${name.trim()}" has been established! Assigned ${elderUserIds.length} Lords. Supreme Lord: ${leaderName || 'Vacant'}.`,
      createdAt: now.toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      'room-cabinet': [...(prev['room-cabinet'] || []), chatMsg],
      'room-sbb-general': [
        ...(prev['room-sbb-general'] || []),
        { ...chatMsg, id: `msg-region-gen-${Date.now()}`, roomId: 'room-sbb-general' },
      ],
    }));

    return {
      success: true,
      message: `Region "${name.trim()}" established successfully with ${elderUserIds.length} Lords assigned! Supreme Lord: ${leaderName || 'None'}.`,
    };
  };

  // ESTABLISH DOMAINE: Honcho or Ghost only. Auto-assigns up to 9 O.Gs. Eldest becomes High Chief.
  // STRICT RULE: Only O.Gs without any assigned domaine can be appointed.
  const createDomaine = (name: string, parentRegionName: string, description?: string, sector?: string) => {
    const isHonchoOrGhost =
      currentUser?.rank === 'Honcho (King)' ||
      currentUser?.rank === 'Ghost (007)' ||
      currentUser?.rank === 'Ghost' ||
      currentUser?.isAdmin;

    if (!isHonchoOrGhost) {
      return {
        success: false,
        message: 'A Domaine can ONLY be established by Honcho (King) or Ghost (007)!',
      };
    }

    if (!name.trim()) {
      return { success: false, message: 'Domaine name is required.' };
    }

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const domaineId = `domaine-${Date.now()}`;

    // Find all O.Gs currently available (strictly not assigned to another Domaine)
    const availableOGs = users
      .filter(
        (u) =>
          u.rank === 'O.G' &&
          !(u.councilAssignments || []).some((ca) => ca.type === 'DOMAINE') &&
          !councils.some(
            (c) =>
              c.type === 'DOMAINE' &&
              ((c.elderUserIds || []).includes(u.id) || c.leaderUserId === u.id)
          )
      )
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
      .slice(0, 9);

    const elderUserIds: string[] = [];
    let leaderUserId: string | undefined = undefined;
    let leaderName: string | undefined = undefined;
    let leaderTitle: CouncilTitle | undefined = undefined;

    const userUpdates: { id: string; specialTitles: SpecialTitle[]; councilAssignment: User['councilAssignments'][0] }[] = [];
    const assignmentNotifs: FamilyNotification[] = [];

    availableOGs.forEach((og, index) => {
      elderUserIds.push(og.id);
      const isEldest = index === 0;
      const assignedTitle: CouncilTitle = isEldest ? 'High Chief' : 'Domaine Council Elder';
      const assignedSpecial: SpecialTitle = isEldest ? 'High Chief' : 'Domaine Council Elder';

      if (isEldest) {
        leaderUserId = og.id;
        leaderName = og.fullName;
        leaderTitle = 'High Chief';
      }

      const existingTitles = og.specialTitles || [];
      const newTitles = existingTitles.includes(assignedSpecial)
        ? existingTitles
        : [...existingTitles, assignedSpecial];

      const assignment: User['councilAssignments'][0] = {
        councilId: domaineId,
        councilName: name.trim(),
        type: 'DOMAINE',
        regionName: parentRegionName.trim() || 'Autonomous',
        domaineName: name.trim(),
        title: assignedTitle,
        assignedAt: now.toISOString().split('T')[0],
      };

      userUpdates.push({
        id: og.id,
        specialTitles: newTitles,
        councilAssignment: assignment,
      });

      assignmentNotifs.push({
        id: `notif-council-assign-${Date.now()}-${og.id}`,
        userId: og.id,
        type: 'COUNCIL_ASSIGNED',
        title: isEldest ? '⚔️ Decreed High Chief' : '🛡️ Appointed Domaine Council Elder',
        message: isEldest
          ? `By registration seniority, you have been established as the High Chief of the newly formed Domaine "${name.trim()}" under Region ${parentRegionName}!`
          : `You have been appointed as a Domaine Council Elder of the newly formed Domaine "${name.trim()}"!`,
        createdAt: now.toISOString(),
        read: false,
        priority: 'HIGH',
        meta: { councilId: domaineId, councilName: name.trim(), councilTitle: assignedTitle },
      });
    });

    const newDomaine: DomaineCouncil = {
      id: domaineId,
      name: name.trim(),
      type: 'DOMAINE',
      regionName: parentRegionName.trim() || 'Autonomous',
      domaine: name.trim(),
      governingRank: 'O.G',
      memberCount: elderUserIds.length,
      elderUserIds,
      custodianUserIds: [],
      leaderUserId,
      leaderName,
      leaderTitle,
      description: description?.trim() || `Operational Domaine governed by 9 Domaine Council Elders and High Chief.`,
      territorySector: sector?.trim() || 'District Jurisdiction',
      establishedByUserId: currentUser.id,
      establishedByName: currentUser.fullName,
      establishedByRank: currentUser.rank,
      establishedAt: now.toISOString(),
      tenureStartDate: now.toISOString(),
      tenureEndDate: oneYearLater.toISOString(),
      nextLeaderVotes: {},
      pastLeaders: [],
    };

    setCouncils((prev) => [newDomaine, ...prev]);

    // Apply updates to O.Gs
    setUsers((prev) =>
      prev.map((u) => {
        const update = userUpdates.find((up) => up.id === u.id);
        if (update) {
          const filteredAssignments = (u.councilAssignments || []).filter((ca) => ca.councilId !== domaineId);
          return {
            ...u,
            specialTitles: update.specialTitles,
            councilAssignments: [...filteredAssignments, update.councilAssignment],
          };
        }
        return u;
      })
    );

    // Broadcast notification
    const broadcastNotif: FamilyNotification = {
      id: `notif-domaine-created-${Date.now()}`,
      userId: 'all',
      type: 'COUNCIL_ESTABLISHED',
      title: `⚔️ New Domaine Established: ${name.trim()}`,
      message: `Domaine "${name.trim()}" (Region: ${parentRegionName}) has been officially established by ${currentUser.fullName} (${currentUser.rank}). ${elderUserIds.length} O.Gs assigned${leaderName ? `, led by High Chief ${leaderName}` : ''}.`,
      createdAt: now.toISOString(),
      read: false,
      priority: 'HIGH',
      meta: { councilId: domaineId, councilName: name.trim() },
    };

    setNotifications((prev) => [broadcastNotif, ...assignmentNotifs, ...prev]);

    // Chat broadcast
    const chatMsg: ChatMessage = {
      id: `msg-domaine-${Date.now()}`,
      roomId: 'room-prestige',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRank: currentUser.rank,
      senderAvatar: currentUser.avatarUrl,
      text: `⚔️ DOMAINE DECREE: Domaine "${name.trim()}" (Region: ${parentRegionName}) established! Assigned ${elderUserIds.length} O.Gs. High Chief: ${leaderName || 'Vacant'}.`,
      createdAt: now.toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      'room-prestige': [...(prev['room-prestige'] || []), chatMsg],
      'room-sbb-general': [
        ...(prev['room-sbb-general'] || []),
        { ...chatMsg, id: `msg-domaine-gen-${Date.now()}`, roomId: 'room-sbb-general' },
      ],
    }));

    return {
      success: true,
      message: `Domaine "${name.trim()}" established successfully with ${elderUserIds.length} O.Gs assigned! High Chief: ${leaderName || 'None'}.`,
    };
  };

  // EDIT / UPDATE REGION OR DOMAINE
  const updateCouncil = (
    councilId: string,
    updates: {
      name?: string;
      description?: string;
      territorySector?: string;
      regionName?: string;
      leaderUserId?: string;
      leaderTitle?: CouncilTitle;
    }
  ) => {
    if (!currentUser || (!currentUser.isAdmin && RANK_LEVELS[currentUser.rank] < 6)) {
      return {
        success: false,
        message: 'Only High Table or territorial leadership (O.G+) can edit territorial details.',
      };
    }

    const council = councils.find((c) => c.id === councilId);
    if (!council) {
      return { success: false, message: 'Council / Region not found.' };
    }

    const oldName = council.name;
    const newName = updates.name !== undefined ? updates.name.trim() : council.name;
    if (!newName) {
      return { success: false, message: 'Territory name cannot be empty.' };
    }

    const newDescription = updates.description !== undefined ? updates.description.trim() : council.description;
    const newSector = updates.territorySector !== undefined ? updates.territorySector.trim() : council.territorySector;
    const newParentRegion = updates.regionName !== undefined ? updates.regionName.trim() : council.regionName;

    let updatedLeaderUserId = council.leaderUserId;
    let updatedLeaderName = council.leaderName;
    let updatedLeaderTitle = council.leaderTitle;
    let updatedElderUserIds = [...(council.elderUserIds || [])];

    const isRegion = council.type === 'REGION';

    // Handle leader change if specified
    if (updates.leaderUserId !== undefined && updates.leaderUserId !== council.leaderUserId) {
      if (updates.leaderUserId === '') {
        updatedLeaderUserId = undefined;
        updatedLeaderName = undefined;
        updatedLeaderTitle = undefined;
      } else {
        const targetNewLeader = users.find((u) => u.id === updates.leaderUserId);
        if (!targetNewLeader) {
          return { success: false, message: 'Specified new leader member not found.' };
        }

        // Enforce rank rules for leadership
        if (isRegion && targetNewLeader.rank !== 'Lord') {
          return {
            success: false,
            message: `Strict Syndicate Law: Regional Supreme Lord must be a Lord! ${targetNewLeader.fullName} holds rank "${targetNewLeader.rank}".`,
          };
        }
        if (!isRegion && targetNewLeader.rank !== 'O.G') {
          return {
            success: false,
            message: `Strict Syndicate Law: Domaine High Chief must be an O.G! ${targetNewLeader.fullName} holds rank "${targetNewLeader.rank}".`,
          };
        }

        // STRICT SYNDICATE LAW: One person cannot be Supreme Lord / Regional Council Elder in different regions, same for Domaine High Chief / Domaine Council Elder
        if (isRegion) {
          const otherRegion = councils.find(
            (c) =>
              c.type === 'REGION' &&
              c.id !== councilId &&
              ((c.elderUserIds || []).includes(targetNewLeader.id) || c.leaderUserId === targetNewLeader.id)
          );
          if (otherRegion) {
            return {
              success: false,
              message: `Strict Syndicate Law: One person cannot be Supreme Lord or Regional Council Elder in different regions! ${targetNewLeader.fullName} is already assigned to "${otherRegion.name}".`,
            };
          }
        } else {
          const otherDomaine = councils.find(
            (c) =>
              c.type === 'DOMAINE' &&
              c.id !== councilId &&
              ((c.elderUserIds || []).includes(targetNewLeader.id) || c.leaderUserId === targetNewLeader.id)
          );
          if (otherDomaine) {
            return {
              success: false,
              message: `Strict Syndicate Law: One person cannot be Domaine High Chief or Domaine Council Elder in different domaines! ${targetNewLeader.fullName} is already assigned to "${otherDomaine.name}".`,
            };
          }
        }

        updatedLeaderUserId = targetNewLeader.id;
        updatedLeaderName = targetNewLeader.fullName;
        updatedLeaderTitle = isRegion ? 'Supreme Lord' : 'High Chief';

        // Ensure leader is in elderUserIds
        if (!updatedElderUserIds.includes(targetNewLeader.id)) {
          updatedElderUserIds = [targetNewLeader.id, ...updatedElderUserIds];
        }
      }
    }

    const now = new Date().toISOString();

    // Update Councils state
    setCouncils((prev) =>
      prev.map((c) => {
        if (c.id === councilId) {
          return {
            ...c,
            name: newName,
            description: newDescription,
            territorySector: newSector,
            regionName: isRegion ? undefined : newParentRegion,
            domaine: !isRegion ? newName : undefined,
            leaderUserId: updatedLeaderUserId,
            leaderName: updatedLeaderName,
            leaderTitle: updatedLeaderTitle,
            elderUserIds: updatedElderUserIds,
            memberCount: updatedElderUserIds.length,
          };
        }
        // If this is a Grand Region and its name changed, update any child Domaine's parent regionName
        if (isRegion && oldName !== newName && c.type === 'DOMAINE' && c.regionName === oldName) {
          return {
            ...c,
            regionName: newName,
          };
        }
        return c;
      })
    );

    // Update Users' council assignments & special titles if name or leader changed
    setUsers((prev) =>
      prev.map((u) => {
        let userAssignments = u.councilAssignments || [];
        let userSpecialTitles = u.specialTitles || [];
        let modified = false;

        // If user was assigned to this council, update the councilName and regionName
        if (userAssignments.some((ca) => ca.councilId === councilId)) {
          userAssignments = userAssignments.map((ca) => {
            if (ca.councilId === councilId) {
              return {
                ...ca,
                councilName: newName,
                regionName: isRegion ? newName : newParentRegion || ca.regionName,
                domaineName: !isRegion ? newName : undefined,
                title: u.id === updatedLeaderUserId ? (updatedLeaderTitle || ca.title) : (
                  ca.title === 'Supreme Lord' || ca.title === 'High Chief'
                    ? (isRegion ? 'Regional Council Elder' : 'Domaine Council Elder')
                    : ca.title
                ),
              };
            }
            return ca;
          });
          modified = true;
        }

        // If old leader changed, update old leader's special titles
        if (council.leaderUserId && council.leaderUserId !== updatedLeaderUserId && u.id === council.leaderUserId) {
          userSpecialTitles = userSpecialTitles.filter((t) => t !== 'Supreme Lord' && t !== 'High Chief');
          const elderTitle: SpecialTitle = isRegion ? 'Regional Council Elder' : 'Domaine Council Elder';
          if (!userSpecialTitles.includes(elderTitle)) {
            userSpecialTitles.push(elderTitle);
          }
          modified = true;
        }

        // If new leader appointed, give them the leader special title
        if (updatedLeaderUserId && u.id === updatedLeaderUserId) {
          const leaderSpecial: SpecialTitle = isRegion ? 'Supreme Lord' : 'High Chief';
          if (!userSpecialTitles.includes(leaderSpecial)) {
            userSpecialTitles.push(leaderSpecial);
          }
          modified = true;
        }

        return modified
          ? { ...u, councilAssignments: userAssignments, specialTitles: userSpecialTitles }
          : u;
      })
    );

    // Broadcast update notification
    const editNotif: FamilyNotification = {
      id: `notif-council-edit-${Date.now()}`,
      userId: 'all',
      type: 'COUNCIL_ESTABLISHED',
      title: `🏛️ Territory Updated: ${newName}`,
      message: `${isRegion ? 'Region' : 'Domaine'} "${newName}" details have been updated by ${currentUser.fullName} (${currentUser.rank}).`,
      createdAt: now,
      read: false,
      priority: 'NORMAL',
      meta: { councilId: council.id, councilName: newName },
    };
    setNotifications((prev) => [editNotif, ...prev]);

    return {
      success: true,
      message: `Successfully updated ${isRegion ? 'Region' : 'Domaine'} "${newName}".`,
    };
  };

  // DELETE / DISSOLVE TERRITORY
  const deleteCouncil = (councilId: string) => {
    if (!currentUser || (!currentUser.isAdmin && currentUser.rank !== 'Honcho (King)' && currentUser.rank !== 'Ghost (007)')) {
      return { success: false, message: 'Only Honcho, Ghost, or Admins can dissolve territories.' };
    }

    const council = councils.find((c) => c.id === councilId);
    if (!council) return { success: false, message: 'Council not found.' };

    setCouncils((prev) => prev.filter((c) => c.id !== councilId));

    // Remove assignments from users
    setUsers((prev) =>
      prev.map((u) => {
        const assignments = (u.councilAssignments || []).filter((ca) => ca.councilId !== councilId);
        return { ...u, councilAssignments: assignments };
      })
    );

    return { success: true, message: `Territory "${council.name}" has been dissolved.` };
  };

  // APPOINT CUSTODIAN: Strictly only 31-JBs can be appointed! Strictly ONE region per person!
  const appointCustodian = (councilId: string, userId: string) => {
    if (!currentUser || (!currentUser.isAdmin && RANK_LEVELS[currentUser.rank] < 6)) {
      return {
        success: false,
        message: 'Only High Table or territorial leadership (O.G+) can appoint Custodians.',
      };
    }

    const council = councils.find((c) => c.id === councilId);
    const targetUser = users.find((u) => u.id === userId);

    if (!council || !targetUser) {
      return { success: false, message: 'Council or Member not found.' };
    }

    // STRICT LAW 1: Only Junior Boss (31-JB) can be a Custodian!
    if (targetUser.rank !== 'Junior Boss (31-JB)') {
      return {
        success: false,
        message: `Strict Syndicate Law: Only Junior Bosses (31-JB) can be appointed as Custodians! ${targetUser.fullName} is currently "${targetUser.rank}".`,
      };
    }

    // STRICT LAW 2: One region/territory per person across the entire syndicate!
    const existingCouncilWithCustodian = councils.find(
      (c) => (c.custodianUserIds || []).includes(userId)
    );

    if (existingCouncilWithCustodian) {
      if (existingCouncilWithCustodian.id === councilId) {
        return { success: false, message: `${targetUser.fullName} is already a Custodian of ${council.name}.` };
      } else {
        return {
          success: false,
          message: `Strict Syndicate Law: One person can only be a custodian in ONE region/territory! ${targetUser.fullName} is already appointed as Custodian in "${existingCouncilWithCustodian.name}". You must remove them from that territory first before assigning them to ${council.name}.`,
        };
      }
    }

    const now = new Date().toISOString();

    // Update council
    setCouncils((prev) =>
      prev.map((c) => {
        if (c.id === councilId) {
          const custodians = [...(c.custodianUserIds || []), userId];
          return { ...c, custodianUserIds: custodians };
        }
        return c;
      })
    );

    // Update user
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const titles = u.specialTitles?.includes('Custodian')
            ? u.specialTitles
            : [...(u.specialTitles || []), 'Custodian' as SpecialTitle];
          const assignment: User['councilAssignments'][0] = {
            councilId: council.id,
            councilName: council.name,
            type: council.type,
            regionName: council.type === 'DOMAINE' ? council.regionName : council.name,
            domaineName: council.type === 'DOMAINE' ? (council.domaine || council.name) : undefined,
            title: 'Custodian',
            assignedAt: now.split('T')[0],
          };
          const filteredAssignments = (u.councilAssignments || []).filter((ca) => ca.councilId !== councilId);
          return {
            ...u,
            specialTitles: titles,
            councilAssignments: [...filteredAssignments, assignment],
          };
        }
        return u;
      })
    );

    // Send notification
    const notif: FamilyNotification = {
      id: `notif-custodian-${Date.now()}`,
      userId: targetUser.id,
      type: 'CUSTODIAN_APPOINTED',
      title: '🛡️ Appointed as Custodian',
      message: `You have been appointed as an official Custodian of ${council.name}! As a 31-JB, your duty is to secure and defend this territory.`,
      createdAt: now,
      read: false,
      priority: 'HIGH',
      meta: { councilId: council.id, councilName: council.name, councilTitle: 'Custodian' },
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `Appointed ${targetUser.fullName} (31-JB) as Custodian of ${council.name}.`,
    };
  };

  // REMOVE CUSTODIAN
  const removeCustodian = (councilId: string, userId: string) => {
    if (!currentUser || (!currentUser.isAdmin && RANK_LEVELS[currentUser.rank] < 6)) {
      return { success: false, message: 'Only High Table leadership can remove Custodians.' };
    }

    setCouncils((prev) =>
      prev.map((c) => {
        if (c.id === councilId) {
          return {
            ...c,
            custodianUserIds: (c.custodianUserIds || []).filter((id) => id !== userId),
          };
        }
        return c;
      })
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const titles = (u.specialTitles || []).filter((t) => t !== 'Custodian');
          const assignments = (u.councilAssignments || []).filter(
            (ca) => !(ca.councilId === councilId && ca.title === 'Custodian')
          );
          return { ...u, specialTitles: titles, councilAssignments: assignments };
        }
        return u;
      })
    );

    return { success: true, message: 'Custodian removed successfully.' };
  };

  // APPOINT COUNCIL ELDER: Max 12 for Region (Lords), Max 9 for Domaine (O.Gs)
  const appointCouncilElder = (councilId: string, elderUserId: string) => {
    const council = councils.find((c) => c.id === councilId);
    const targetUser = users.find((u) => u.id === elderUserId);

    if (!council || !targetUser) {
      return { success: false, message: 'Council or User not found.' };
    }

    const isRegion = council.type === 'REGION';
    const maxElders = isRegion ? 12 : 9;
    const requiredRank: MafiaRank = isRegion ? 'Lord' : 'O.G';

    if (targetUser.rank !== requiredRank) {
      return {
        success: false,
        message: `Strict Syndicate Law: Only ${requiredRank} rank can serve as ${isRegion ? 'Regional' : 'Domaine'} Council Elder! Target is "${targetUser.rank}".`,
      };
    }

    const currentElders = council.elderUserIds || [];
    if (currentElders.includes(elderUserId)) {
      return { success: false, message: `${targetUser.fullName} is already an Elder of this council.` };
    }

    // STRICT SYNDICATE LAW: One person cannot be Supreme Lord or Regional Council Elder in different regions, same for Domaine High Chief / Domaine Council Elder
    if (isRegion) {
      const otherRegion = councils.find(
        (c) =>
          c.type === 'REGION' &&
          c.id !== councilId &&
          ((c.elderUserIds || []).includes(elderUserId) || c.leaderUserId === elderUserId || (targetUser.councilAssignments || []).some(ca => ca.type === 'REGION'))
      );
      if (otherRegion) {
        return {
          success: false,
          message: `Strict Syndicate Law: One person cannot be Supreme Lord or Regional Council Elder in different regions! ${targetUser.fullName} is already assigned to Region "${otherRegion.name}". Only unassigned Lords can be appointed.`,
        };
      }
    } else {
      const otherDomaine = councils.find(
        (c) =>
          c.type === 'DOMAINE' &&
          c.id !== councilId &&
          ((c.elderUserIds || []).includes(elderUserId) || c.leaderUserId === elderUserId || (targetUser.councilAssignments || []).some(ca => ca.type === 'DOMAINE'))
      );
      if (otherDomaine) {
        return {
          success: false,
          message: `Strict Syndicate Law: One person cannot be Domaine High Chief or Domaine Council Elder in different domaines! ${targetUser.fullName} is already assigned to Domaine "${otherDomaine.name}". Only unassigned O.Gs can be appointed.`,
        };
      }
    }

    if (currentElders.length >= maxElders) {
      return {
        success: false,
        message: `Council has reached maximum capacity of ${maxElders} Elders!`,
      };
    }

    const assignedTitle: CouncilTitle = isRegion ? 'Regional Council Elder' : 'Domaine Council Elder';
    const assignedSpecial: SpecialTitle = isRegion ? 'Regional Council Elder' : 'Domaine Council Elder';
    const now = new Date().toISOString();

    setCouncils((prev) =>
      prev.map((c) => {
        if (c.id === councilId) {
          const elders = [...(c.elderUserIds || []), elderUserId];
          return { ...c, elderUserIds: elders, memberCount: elders.length };
        }
        return c;
      })
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === elderUserId) {
          // Cleanse conflicting retired or opposite titles
          const baseTitles = (u.specialTitles || []).filter(
            (t) =>
              t !== 'Caesar' &&
              t !== 'Ash-Lord' &&
              t !== 'Supreme Lord' &&
              t !== 'High Chief' &&
              t !== 'Regional Council Elder' &&
              t !== 'Domaine Council Elder'
          );
          const titles = [...baseTitles, assignedSpecial];
          const assignment: User['councilAssignments'][0] = {
            councilId: council.id,
            councilName: council.name,
            type: council.type,
            regionName: isRegion ? council.name : council.regionName,
            domaineName: !isRegion ? (council.domaine || council.name) : undefined,
            title: assignedTitle,
            assignedAt: now.split('T')[0],
          };
          const filtered = (u.councilAssignments || []).filter((ca) => ca.councilId !== councilId);
          return { ...u, specialTitles: titles, councilAssignments: [...filtered, assignment] };
        }
        return u;
      })
    );

    const notif: FamilyNotification = {
      id: `notif-elder-assign-${Date.now()}`,
      userId: targetUser.id,
      type: 'COUNCIL_ASSIGNED',
      title: `🏛️ Appointed as ${assignedTitle}`,
      message: `You have been officially seated as a ${assignedTitle} on the ${council.name} Council!`,
      createdAt: now,
      read: false,
      priority: 'HIGH',
      meta: { councilId: council.id, councilName: council.name, councilTitle: assignedTitle },
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `Seated ${targetUser.fullName} as ${assignedTitle} of ${council.name}.`,
    };
  };

  // REMOVE COUNCIL ELDER
  const removeCouncilElder = (councilId: string, elderUserId: string) => {
    const council = councils.find((c) => c.id === councilId);
    if (!council) return { success: false, message: 'Council not found.' };

    setCouncils((prev) =>
      prev.map((c) => {
        if (c.id === councilId) {
          const elders = (c.elderUserIds || []).filter((id) => id !== elderUserId);
          return { ...c, elderUserIds: elders, memberCount: elders.length };
        }
        return c;
      })
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === elderUserId) {
          const titleToRemove: SpecialTitle = council.type === 'REGION' ? 'Regional Council Elder' : 'Domaine Council Elder';
          const titles = (u.specialTitles || []).filter((t) => t !== titleToRemove && t !== 'Supreme Lord' && t !== 'High Chief');
          const assignments = (u.councilAssignments || []).filter((ca) => ca.councilId !== councilId);
          return { ...u, specialTitles: titles, councilAssignments: assignments };
        }
        return u;
      })
    );

    return { success: true, message: 'Council Elder removed.' };
  };

  // VOTE FOR NEXT LEADER (Elders of council only)
  const voteForNextLeader = (councilId: string, candidateUserId: string) => {
    if (!currentUser) return { success: false, message: 'Must be logged in to vote.' };

    const council = councils.find((c) => c.id === councilId);
    if (!council) return { success: false, message: 'Council not found.' };

    const isElder = (council.elderUserIds || []).includes(currentUser.id) || council.leaderUserId === currentUser.id;
    if (!isElder && !currentUser.isAdmin && currentUser.rank !== 'Honcho (King)' && currentUser.rank !== 'Ghost') {
      return {
        success: false,
        message: 'Only seated Council Elders and High Command can cast votes for leadership succession!',
      };
    }

    if (!(council.elderUserIds || []).includes(candidateUserId) && council.leaderUserId !== candidateUserId) {
      return { success: false, message: 'Candidate must be a seated Council Elder of this council.' };
    }

    const updatedVotes = { ...(council.nextLeaderVotes || {}), [currentUser.id]: candidateUserId };

    setCouncils((prev) =>
      prev.map((c) => (c.id === councilId ? { ...c, nextLeaderVotes: updatedVotes } : c))
    );

    return {
      success: true,
      message: `Vote successfully cast for ${users.find((u) => u.id === candidateUserId)?.fullName || 'Candidate'}.`,
    };
  };

  // CONCLUDE 1-YEAR TENURE & ELECT NEXT LEADER
  // Succession Rules:
  // - Winner with highest votes among elders becomes new leader.
  // - If Region:
  //   - Former Supreme Lord -> Permanent lifetime title "Caesar"
  //   - Former Regional Council Elders -> Permanent lifetime title "Ash-Lord"
  // - If Domaine:
  //   - Former High Chief and ALL former Domaine Council Elders are UPGRADED to the rank of "Lord"!
  const concludeTenureAndElectNextLeader = (councilId: string) => {
    if (!currentUser || (!currentUser.isAdmin && RANK_LEVELS[currentUser.rank] < 6)) {
      return {
        success: false,
        message: 'Only High Table or Council Elders can officiate the succession election.',
      };
    }

    const council = councils.find((c) => c.id === councilId);
    if (!council) return { success: false, message: 'Council not found.' };

    const elders = council.elderUserIds || [];
    if (elders.length === 0) {
      return { success: false, message: 'No Council Elders seated to conduct succession election.' };
    }

    // Tally votes
    const votes = council.nextLeaderVotes || {};
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach((candidateId) => {
      const id = String(candidateId);
      voteCounts[id] = (voteCounts[id] || 0) + 1;
    });

    // Find winner
    let winnerId = elders[0];
    let maxVotes = -1;
    elders.forEach((elderId) => {
      const count = voteCounts[elderId] || 0;
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = elderId;
      }
    });

    const winnerUser = users.find((u) => u.id === winnerId);
    if (!winnerUser) {
      return { success: false, message: 'Winning candidate could not be resolved.' };
    }

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const oldLeaderId = council.leaderUserId;
    const oldLeaderUser = users.find((u) => u.id === oldLeaderId);
    const isRegion = council.type === 'REGION';

    const pastRecord = {
      userId: oldLeaderId || winnerId,
      name: oldLeaderUser?.fullName || council.leaderName || winnerUser.fullName,
      title: council.leaderTitle || (isRegion ? 'Supreme Lord' : 'High Chief'),
      tenureStart: council.tenureStartDate || now.toISOString(),
      tenureEnd: now.toISOString(),
      honoraryAwarded: isRegion ? ('Caesar' as SpecialTitle) : ('Lord Ascension' as any),
    };

    const newLeaderTitle: CouncilTitle = isRegion ? 'Supreme Lord' : 'High Chief';
    const newLeaderSpecial: SpecialTitle = isRegion ? 'Supreme Lord' : 'High Chief';

    // Update council state
    setCouncils((prev) =>
      prev.map((c) => {
        if (c.id === councilId) {
          return {
            ...c,
            leaderUserId: winnerId,
            leaderName: winnerUser.fullName,
            leaderTitle: newLeaderTitle,
            elderUserIds: [winnerId], // Vacate older seats for new term
            memberCount: 1,
            tenureStartDate: now.toISOString(),
            tenureEndDate: oneYearLater.toISOString(),
            nextLeaderVotes: {},
            pastLeaders: [...(c.pastLeaders || []), pastRecord],
          };
        }
        return c;
      })
    );

    // Apply honorary titles and rank upgrades to previous elders/leader
    const successionNotifs: FamilyNotification[] = [];

    setUsers((prev) =>
      prev.map((u) => {
        // If Region:
        if (isRegion) {
          if (u.id === oldLeaderId && oldLeaderId !== winnerId) {
            // Former Supreme Lord gets permanent title "Caesar"
            const baseTitles = (u.specialTitles || []).filter(
              (t) =>
                t !== 'Supreme Lord' &&
                t !== 'Regional Council Elder' &&
                t !== 'High Chief' &&
                t !== 'Domaine Council Elder' &&
                t !== 'Ash-Lord' &&
                t !== 'Caesar'
            );
            const titles = [...baseTitles, 'Caesar' as SpecialTitle];
            const assignments = (u.councilAssignments || []).filter((ca) => ca.councilId !== councilId);
            return { ...u, specialTitles: titles, councilAssignments: assignments };
          }
          if (elders.includes(u.id) && u.id !== winnerId) {
            // Former Regional Council Elder gets permanent title "Ash-Lord"
            const baseTitles = (u.specialTitles || []).filter(
              (t) =>
                t !== 'Regional Council Elder' &&
                t !== 'Supreme Lord' &&
                t !== 'High Chief' &&
                t !== 'Domaine Council Elder' &&
                t !== 'Caesar' &&
                t !== 'Ash-Lord'
            );
            const titles = [...baseTitles, 'Ash-Lord' as SpecialTitle];
            const assignments = (u.councilAssignments || []).filter((ca) => ca.councilId !== councilId);
            return { ...u, specialTitles: titles, councilAssignments: assignments };
          }
        }

        // If Domaine:
        // Former High Chief and ALL former Domaine Elders are UPGRADED to "Lord" (or receive Caesar/Ash-Lord)!
        if (!isRegion) {
          if (elders.includes(u.id) || u.id === oldLeaderId) {
            if (u.id !== winnerId) {
              const promoRecord: RankPromotionRecord = {
                id: `promo-honor-${Date.now()}-${u.id}`,
                rank: 'Lord',
                previousRank: u.rank,
                promotedAt: now.toISOString(),
                promotedByUserId: currentUser.id,
                promotedByName: currentUser.fullName,
                promotedByRank: currentUser.rank,
                note: `Concluded distinguished tenure in ${council.name}. Elevated to Lord standing as sacred Syndicate honor.`,
                ceremonyType: 'COUNCIL_SUCCESSION_HONOR',
              };
              const retiredTitle: SpecialTitle = u.id === oldLeaderId ? 'Caesar' : 'Ash-Lord';
              const baseTitles = (u.specialTitles || []).filter(
                (t) =>
                  t !== 'High Chief' &&
                  t !== 'Domaine Council Elder' &&
                  t !== 'Supreme Lord' &&
                  t !== 'Regional Council Elder' &&
                  t !== 'Caesar' &&
                  t !== 'Ash-Lord'
              );
              const titles = [...baseTitles, retiredTitle];
              const assignments = (u.councilAssignments || []).filter((ca) => ca.councilId !== councilId);
              return {
                ...u,
                rank: 'Lord',
                specialTitles: titles,
                councilAssignments: assignments,
                promotionHistory: [...(u.promotionHistory || []), promoRecord],
                statusMessage: `Elevated to Lord (${retiredTitle}) upon concluding distinguished Domaine tenure.`,
              };
            }
          }
        }

        // Winner gets the new leader title
        if (u.id === winnerId) {
          const baseTitles = (u.specialTitles || []).filter(
            (t) =>
              t !== 'Caesar' &&
              t !== 'Ash-Lord' &&
              t !== 'Regional Council Elder' &&
              t !== 'Domaine Council Elder' &&
              t !== newLeaderSpecial
          );
          const titles = [...baseTitles, newLeaderSpecial];
          const assignment: User['councilAssignments'][0] = {
            councilId: council.id,
            councilName: council.name,
            type: council.type,
            regionName: isRegion ? council.name : council.regionName,
            domaineName: !isRegion ? (council.domaine || council.name) : undefined,
            title: newLeaderTitle,
            assignedAt: now.toISOString().split('T')[0],
          };
          const filtered = (u.councilAssignments || []).filter((ca) => ca.councilId !== councilId);
          return { ...u, specialTitles: titles, councilAssignments: [...filtered, assignment] };
        }

        return u;
      })
    );

    // Create notifications
    const successionAlertNotif: FamilyNotification = {
      id: `notif-succession-${Date.now()}`,
      userId: 'all',
      type: 'SUCCESSION_COMPLETED',
      title: `👑 Territorial Succession: ${council.name}`,
      message: isRegion
        ? `${winnerUser.fullName} has been elected Supreme Lord of ${council.name}! Former Supreme Lord bestowed lifetime honor "Caesar", and former Elders bestowed "Ash-Lord".`
        : `${winnerUser.fullName} elected High Chief of ${council.name}! All former Domaine Elders have been elevated to the rank of "Lord"!`,
      createdAt: now.toISOString(),
      read: false,
      priority: 'HIGH',
      meta: { councilId: council.id, councilName: council.name, councilTitle: newLeaderTitle },
    };

    setNotifications((prev) => [successionAlertNotif, ...successionNotifs, ...prev]);

    // Chat broadcast
    const chatMsg: ChatMessage = {
      id: `msg-succession-${Date.now()}`,
      roomId: 'room-prestige',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRank: currentUser.rank,
      senderAvatar: currentUser.avatarUrl,
      text: `👑 TERRITORIAL SUCCESSION CONCLUDED: ${winnerUser.fullName} has been elected ${newLeaderTitle} of ${council.name} with ${maxVotes} votes! ${
        isRegion
          ? 'Former Supreme Lord receives lifetime title "Caesar" and Elders receive "Ash-Lord".'
          : 'All concluding Domaine Elders are elevated to the rank of "Lord"!'
      }`,
      createdAt: now.toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      'room-prestige': [...(prev['room-prestige'] || []), chatMsg],
      'room-sbb-general': [
        ...(prev['room-sbb-general'] || []),
        { ...chatMsg, id: `msg-succ-gen-${Date.now()}`, roomId: 'room-sbb-general' },
      ],
    }));

    return {
      success: true,
      message: `Succession concluded! ${winnerUser.fullName} is sworn in as the new ${newLeaderTitle} of ${council.name}.`,
    };
  };

  // ==========================================
  // AM / A13 MENTORSHIP & ASSIGNMENT SYSTEM
  // ==========================================

  // SEND AM/A13 REQUEST: Boss rank and up can request lower ranks
  const sendAmA13Request = (targetUserId: string) => {
    if (!currentUser) return { success: false, message: 'Must be logged in.' };

    const callerLevel = RANK_LEVELS[currentUser.rank];
    if (callerLevel < 4) {
      return {
        success: false,
        message: 'Only Boss rank and above (Boss, Cartel Man, O.G, Lord, etc.) can initiate AM/A13 mentorship requests.',
      };
    }

    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) return { success: false, message: 'Target member not found.' };

    if (targetUser.id === currentUser.id) {
      return { success: false, message: 'You cannot send an AM/A13 request to yourself.' };
    }

    const targetLevel = RANK_LEVELS[targetUser.rank];
    if (targetLevel >= callerLevel) {
      return {
        success: false,
        message: `AM/A13 requests can only be sent to ranks lower than your own (${currentUser.rank}). Target holds "${targetUser.rank}".`,
      };
    }

    // Check if pending request exists
    const existing = amRequests.find(
      (r) => r.requesterUserId === currentUser.id && r.targetUserId === targetUserId && r.status === 'PENDING'
    );
    if (existing) {
      return { success: false, message: 'A pending AM/A13 request already exists for this member.' };
    }

    const now = new Date().toISOString();
    const requestId = `am-req-${Date.now()}`;

    const newRequest: AmA13Request = {
      id: requestId,
      requesterUserId: currentUser.id,
      requesterName: currentUser.fullName,
      requesterRank: currentUser.rank,
      requesterAvatar: currentUser.avatarUrl,
      targetUserId: targetUser.id,
      targetName: targetUser.fullName,
      targetRank: targetUser.rank,
      targetAvatar: targetUser.avatarUrl,
      status: 'PENDING',
      createdAt: now,
    };

    setAmRequests((prev) => [newRequest, ...prev]);

    // Send notification to target user
    const reqNotif: FamilyNotification = {
      id: `notif-am-req-${Date.now()}`,
      userId: targetUser.id,
      type: 'AM_A13_REQUEST_RECEIVED',
      title: '🛡️ AM / A13 Request Received',
      message: `${currentUser.fullName} (${currentUser.rank}) has sent you an official request to serve as your AM/A13 mentor & personal guard.`,
      createdAt: now,
      read: false,
      priority: 'HIGH',
      meta: {
        amRequestId: requestId,
        requesterId: currentUser.id,
        requesterName: currentUser.fullName,
        requesterRank: currentUser.rank,
      },
    };

    setNotifications((prev) => [reqNotif, ...prev]);

    return {
      success: true,
      message: `Official AM/A13 request sent to ${targetUser.fullName}.`,
    };
  };

  // RESPOND TO AM/A13 REQUEST
  const respondToAmA13Request = (requestId: string, accept: boolean) => {
    const request = amRequests.find((r) => r.id === requestId);
    if (!request) return { success: false, message: 'Request not found.' };

    const now = new Date().toISOString();

    setAmRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: accept ? 'ACCEPTED' : 'DECLINED',
              respondedAt: now,
            }
          : r
      )
    );

    if (accept) {
      // Add to requester's amAssignments
      const assignment: AmA13Assignment = {
        targetUserId: request.targetUserId,
        targetName: request.targetName,
        targetRank: request.targetRank,
        assignedAt: now,
      };

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === request.requesterUserId) {
            const assignments = [...(u.amAssignments || []).filter((a) => a.targetUserId !== request.targetUserId), assignment];
            return { ...u, amAssignments: assignments };
          }
          if (u.id === request.targetUserId) {
            return {
              ...u,
              myAmA13: {
                amUserId: request.requesterUserId,
                amName: request.requesterName,
                amRank: request.requesterRank,
                assignedAt: now,
              },
            };
          }
          return u;
        })
      );

      // Notification for requester
      const acceptNotif: FamilyNotification = {
        id: `notif-am-acc-${Date.now()}`,
        userId: request.requesterUserId,
        type: 'AM_A13_REQUEST_ACCEPTED',
        title: '🛡️ AM / A13 Request Accepted',
        message: `${request.targetName} has ACCEPTED your AM/A13 request. You are now officially linked.`,
        createdAt: now,
        read: false,
        priority: 'HIGH',
        meta: { recruitId: request.targetUserId, recruitName: request.targetName },
      };

      setNotifications((prev) => [acceptNotif, ...prev]);

      return { success: true, message: `You have accepted ${request.requesterName}'s AM/A13 mentorship.` };
    } else {
      const declineNotif: FamilyNotification = {
        id: `notif-am-dec-${Date.now()}`,
        userId: request.requesterUserId,
        type: 'AM_A13_REQUEST_DECLINED',
        title: '🛡️ AM / A13 Request Declined',
        message: `${request.targetName} has declined the AM/A13 request.`,
        createdAt: now,
        read: false,
        priority: 'NORMAL',
      };

      setNotifications((prev) => [declineNotif, ...prev]);

      return { success: true, message: `You have declined ${request.requesterName}'s request.` };
    }
  };

  // CANCEL AM/A13 ASSIGNMENT
  const cancelAmA13Assignment = (targetUserId: string) => {
    if (!currentUser) return { success: false, message: 'Must be logged in.' };

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const assignments = (u.amAssignments || []).filter((a) => a.targetUserId !== targetUserId);
          return { ...u, amAssignments: assignments };
        }
        if (u.id === targetUserId) {
          return { ...u, myAmA13: undefined };
        }
        return u;
      })
    );

    return { success: true, message: 'AM/A13 mentorship assignment concluded.' };
  };

  const createCouncil = (councilData: Omit<DomaineCouncil, 'id' | 'memberCount'>) => {
    const newCouncil: DomaineCouncil = {
      ...councilData,
      id: `${councilData.type === 'REGION' ? 'region' : 'domaine'}-${Date.now()}`,
      governingRank: councilData.type === 'REGION' ? 'Lord' : 'O.G',
      memberCount: 1,
    };
    setCouncils((prev) => [...prev, newCouncil]);
  };

  const assignCouncilLeader = (councilId: string, userId: string, title: CouncilTitle) => {
    if (!currentUser?.isAdmin && RANK_LEVELS[currentUser?.rank || 'No Man'] < 6) {
      return { success: false, message: 'Only Admins and High Table officers (O.G+) can assign territorial leadership.' };
    }

    const council = councils.find((c) => c.id === councilId);
    const targetUser = users.find((u) => u.id === userId);
    if (!council || !targetUser) {
      return { success: false, message: 'Territory/Council or User not found.' };
    }

    // STRICT SYNDICATE LAW 1: Regions are ruled ONLY by Lords
    if (council.type === 'REGION' || council.governingRank === 'Lord') {
      if (targetUser.rank !== 'Lord') {
        return {
          success: false,
          message: `Strict Syndicate Law: Regions are ruled ONLY by Lords! ${targetUser.fullName} holds rank "${targetUser.rank}".`,
        };
      }
      const otherRegion = councils.find(
        (c) =>
          c.type === 'REGION' &&
          c.id !== councilId &&
          ((c.elderUserIds || []).includes(targetUser.id) || c.leaderUserId === targetUser.id)
      );
      if (otherRegion) {
        return {
          success: false,
          message: `Strict Syndicate Law: One person cannot be Supreme Lord or Regional Council Elder in different regions! ${targetUser.fullName} is already assigned to "${otherRegion.name}".`,
        };
      }
    }

    // STRICT SYNDICATE LAW 2: Domaines are ruled ONLY by O.Gs
    if (council.type === 'DOMAINE' || council.governingRank === 'O.G') {
      if (targetUser.rank !== 'O.G') {
        return {
          success: false,
          message: `Strict Syndicate Law: Domaines are ruled ONLY by O.Gs (Original Gentlemen)! ${targetUser.fullName} holds rank "${targetUser.rank}".`,
        };
      }
      const otherDomaine = councils.find(
        (c) =>
          c.type === 'DOMAINE' &&
          c.id !== councilId &&
          ((c.elderUserIds || []).includes(targetUser.id) || c.leaderUserId === targetUser.id)
      );
      if (otherDomaine) {
        return {
          success: false,
          message: `Strict Syndicate Law: One person cannot be Domaine High Chief or Domaine Council Elder in different domaines! ${targetUser.fullName} is already assigned to "${otherDomaine.name}".`,
        };
      }
    }

    // Update council leadership
    setCouncils((prev) =>
      prev.map((c) =>
        c.id === councilId
          ? {
              ...c,
              leaderUserId: targetUser.id,
              leaderName: targetUser.fullName,
              leaderTitle: title,
            }
          : c
      )
    );

    // Update user's council assignment and special titles
    const specialTitle: SpecialTitle = title as SpecialTitle;
    const assignment: User['councilAssignments'][0] = {
      councilId: council.id,
      councilName: council.name,
      type: council.type,
      regionName: council.type === 'DOMAINE' ? council.regionName : council.name,
      domaineName: council.type === 'DOMAINE' ? (council.domaine || council.name) : undefined,
      title: title,
      assignedAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const filteredAssignments = (u.councilAssignments || []).filter((ca) => ca.councilId !== councilId);
          const baseTitles = (u.specialTitles || []).filter(
            (t) =>
              t !== 'Caesar' &&
              t !== 'Ash-Lord' &&
              t !== 'Supreme Lord' &&
              t !== 'High Chief' &&
              t !== 'Regional Council Elder' &&
              t !== 'Domaine Council Elder'
          );
          const titles = [...baseTitles, specialTitle];
          return { ...u, specialTitles: titles, councilAssignments: [...filteredAssignments, assignment] };
        }
        return u;
      })
    );

    return {
      success: true,
      message: `Assigned ${targetUser.fullName} (${targetUser.rank}) as "${title}" of ${council.name}.`,
    };
  };

  const createEvent = (
    eventData: Omit<FamilyEvent, 'id' | 'createdBy' | 'creatorRank' | 'rsvps' | 'createdAt'>
  ) => {
    if (!currentUser) return;
    const newEvt: FamilyEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      createdBy: currentUser.fullName,
      creatorRank: currentUser.rank,
      rsvps: [currentUser.id],
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvt, ...prev]);
  };

  const toggleRsvp = (eventId: string) => {
    if (!currentUser) return;
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const hasRsvped = evt.rsvps.includes(currentUser.id);
          return {
            ...evt,
            rsvps: hasRsvped
              ? evt.rsvps.filter((id) => id !== currentUser.id)
              : [...evt.rsvps, currentUser.id],
          };
        }
        return evt;
      })
    );
  };

  const createAnnouncement = (
    annData: Omit<FamilyAnnouncement, 'id' | 'author' | 'authorRank' | 'date'>
  ) => {
    if (!currentUser) return;
    const isHonchoOrGhost =
      currentUser.rank === 'Honcho (King)' ||
      currentUser.rank === 'Ghost (007)' ||
      currentUser.rank === 'Ghost' ||
      currentUser.isAdmin;
    if (!isHonchoOrGhost) return;

    const newAnn: FamilyAnnouncement = {
      ...annData,
      id: `ann-${Date.now()}`,
      author: currentUser.fullName,
      authorRank: currentUser.rank,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  // ==========================================
  // HIGH TABLE SUCCESSION & TENURE GOVERNANCE
  // ==========================================

  // Step 1: Honcho Steps Down (Only Honcho can step himself down)
  // If stepping down before tenure ends -> seat becomes VACANT and platform is notified that Honcho resigned.
  const triggerHonchoStepDown = (customHonchoId?: string, isEarlyResignation?: boolean) => {
    // Strict Authorization: Only Honcho himself can step himself down
    const isHoncho = currentUser?.rank === 'Honcho (King)' || currentUser?.isAdmin;
    if (!isHoncho) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only the Sovereign Honcho (King) himself can step himself down.',
      };
    }

    const currentHoncho = customHonchoId
      ? users.find((u) => u.id === customHonchoId)
      : users.find((u) => u.rank === 'Honcho (King)');

    if (!currentHoncho) {
      return { success: false, message: 'No seated Honcho (King) found in the syndicate registry.' };
    }

    const currentGhost = users.find((u) => u.rank === 'Ghost (007)');
    const now = new Date().toISOString();
    const nextPontusNum = pontusRecords.length + 1;
    const pontusTitle = `PONTUS ${toRomanNumeral(nextPontusNum)}`;

    const newPontusRecord: PontusRecord = {
      id: `pontus-${Date.now()}`,
      userId: currentHoncho.id,
      name: currentHoncho.fullName,
      gtaHandle: currentHoncho.gtaHandle,
      pontusTitle,
      steppedDownAt: now,
      tenureDays: isEarlyResignation ? 180 : 365,
    };

    setPontusRecords((prev) => [newPontusRecord, ...prev]);

    if (isEarlyResignation || !currentGhost) {
      // Early resignation: Seat becomes VACANT and platform is notified that Honcho resigned
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentHoncho.id) {
            const promoRecord: RankPromotionRecord = {
              id: `promo-pontus-${Date.now()}`,
              rank: 'Pontus',
              previousRank: 'Honcho (King)',
              promotedAt: now,
              promotedByName: 'Sovereign Resignation',
              note: `Stepped down / Resigned before tenure completion. Conferred title of ${pontusTitle}.`,
              ceremonyType: 'COUNCIL_SUCCESSION_HONOR',
            };
            const updatedTitles = Array.from(
              new Set([...(u.specialTitles || []), pontusTitle, 'Pontus'])
            );
            return {
              ...u,
              rank: 'Pontus',
              specialTitles: updatedTitles,
              statusMessage: `Immortal Sovereign Emeritus — ${pontusTitle} (Resigned Honcho)`,
              promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
            };
          }
          return u;
        })
      );

      // Notification broadcast
      const notif: FamilyNotification = {
        id: `notif-honcho-resigned-${Date.now()}`,
        userId: 'all',
        type: 'SUCCESSION_COMPLETED',
        title: '🚨 Sovereign Resignation: Honcho Stepped Down',
        message: `Honcho (King) ${currentHoncho.fullName} has stepped down / resigned before tenure conclusion! The Sovereign Honcho seat is now VACANT.`,
        priority: 'CRITICAL',
        createdAt: now,
        read: false,
        meta: { pontusTitle },
      };
      setNotifications((prev) => [notif, ...prev]);

      // Chat Message Alert
      const chatMsg: ChatMessage = {
        id: `msg-honcho-resigned-${Date.now()}`,
        roomId: 'room-sbb-general',
        senderId: 'system',
        senderName: 'High Table Succession Herald',
        senderRank: 'Pontus',
        senderAvatar: currentHoncho.avatarUrl,
        text: `🚨 SOVEREIGN RESIGNATION: Honcho (King) ${currentHoncho.fullName} has stepped down/resigned! Elevated to ${pontusTitle}. The Sovereign Honcho seat is now VACANT.`,
        createdAt: now,
      };
      setMessages((prev) => ({
        ...prev,
        'room-sbb-general': [...(prev['room-sbb-general'] || []), chatMsg],
        'room-cabinet': [...(prev['room-cabinet'] || []), chatMsg],
      }));

      return {
        success: true,
        message: `Honcho ${currentHoncho.fullName} has stepped down and resigned as ${pontusTitle}. The Sovereign Honcho seat is now VACANT.`,
      };
    }

    // Normal full 365-day succession
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentHoncho.id) {
          const promoRecord: RankPromotionRecord = {
            id: `promo-pontus-${Date.now()}`,
            rank: 'Pontus',
            previousRank: 'Honcho (King)',
            promotedAt: now,
            promotedByName: 'High Table Succession Law',
            note: `Completed 365-Day Sovereign Tenure. Bestowed immortal seat of ${pontusTitle}.`,
            ceremonyType: 'COUNCIL_SUCCESSION_HONOR',
          };
          const updatedTitles = Array.from(
            new Set([...(u.specialTitles || []), pontusTitle, 'Pontus'])
          );
          return {
            ...u,
            rank: 'Pontus',
            specialTitles: updatedTitles,
            statusMessage: `Immortal Sovereign Emeritus — ${pontusTitle}`,
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        if (u.id === currentGhost.id) {
          const promoRecord: RankPromotionRecord = {
            id: `promo-honcho-${Date.now()}`,
            rank: 'Honcho (King)',
            previousRank: 'Ghost (007)',
            promotedAt: now,
            promotedByName: `${currentHoncho.fullName} (${pontusTitle})`,
            promotedByRank: 'Pontus',
            note: `Ascended from Ghost (007) to Sovereign Honcho (King) upon completion of previous tenure.`,
            ceremonyType: 'FOUNDER_ASCENSION',
          };
          return {
            ...u,
            rank: 'Honcho (King)',
            statusMessage: 'Sovereign King & Supreme Executive of SBB Syndicate',
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        return u;
      })
    );

    // Open Ghost Election ballot for the 12 active Dons
    setGhostElectionState({
      status: 'VOTING_OPEN',
      votes: {},
      startedAt: now,
    });

    // Reset Don appointment state for later phase
    setDonAppointmentState({
      status: 'INACTIVE',
      honchoAppointedLordIds: [],
      ghostAppointedLordIds: [],
    });

    // Notifications
    const notif: FamilyNotification = {
      id: `notif-succession-${Date.now()}`,
      userId: 'all',
      type: 'SUCCESSION_COMPLETED',
      title: '👑 Historic High Table Sovereign Succession Decreed',
      message: `${currentHoncho.fullName} has concluded his 365-day tenure and stepped down as ${pontusTitle}. ${currentGhost.fullName} has ascended as the new Sovereign Honcho (King)! The 12 Dons Ghost Election is now OPEN.`,
      priority: 'CRITICAL',
      createdAt: now,
      read: false,
      meta: {
        pontusTitle,
      },
    };
    setNotifications((prev) => [notif, ...prev]);

    // Chat Message Alert
    const chatMsg: ChatMessage = {
      id: `msg-succession-${Date.now()}`,
      roomId: 'room-sbb-general',
      senderId: 'system',
      senderName: 'High Table Succession Herald',
      senderRank: 'Pontus',
      senderAvatar: currentHoncho.avatarUrl,
      text: `👑 SOVEREIGN SUCCESSION: ${currentHoncho.fullName} steps down after 365 days and ascends to the immortal rank of ${pontusTitle}! ${currentGhost.fullName} is crowned the new Honcho (King)! The 12 active Dons must now cast their votes in the Admin Council for the new Ghost (007).`,
      createdAt: now,
    };
    setMessages((prev) => ({
      ...prev,
      'room-sbb-general': [...(prev['room-sbb-general'] || []), chatMsg],
      'room-cabinet': [...(prev['room-cabinet'] || []), chatMsg],
    }));

    triggerCelebration(
      currentGhost,
      '👑 ALL HAIL THE NEW HONCHO (KING)',
      `${currentGhost.fullName} ascends to Supreme Executive as ${currentHoncho.fullName} becomes ${pontusTitle}!`,
      'Honcho (King)'
    );

    return {
      success: true,
      message: `Succession executed: ${currentHoncho.fullName} is now ${pontusTitle}. ${currentGhost.fullName} is now Honcho (King). Ghost election opened for 12 Dons.`,
    };
  };

  // Step Down for Ghost: Honcho or Ghost can step down Ghost.
  // If stepped down before tenure ends -> seat becomes VACANT and platform is notified that Ghost resigned.
  const triggerGhostStepDown = (customGhostId?: string, isEarlyResignation?: boolean) => {
    // Strict Authorization: Only Honcho or Ghost can step down Ghost
    const isHonchoOrGhost =
      currentUser?.rank === 'Honcho (King)' ||
      currentUser?.rank === 'Ghost (007)' ||
      currentUser?.rank === 'Ghost' ||
      currentUser?.isAdmin;

    if (!isHonchoOrGhost) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only the Sovereign Honcho (King) or Ghost (007) can step down Ghost.',
      };
    }

    const currentGhost = customGhostId
      ? users.find((u) => u.id === customGhostId)
      : users.find((u) => u.rank === 'Ghost (007)');

    if (!currentGhost) {
      return { success: false, message: 'No active Ghost (007) found.' };
    }

    const now = new Date().toISOString();
    const nextPriestNum = highPriestRecords.length + 1;
    const priestTitle = `HIGH PRIEST ${toRomanNumeral(nextPriestNum)}`;

    const newPriestRecord: HighPriestRecord = {
      id: `priest-${Date.now()}`,
      userId: currentGhost.id,
      name: currentGhost.fullName,
      gtaHandle: currentGhost.gtaHandle,
      highPriestTitle: priestTitle,
      concludedAt: now,
      tenureDays: isEarlyResignation ? 180 : 365,
    };

    setHighPriestRecords((prev) => [newPriestRecord, ...prev]);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentGhost.id) {
          const promoRecord: RankPromotionRecord = {
            id: `promo-priest-${Date.now()}`,
            rank: 'High Priest',
            previousRank: 'Ghost (007)',
            promotedAt: now,
            promotedByName: 'High Table Succession Law',
            note: isEarlyResignation
              ? `Stepped down / Resigned from Ghost operative tenure. Consecrated as ${priestTitle}.`
              : `Concluded Ghost operative tenure. Elevated to High Table sacred council as ${priestTitle}.`,
            ceremonyType: 'COUNCIL_SUCCESSION_HONOR',
          };
          const updatedTitles = Array.from(
            new Set([...(u.specialTitles || []), priestTitle, 'High Priest'])
          );
          return {
            ...u,
            rank: 'High Priest',
            specialTitles: updatedTitles,
            statusMessage: `High Table Sacred Elder — ${priestTitle} (Former Ghost 007)`,
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        return u;
      })
    );

    // Open Ghost Election for 12 Dons because the seat is now vacant!
    setGhostElectionState({
      status: 'VOTING_OPEN',
      votes: {},
      startedAt: now,
    });

    const notif: FamilyNotification = {
      id: `notif-priest-${Date.now()}`,
      userId: 'all',
      type: 'SUCCESSION_COMPLETED',
      title: isEarlyResignation ? '🚨 Covert Resignation: Ghost Stepped Down' : '🕊️ Sacred High Priest Ascension',
      message: `${currentGhost.fullName} has stepped down / resigned as Ghost (007) and ascended to ${priestTitle}! The Ghost seat is now VACANT. 12-Don election is OPEN.`,
      priority: 'HIGH',
      createdAt: now,
      read: false,
      meta: {
        highPriestTitle: priestTitle,
      },
    };
    setNotifications((prev) => [notif, ...prev]);

    // Chat broadcast
    const chatMsg: ChatMessage = {
      id: `msg-ghost-resigned-${Date.now()}`,
      roomId: 'room-sbb-general',
      senderId: 'system',
      senderName: 'High Table Succession Herald',
      senderRank: 'High Priest',
      senderAvatar: currentGhost.avatarUrl,
      text: `🚨 COVERT RESIGNATION: Ghost (007) ${currentGhost.fullName} has stepped down/resigned! Consecrated as ${priestTitle}. The Ghost seat is now VACANT. The 12 active Dons must cast their ballots.`,
      createdAt: now,
    };
    setMessages((prev) => ({
      ...prev,
      'room-sbb-general': [...(prev['room-sbb-general'] || []), chatMsg],
      'room-cabinet': [...(prev['room-cabinet'] || []), chatMsg],
    }));

    return {
      success: true,
      message: `${currentGhost.fullName} has stepped down as Ghost (007) and is consecrated as ${priestTitle}. The Ghost seat is now VACANT and voting is open.`,
    };
  };

  // Step 2: 12 Dons Voting for New Ghost - STRICTLY ONLY DONS CAN VOTE
  const castGhostVote = (voterDonId: string, candidateDonId: string) => {
    // Strict Authorization: Only active Dons can vote
    if (!currentUser || (currentUser.rank !== 'Don' && !currentUser.isAdmin)) {
      return {
        success: false,
        message: 'Strict High Table Law: Only active High Table Dons are permitted to vote in the Sovereign Ghost Election.',
      };
    }

    const voter = users.find((u) => u.id === voterDonId);
    const candidate = users.find((u) => u.id === candidateDonId);

    if (!voter) {
      return { success: false, message: 'Voter not found in syndicate registry.' };
    }
    if (!candidate) {
      return { success: false, message: 'Candidate not found in syndicate registry.' };
    }
    if (voter.rank !== 'Don') {
      return {
        success: false,
        message: 'Only active High Table Dons hold the right to vote in the Ghost succession ballot.',
      };
    }
    if (candidate.rank !== 'Don') {
      return {
        success: false,
        message: 'Only active High Table Dons are eligible candidates to become the new Ghost (007).',
      };
    }

    setGhostElectionState((prev) => ({
      ...prev,
      status: 'VOTING_OPEN',
      votes: {
        ...(prev.votes || {}),
        [voterDonId]: candidateDonId,
      },
    }));

    return {
      success: true,
      message: `Don ${voter.fullName} successfully cast their ballot for Don ${candidate.fullName}.`,
    };
  };

  // Step 3: Finalize Ghost Election: Don with highest vote becomes Ghost (007), other Dons become BARON
  const finalizeGhostElection = () => {
    const activeDons = users.filter((u) => u.rank === 'Don');
    if (activeDons.length === 0) {
      return { success: false, message: 'No active Dons available for Ghost election.' };
    }

    const voteCounts: Record<string, number> = {};
    activeDons.forEach((d) => {
      voteCounts[d.id] = 0;
    });

    Object.values(ghostElectionState.votes || {}).forEach((candidateId) => {
      const cId = String(candidateId);
      if (voteCounts[cId] !== undefined) {
        voteCounts[cId] += 1;
      }
    });

    // Find candidate with max votes (tie breaker: joined earliest)
    let winnerDon = activeDons[0];
    let maxVotes = -1;

    activeDons.forEach((d) => {
      const votes = voteCounts[d.id] || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        winnerDon = d;
      }
    });

    const now = new Date().toISOString();
    const otherDons = activeDons.filter((d) => d.id !== winnerDon.id);
    const otherDonIds = otherDons.map((d) => d.id);

    // Update Users:
    // 1. Winner Don -> Ghost (007)
    // 2. All other Dons -> BARON
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === winnerDon.id) {
          const promoRecord: RankPromotionRecord = {
            id: `promo-ghost-${Date.now()}`,
            rank: 'Ghost (007)',
            previousRank: 'Don',
            promotedAt: now,
            promotedByName: 'High Table 12-Don Election Ballot',
            note: `Elected by the 12 Dons with ${maxVotes} votes to assume Covert Directorate Command as Ghost (007).`,
            ceremonyType: 'HIGH_TABLE_DECREE',
          };
          return {
            ...u,
            rank: 'Ghost (007)',
            statusMessage: 'Covert Directorate Head — Ghost (007)',
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        if (otherDonIds.includes(u.id)) {
          const promoRecord: RankPromotionRecord = {
            id: `promo-baron-${u.id}-${Date.now()}`,
            rank: 'BARON',
            previousRank: 'Don',
            promotedAt: now,
            promotedByName: 'High Table Succession Decrees',
            note: `Honorable conclusion of High Table Don seat. Conferred noble title and rank of BARON.`,
            ceremonyType: 'COUNCIL_SUCCESSION_HONOR',
          };
          const updatedTitles = Array.from(new Set([...(u.specialTitles || []), 'Baron']));
          return {
            ...u,
            rank: 'BARON',
            specialTitles: updatedTitles,
            statusMessage: 'Noble Baron of the SBB High Table',
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        return u;
      })
    );

    // Update election state to completed
    setGhostElectionState({
      status: 'COMPLETED',
      votes: ghostElectionState.votes,
      completedAt: now,
      electedGhostId: winnerDon.id,
      electedGhostName: winnerDon.fullName,
      baronIds: otherDonIds,
    });

    // Open Don Appointment phase for newly seated Honcho and Ghost to appoint 12 new Dons from Lords!
    setDonAppointmentState({
      status: 'APPOINTMENT_OPEN',
      honchoAppointedLordIds: [],
      ghostAppointedLordIds: [],
    });

    // Notification
    const notif: FamilyNotification = {
      id: `notif-ghost-elected-${Date.now()}`,
      userId: 'all',
      type: 'GHOST_ELECTED',
      title: '🕵️‍♂️ New Ghost (007) Elected by the 12 Dons',
      message: `${winnerDon.fullName} has won the 12-Don ballot with ${maxVotes} votes and is elevated to Ghost (007)! The remaining ${otherDons.length} Dons have ascended to the honorable rank of BARON. Honcho and Ghost must now appoint 12 new Dons from the Lords.`,
      priority: 'CRITICAL',
      createdAt: now,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    // Chat Message
    const chatMsg: ChatMessage = {
      id: `msg-ghost-elected-${Date.now()}`,
      roomId: 'room-sbb-general',
      senderId: 'system',
      senderName: 'High Table Election Overseer',
      senderRank: 'Honcho (King)',
      senderAvatar: winnerDon.avatarUrl,
      text: `🏆 HIGH TABLE ELECTION RESULT: Don ${winnerDon.fullName} is crowned as the new GHOST (007)! The remaining 11 Dons are conferred the noble rank of BARON. Honcho & Ghost are now convening to appoint 12 new Dons from the Lords!`,
      createdAt: now,
    };
    setMessages((prev) => ({
      ...prev,
      'room-sbb-general': [...(prev['room-sbb-general'] || []), chatMsg],
      'room-cabinet': [...(prev['room-cabinet'] || []), chatMsg],
    }));

    triggerCelebration(
      winnerDon,
      '🕵️‍♂️ NEW GHOST (007) ELECTED',
      `${winnerDon.fullName} wins the 12-Don ballot! Remaining Dons ascend to BARON!`,
      'Ghost (007)'
    );

    return {
      success: true,
      message: `${winnerDon.fullName} is now Ghost (007). ${otherDons.length} former Dons have become BARONS. Don appointment phase is now OPEN!`,
    };
  };

  // Step 4: Honcho and Ghost Appoint 12 New Dons from Lords (STRICT: ONLY HONCHO & GHOST; STRICT MAX 12 DONS)
  const appointLordAsDon = (lordUserId: string, appointedByRole: 'HONCHO' | 'GHOST') => {
    // Strict Authorization: Only Honcho or Ghost can appoint Dons
    const isHonchoOrGhost =
      currentUser?.rank === 'Honcho (King)' ||
      currentUser?.rank === 'Ghost (007)' ||
      currentUser?.rank === 'Ghost' ||
      currentUser?.isAdmin;

    if (!isHonchoOrGhost) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only the Honcho (King) and Ghost (007) can appoint Dons.',
      };
    }

    const currentDonsCount = users.filter((u) => u.rank === 'Don').length;
    if (currentDonsCount >= 12) {
      return {
        success: false,
        message: 'Strict High Table Law: There can only be 12 Dons seated at any time! Maximum capacity reached.',
      };
    }

    const lord = users.find((u) => u.id === lordUserId);
    if (!lord) {
      return { success: false, message: 'Lord not found in syndicate registry.' };
    }
    if (lord.rank !== 'Lord') {
      return { success: false, message: `${lord.fullName} is not currently a Lord.` };
    }

    const currentHoncho = users.find((u) => u.rank === 'Honcho (King)');
    const currentGhost = users.find((u) => u.rank === 'Ghost (007)');

    const appointer = appointedByRole === 'HONCHO' ? currentHoncho : currentGhost;
    const appointerName = appointer ? appointer.fullName : appointedByRole;
    const appointerRank = appointer ? appointer.rank : appointedByRole;

    const currentHonchoList = donAppointmentState.honchoAppointedLordIds || [];
    const currentGhostList = donAppointmentState.ghostAppointedLordIds || [];

    if (appointedByRole === 'HONCHO' && currentHonchoList.length >= 6) {
      return { success: false, message: 'Honcho has already appointed the maximum quota of 6 Dons.' };
    }
    if (appointedByRole === 'GHOST' && currentGhostList.length >= 6) {
      return { success: false, message: 'Ghost has already appointed the maximum quota of 6 Dons.' };
    }

    const nextHonchoList =
      appointedByRole === 'HONCHO' ? [...currentHonchoList, lordUserId] : currentHonchoList;
    const nextGhostList =
      appointedByRole === 'GHOST' ? [...currentGhostList, lordUserId] : currentGhostList;

    const totalAppointed = nextHonchoList.length + nextGhostList.length;
    const isCompleted = totalAppointed >= 12;

    const now = new Date().toISOString();

    // Strip council positions from the newly appointed Don
    setCouncils((prev) =>
      prev.map((c) => {
        const isElder = (c.elderUserIds || []).includes(lordUserId);
        const isLeader = c.leaderUserId === lordUserId;
        if (!isElder && !isLeader) return c;
        const filtered = (c.elderUserIds || []).filter((id) => id !== lordUserId);
        return {
          ...c,
          elderUserIds: filtered,
          leaderUserId: isLeader ? undefined : c.leaderUserId,
          leaderName: isLeader ? undefined : c.leaderName,
          leaderTitle: isLeader ? undefined : c.leaderTitle,
          memberCount: filtered.length,
        };
      })
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === lordUserId) {
          const promoRecord: RankPromotionRecord = {
            id: `promo-don-${Date.now()}`,
            rank: 'Don',
            previousRank: 'Lord',
            promotedAt: now,
            promotedByName: `${appointerName} (${appointerRank})`,
            promotedByRank: appointerRank,
            note: `Elevated from Lord to High Table Don by ${appointedByRole === 'HONCHO' ? 'Sovereign Honcho' : 'Ghost 007'} decree.`,
            ceremonyType: 'HIGH_TABLE_DECREE',
          };
          const updatedTitles = (u.specialTitles || []).filter(
            (t) =>
              t !== 'Supreme Lord' &&
              t !== 'High Chief' &&
              t !== 'Regional Council Elder' &&
              t !== 'Domaine Council Elder'
          );
          const updatedAssignments = (u.councilAssignments || []).filter(
            (ca) =>
              ca.title !== 'Supreme Lord' &&
              ca.title !== 'High Chief' &&
              ca.title !== 'Regional Council Elder' &&
              ca.title !== 'Domaine Council Elder'
          );
          return {
            ...u,
            rank: 'Don',
            specialTitles: updatedTitles,
            councilAssignments: updatedAssignments,
            statusMessage: 'Active High Table Don (High Table Council)',
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        return u;
      })
    );

    setDonAppointmentState({
      status: isCompleted ? 'COMPLETED' : 'APPOINTMENT_OPEN',
      honchoAppointedLordIds: nextHonchoList,
      ghostAppointedLordIds: nextGhostList,
      completedAt: isCompleted ? now : undefined,
    });

    const notif: FamilyNotification = {
      id: `notif-don-app-${Date.now()}`,
      userId: 'all',
      type: 'DON_APPOINTED',
      title: '🏛️ New High Table Don Appointed',
      message: `${lord.fullName} has been elevated to High Table Don by ${appointerName} (${appointedByRole}). Total Dons appointed: ${totalAppointed}/12.`,
      priority: 'HIGH',
      createdAt: now,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `${lord.fullName} appointed to High Table Don by ${appointedByRole} (${totalAppointed}/12 complete).`,
    };
  };

  // Batch Appoint Lords for a Specific Role (Honcho max 6, Ghost max 6)
  const batchAppointLordsForRole = (lordUserIds: string[], role: 'HONCHO' | 'GHOST') => {
    // Strict Authorization: Only Honcho or Ghost
    const isHonchoOrGhost =
      currentUser?.rank === 'Honcho (King)' ||
      currentUser?.rank === 'Ghost (007)' ||
      currentUser?.rank === 'Ghost' ||
      currentUser?.isAdmin;

    if (!isHonchoOrGhost) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only the Honcho (King) and Ghost (007) can appoint Dons.',
      };
    }

    if (lordUserIds.length === 0) {
      return { success: false, message: `Please select at least 1 Lord to appoint for ${role === 'HONCHO' ? 'Honcho' : 'Ghost'}.` };
    }

    if (lordUserIds.length > 6) {
      return { success: false, message: `Maximum quota is 6 Lords per appointment action (Selected: ${lordUserIds.length}).` };
    }

    const currentHonchoList = donAppointmentState.honchoAppointedLordIds || [];
    const currentGhostList = donAppointmentState.ghostAppointedLordIds || [];

    if (role === 'HONCHO' && currentHonchoList.length + lordUserIds.length > 6) {
      return {
        success: false,
        message: `Honcho Quota Exceeded: Honcho already appointed ${currentHonchoList.length}/6 Dons. Can only appoint ${6 - currentHonchoList.length} more.`,
      };
    }

    if (role === 'GHOST' && currentGhostList.length + lordUserIds.length > 6) {
      return {
        success: false,
        message: `Ghost Quota Exceeded: Ghost already appointed ${currentGhostList.length}/6 Dons. Can only appoint ${6 - currentGhostList.length} more.`,
      };
    }

    const currentDonsCount = users.filter((u) => u.rank === 'Don').length;
    if (currentDonsCount + lordUserIds.length > 12) {
      return {
        success: false,
        message: `Strict High Table Law: There can only be 12 Dons seated at any time! Currently seated: ${currentDonsCount}. Attempted to add ${lordUserIds.length}, which exceeds 12.`,
      };
    }

    const currentHoncho = users.find((u) => u.rank === 'Honcho (King)');
    const currentGhost = users.find((u) => u.rank === 'Ghost (007)');
    const appointer = role === 'HONCHO' ? currentHoncho : currentGhost;
    const appointerName = appointer ? appointer.fullName : role;
    const appointerRank = appointer ? appointer.rank : role;

    const nextHonchoList =
      role === 'HONCHO' ? Array.from(new Set([...currentHonchoList, ...lordUserIds])) : currentHonchoList;
    const nextGhostList =
      role === 'GHOST' ? Array.from(new Set([...currentGhostList, ...lordUserIds])) : currentGhostList;

    const totalAppointed = nextHonchoList.length + nextGhostList.length;
    const isCompleted = totalAppointed >= 12;
    const now = new Date().toISOString();

    // Strip council positions from all newly appointed Dons
    setCouncils((prev) =>
      prev.map((c) => {
        const hasElders = (c.elderUserIds || []).some((id) => lordUserIds.includes(id));
        const hasLeader = c.leaderUserId && lordUserIds.includes(c.leaderUserId);
        if (!hasElders && !hasLeader) return c;
        const filtered = (c.elderUserIds || []).filter((id) => !lordUserIds.includes(id));
        return {
          ...c,
          elderUserIds: filtered,
          leaderUserId: hasLeader ? undefined : c.leaderUserId,
          leaderName: hasLeader ? undefined : c.leaderName,
          leaderTitle: hasLeader ? undefined : c.leaderTitle,
          memberCount: filtered.length,
        };
      })
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (lordUserIds.includes(u.id) && u.rank === 'Lord') {
          const promoRecord: RankPromotionRecord = {
            id: `promo-don-${u.id}-${Date.now()}`,
            rank: 'Don',
            previousRank: 'Lord',
            promotedAt: now,
            promotedByName: `${appointerName} (${appointerRank})`,
            promotedByRank: appointerRank,
            note: `Elevated from Lord to High Table Don by ${role === 'HONCHO' ? 'Sovereign Honcho' : 'Ghost (007)'} decree.`,
            ceremonyType: 'HIGH_TABLE_DECREE',
          };
          const updatedTitles = (u.specialTitles || []).filter(
            (t) =>
              t !== 'Supreme Lord' &&
              t !== 'High Chief' &&
              t !== 'Regional Council Elder' &&
              t !== 'Domaine Council Elder'
          );
          const updatedAssignments = (u.councilAssignments || []).filter(
            (ca) =>
              ca.title !== 'Supreme Lord' &&
              ca.title !== 'High Chief' &&
              ca.title !== 'Regional Council Elder' &&
              ca.title !== 'Domaine Council Elder'
          );
          return {
            ...u,
            rank: 'Don',
            specialTitles: updatedTitles,
            councilAssignments: updatedAssignments,
            statusMessage: 'Active High Table Don (High Table Council)',
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        return u;
      })
    );

    setDonAppointmentState({
      status: isCompleted ? 'COMPLETED' : 'APPOINTMENT_OPEN',
      honchoAppointedLordIds: nextHonchoList,
      ghostAppointedLordIds: nextGhostList,
      completedAt: isCompleted ? now : undefined,
    });

    const notif: FamilyNotification = {
      id: `notif-don-role-batch-${Date.now()}`,
      userId: 'all',
      type: 'DON_APPOINTED',
      title: `🏛️ ${lordUserIds.length} Dons Appointed by ${role === 'HONCHO' ? 'Honcho (King)' : 'Ghost (007)'}`,
      message: `${lordUserIds.length} Lords elevated to Don by ${role}. High Table Council status: Honcho (${nextHonchoList.length}/6), Ghost (${nextGhostList.length}/6) — Total: ${totalAppointed}/12.`,
      priority: 'HIGH',
      createdAt: now,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `Successfully appointed ${lordUserIds.length} Lords to Don for ${role === 'HONCHO' ? 'Honcho' : 'Ghost'} (${role === 'HONCHO' ? nextHonchoList.length : nextGhostList.length}/6 filled). Total High Table Dons: ${totalAppointed}/12.`,
    };
  };

  // One-Click Appoint All 12 Dons (Top 6 Priority for Honcho, Next 6 Priority for Ghost)
  const batchAppointAll12Dons = () => {
    const isHonchoOrGhost =
      currentUser?.rank === 'Honcho (King)' ||
      currentUser?.rank === 'Ghost (007)' ||
      currentUser?.rank === 'Ghost' ||
      currentUser?.isAdmin;

    if (!isHonchoOrGhost) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only the Honcho (King) and Ghost (007) can appoint Dons.',
      };
    }

    const availableLords = users
      .filter((u) => u.rank === 'Lord' && !u.isBanned)
      .sort((a, b) => {
        const aHasSpecial = a.specialTitles?.some((t) => t === 'Caesar' || t === 'Ash-Lord') ? 1 : 0;
        const bHasSpecial = b.specialTitles?.some((t) => t === 'Caesar' || t === 'Ash-Lord') ? 1 : 0;
        if (aHasSpecial !== bHasSpecial) return bHasSpecial - aHasSpecial;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      });

    if (availableLords.length < 12) {
      return {
        success: false,
        message: `Need at least 12 active Lords to complete full High Table succession. Currently have ${availableLords.length} Lords.`,
      };
    }

    const currentHonchoList = donAppointmentState.honchoAppointedLordIds || [];
    const currentGhostList = donAppointmentState.ghostAppointedLordIds || [];

    const honchoNeeded = 6 - currentHonchoList.length;
    const ghostNeeded = 6 - currentGhostList.length;

    if (honchoNeeded === 0 && ghostNeeded === 0) {
      return {
        success: false,
        message: 'All 12 High Table Don seats are already filled (6 Honcho + 6 Ghost).',
      };
    }

    const unassignedLords = availableLords.filter(
      (l) => !currentHonchoList.includes(l.id) && !currentGhostList.includes(l.id)
    );

    const honchoPicks = unassignedLords.slice(0, honchoNeeded);
    const ghostPicks = unassignedLords.slice(honchoNeeded, honchoNeeded + ghostNeeded);

    const newHonchoIds = honchoPicks.map((l) => l.id);
    const newGhostIds = ghostPicks.map((l) => l.id);
    const allSelectedIds = [...newHonchoIds, ...newGhostIds];

    const currentHoncho = users.find((u) => u.rank === 'Honcho (King)');
    const currentGhost = users.find((u) => u.rank === 'Ghost (007)');
    const honchoName = currentHoncho ? currentHoncho.fullName : 'Honcho (King)';
    const ghostName = currentGhost ? currentGhost.fullName : 'Ghost (007)';
    const now = new Date().toISOString();

    // Strip council positions
    setCouncils((prev) =>
      prev.map((c) => {
        const hasElders = (c.elderUserIds || []).some((id) => allSelectedIds.includes(id));
        const hasLeader = c.leaderUserId && allSelectedIds.includes(c.leaderUserId);
        if (!hasElders && !hasLeader) return c;
        const filtered = (c.elderUserIds || []).filter((id) => !allSelectedIds.includes(id));
        return {
          ...c,
          elderUserIds: filtered,
          leaderUserId: hasLeader ? undefined : c.leaderUserId,
          leaderName: hasLeader ? undefined : c.leaderName,
          leaderTitle: hasLeader ? undefined : c.leaderTitle,
          memberCount: filtered.length,
        };
      })
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (newHonchoIds.includes(u.id) && u.rank === 'Lord') {
          const promoRecord: RankPromotionRecord = {
            id: `promo-don-${u.id}-${Date.now()}`,
            rank: 'Don',
            previousRank: 'Lord',
            promotedAt: now,
            promotedByName: `${honchoName} (Honcho)`,
            promotedByRank: 'Honcho (King)',
            note: 'Elevated from Lord to High Table Don by Sovereign Honcho appointment (6/6 quota).',
            ceremonyType: 'HIGH_TABLE_DECREE',
          };
          const updatedTitles = (u.specialTitles || []).filter(
            (t) =>
              t !== 'Supreme Lord' &&
              t !== 'High Chief' &&
              t !== 'Regional Council Elder' &&
              t !== 'Domaine Council Elder'
          );
          const updatedAssignments = (u.councilAssignments || []).filter(
            (ca) =>
              ca.title !== 'Supreme Lord' &&
              ca.title !== 'High Chief' &&
              ca.title !== 'Regional Council Elder' &&
              ca.title !== 'Domaine Council Elder'
          );
          return {
            ...u,
            rank: 'Don',
            specialTitles: updatedTitles,
            councilAssignments: updatedAssignments,
            statusMessage: 'Active High Table Don (Honcho Appointed)',
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        if (newGhostIds.includes(u.id) && u.rank === 'Lord') {
          const promoRecord: RankPromotionRecord = {
            id: `promo-don-${u.id}-${Date.now()}`,
            rank: 'Don',
            previousRank: 'Lord',
            promotedAt: now,
            promotedByName: `${ghostName} (Ghost 007)`,
            promotedByRank: 'Ghost (007)',
            note: 'Elevated from Lord to High Table Don by Ghost (007) appointment (6/6 quota).',
            ceremonyType: 'HIGH_TABLE_DECREE',
          };
          const updatedTitles = (u.specialTitles || []).filter(
            (t) =>
              t !== 'Supreme Lord' &&
              t !== 'High Chief' &&
              t !== 'Regional Council Elder' &&
              t !== 'Domaine Council Elder'
          );
          const updatedAssignments = (u.councilAssignments || []).filter(
            (ca) =>
              ca.title !== 'Supreme Lord' &&
              ca.title !== 'High Chief' &&
              ca.title !== 'Regional Council Elder' &&
              ca.title !== 'Domaine Council Elder'
          );
          return {
            ...u,
            rank: 'Don',
            specialTitles: updatedTitles,
            councilAssignments: updatedAssignments,
            statusMessage: 'Active High Table Don (Ghost Appointed)',
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        return u;
      })
    );

    const finalHonchoList = [...currentHonchoList, ...newHonchoIds];
    const finalGhostList = [...currentGhostList, ...newGhostIds];

    setDonAppointmentState({
      status: 'COMPLETED',
      honchoAppointedLordIds: finalHonchoList,
      ghostAppointedLordIds: finalGhostList,
      completedAt: now,
    });

    const notif: FamilyNotification = {
      id: `notif-dons-all12-${Date.now()}`,
      userId: 'all',
      type: 'DON_APPOINTED',
      title: '🏛️ 12-Don High Table Council Fully Restored',
      message: `12 New High Table Dons successfully appointed! Honcho appointed 6 (${newHonchoIds.length} new), Ghost appointed 6 (${newGhostIds.length} new). The High Table Council is fully seated!`,
      priority: 'CRITICAL',
      createdAt: now,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `Successfully appointed all 12 High Table Dons! Honcho (6/6) and Ghost (6/6) quotas fully completed.`,
    };
  };

  // Batch Appoint Lords as Dons (Strict: only Honcho & Ghost; strictly max 12 Dons total)
  const batchAppointLordsAsDons = (lordUserIds: string[]) => {
    // Strict Authorization: Only Honcho or Ghost
    const isHonchoOrGhost =
      currentUser?.rank === 'Honcho (King)' ||
      currentUser?.rank === 'Ghost (007)' ||
      currentUser?.rank === 'Ghost' ||
      currentUser?.isAdmin;

    if (!isHonchoOrGhost) {
      return {
        success: false,
        message: 'Strict Syndicate Law: Only the Honcho (King) and Ghost (007) can appoint Dons.',
      };
    }

    if (lordUserIds.length === 0) {
      return { success: false, message: 'Please select at least one Lord to appoint as Don.' };
    }

    const currentDonsCount = users.filter((u) => u.rank === 'Don').length;
    if (currentDonsCount + lordUserIds.length > 12) {
      return {
        success: false,
        message: `Strict High Table Law: There can only be 12 Dons seated at any time! Currently seated: ${currentDonsCount}. Attempted to add ${lordUserIds.length}, which exceeds 12.`,
      };
    }

    const currentHonchoList = donAppointmentState.honchoAppointedLordIds || [];
    const currentGhostList = donAppointmentState.ghostAppointedLordIds || [];

    const honchoRemaining = 6 - currentHonchoList.length;
    const ghostRemaining = 6 - currentGhostList.length;

    const honchoSlice = lordUserIds.slice(0, honchoRemaining);
    const ghostSlice = lordUserIds.slice(honchoRemaining, honchoRemaining + ghostRemaining);

    const currentHoncho = users.find((u) => u.rank === 'Honcho (King)');
    const currentGhost = users.find((u) => u.rank === 'Ghost (007)');
    const honchoName = currentHoncho ? currentHoncho.fullName : 'Honcho (King)';
    const ghostName = currentGhost ? currentGhost.fullName : 'Ghost (007)';

    const now = new Date().toISOString();

    // Strip council positions from all newly appointed Dons
    setCouncils((prev) =>
      prev.map((c) => {
        const hasElders = (c.elderUserIds || []).some((id) => lordUserIds.includes(id));
        const hasLeader = c.leaderUserId && lordUserIds.includes(c.leaderUserId);
        if (!hasElders && !hasLeader) return c;
        const filtered = (c.elderUserIds || []).filter((id) => !lordUserIds.includes(id));
        return {
          ...c,
          elderUserIds: filtered,
          leaderUserId: hasLeader ? undefined : c.leaderUserId,
          leaderName: hasLeader ? undefined : c.leaderName,
          leaderTitle: hasLeader ? undefined : c.leaderTitle,
          memberCount: filtered.length,
        };
      })
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (honchoSlice.includes(u.id) && u.rank === 'Lord') {
          const promoRecord: RankPromotionRecord = {
            id: `promo-don-${u.id}-${Date.now()}`,
            rank: 'Don',
            previousRank: 'Lord',
            promotedAt: now,
            promotedByName: `${honchoName} (Honcho)`,
            promotedByRank: 'Honcho (King)',
            note: 'Elevated from Lord to High Table Don by Sovereign Honcho Appointment.',
            ceremonyType: 'HIGH_TABLE_DECREE',
          };
          const updatedTitles = (u.specialTitles || []).filter(
            (t) =>
              t !== 'Supreme Lord' &&
              t !== 'High Chief' &&
              t !== 'Regional Council Elder' &&
              t !== 'Domaine Council Elder'
          );
          const updatedAssignments = (u.councilAssignments || []).filter(
            (ca) =>
              ca.title !== 'Supreme Lord' &&
              ca.title !== 'High Chief' &&
              ca.title !== 'Regional Council Elder' &&
              ca.title !== 'Domaine Council Elder'
          );
          return {
            ...u,
            rank: 'Don',
            specialTitles: updatedTitles,
            councilAssignments: updatedAssignments,
            statusMessage: 'Active High Table Don (Honcho Appointed)',
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        if (ghostSlice.includes(u.id) && u.rank === 'Lord') {
          const promoRecord: RankPromotionRecord = {
            id: `promo-don-${u.id}-${Date.now()}`,
            rank: 'Don',
            previousRank: 'Lord',
            promotedAt: now,
            promotedByName: `${ghostName} (Ghost 007)`,
            promotedByRank: 'Ghost (007)',
            note: 'Elevated from Lord to High Table Don by Ghost Appointment.',
            ceremonyType: 'HIGH_TABLE_DECREE',
          };
          const updatedTitles = (u.specialTitles || []).filter(
            (t) =>
              t !== 'Supreme Lord' &&
              t !== 'High Chief' &&
              t !== 'Regional Council Elder' &&
              t !== 'Domaine Council Elder'
          );
          const updatedAssignments = (u.councilAssignments || []).filter(
            (ca) =>
              ca.title !== 'Supreme Lord' &&
              ca.title !== 'High Chief' &&
              ca.title !== 'Regional Council Elder' &&
              ca.title !== 'Domaine Council Elder'
          );
          return {
            ...u,
            rank: 'Don',
            specialTitles: updatedTitles,
            councilAssignments: updatedAssignments,
            statusMessage: 'Active High Table Don (Ghost Appointed)',
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        return u;
      })
    );

    const nextHonchoList = [...currentHonchoList, ...honchoSlice];
    const nextGhostList = [...currentGhostList, ...ghostSlice];
    const totalAppointed = nextHonchoList.length + nextGhostList.length;
    const isCompleted = totalAppointed >= 12;

    setDonAppointmentState({
      status: isCompleted ? 'COMPLETED' : 'APPOINTMENT_OPEN',
      honchoAppointedLordIds: nextHonchoList,
      ghostAppointedLordIds: nextGhostList,
      completedAt: isCompleted ? now : undefined,
    });

    const notif: FamilyNotification = {
      id: `notif-dons-batch-${Date.now()}`,
      userId: 'all',
      type: 'DON_APPOINTED',
      title: '🏛️ High Table Don Appointments Processed',
      message: `${lordUserIds.length} Lords have been elevated to High Table Don! Honcho: ${nextHonchoList.length}/6, Ghost: ${nextGhostList.length}/6 (Total: ${totalAppointed}/12).`,
      priority: 'CRITICAL',
      createdAt: now,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `Successfully appointed ${lordUserIds.length} Lords to High Table Don (Honcho: ${nextHonchoList.length}/6, Ghost: ${nextGhostList.length}/6).`,
    };
  };

  const resetSuccessionWorkflow = () => {
    setGhostElectionState({
      status: 'INACTIVE',
      votes: {},
    });
    setDonAppointmentState({
      status: 'INACTIVE',
      honchoAppointedLordIds: [],
      ghostAppointedLordIds: [],
    });
  };

  // ==========================================
  // ANNUAL 1-YEAR AUTOMATIC PROMOTION (JB -> Boss -> Cartel Man -> O.G)
  // ==========================================

  // Calculate days in rank for a user
  const getDaysInCurrentRank = (user: User): number => {
    if (!user.promotionHistory || user.promotionHistory.length === 0) {
      const joined = new Date(user.joinedAt).getTime();
      return Math.max(0, Math.floor((Date.now() - joined) / (1000 * 60 * 60 * 24)));
    }
    const matching = [...user.promotionHistory]
      .reverse()
      .find((p) => p.rank === user.rank);
    if (matching && matching.promotedAt) {
      const promoTime = new Date(matching.promotedAt).getTime();
      return Math.max(0, Math.floor((Date.now() - promoTime) / (1000 * 60 * 60 * 24)));
    }
    const joined = new Date(user.joinedAt).getTime();
    return Math.max(0, Math.floor((Date.now() - joined) / (1000 * 60 * 60 * 24)));
  };

  const yearlyPromotionCandidates: YearlyPromotionCandidate[] = useMemo(() => {
    const targetRanks = ['Junior Boss (31-JB)', 'Boss', 'Cartel Man'];
    const candidates: YearlyPromotionCandidate[] = [];

    users.forEach((u) => {
      if (targetRanks.includes(u.rank)) {
        const currentRank = u.rank as 'Junior Boss (31-JB)' | 'Boss' | 'Cartel Man';
        let nextRank: 'Boss' | 'Cartel Man' | 'O.G' = 'Boss';
        if (currentRank === 'Junior Boss (31-JB)') nextRank = 'Boss';
        else if (currentRank === 'Boss') nextRank = 'Cartel Man';
        else if (currentRank === 'Cartel Man') nextRank = 'O.G';

        const daysInRank = getDaysInCurrentRank(u);
        const daysRemaining = Math.max(0, 365 - daysInRank);
        const isEligible = daysInRank >= 365;

        candidates.push({
          user: u,
          currentRank,
          nextRank,
          daysInRank,
          daysRemaining,
          isEligible,
        });
      }
    });

    return candidates.sort((a, b) => b.daysInRank - a.daysInRank);
  }, [users]);

  // Run all eligible 1-year automatic promotions
  const runYearlyPromotions = () => {
    const eligible = yearlyPromotionCandidates.filter((c) => c.isEligible);
    if (eligible.length === 0) {
      return {
        success: false,
        count: 0,
        message: 'No members have currently reached 365+ days in rank for automatic promotion.',
      };
    }

    const now = new Date().toISOString();
    const promotedFromJBIds = eligible
      .filter((c) => c.currentRank === 'Junior Boss (31-JB)')
      .map((c) => c.user.id);

    if (promotedFromJBIds.length > 0) {
      setCouncils((prev) =>
        prev.map((c) => ({
          ...c,
          custodianUserIds: (c.custodianUserIds || []).filter((id) => !promotedFromJBIds.includes(id)),
        }))
      );
    }

    const updatedUsers = users.map((u) => {
      const match = eligible.find((c) => c.user.id === u.id);
      if (match) {
        const promoRecord: RankPromotionRecord = {
          id: `promo-auto-year-${u.id}-${Date.now()}`,
          rank: match.nextRank,
          previousRank: match.currentRank,
          promotedAt: now,
          promotedByName: 'Annual 1-Year Promotion System',
          note: `Completed 1 full year (365+ days) in ${match.currentRank}. Automatically stepped up one rank to ${match.nextRank}.`,
          ceremonyType: 'STANDARD_PROMOTION',
        };
        const isFromJB = match.currentRank === 'Junior Boss (31-JB)';
        const titles = isFromJB
          ? (u.specialTitles || []).filter((t) => t !== 'Custodian')
          : u.specialTitles;
        const assignments = isFromJB
          ? (u.councilAssignments || []).filter((ca) => ca.title !== 'Custodian')
          : u.councilAssignments;

        return {
          ...u,
          rank: match.nextRank,
          specialTitles: titles,
          councilAssignments: assignments,
          statusMessage: `Stepped up to ${match.nextRank} after 1 full year in rank.`,
          promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    // Notification
    const notif: FamilyNotification = {
      id: `notif-yearly-promo-${Date.now()}`,
      userId: 'all',
      type: 'YEARLY_RANK_PROMOTED',
      title: '🎉 Annual 1-Year Rank Step-Up Completed',
      message: `${eligible.length} eligible syndicate members have completed 365 days in rank and automatically stepped up one rank (JB → Boss → Cartel Man → O.G)!`,
      priority: 'HIGH',
      createdAt: now,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      count: eligible.length,
      message: `Successfully executed annual 1-step-up promotion for ${eligible.length} members!`,
    };
  };

  const promoteSingleYearlyCandidate = (userId: string) => {
    const candidate = yearlyPromotionCandidates.find((c) => c.user.id === userId);
    if (!candidate) {
      return { success: false, message: 'Member not found in yearly promotion registry.' };
    }

    if (!candidate.isEligible) {
      return {
        success: false,
        message: `${candidate.user.fullName} has completed ${candidate.daysInRank}/365 days in rank. Members must wait to complete their 1 full year (${candidate.daysRemaining} days remaining) before stepping up to ${candidate.nextRank}.`,
      };
    }

    const now = new Date().toISOString();

    if (candidate.currentRank === 'Junior Boss (31-JB)') {
      setCouncils((prev) =>
        prev.map((c) => ({
          ...c,
          custodianUserIds: (c.custodianUserIds || []).filter((id) => id !== userId),
        }))
      );
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const promoRecord: RankPromotionRecord = {
            id: `promo-auto-year-${u.id}-${Date.now()}`,
            rank: candidate.nextRank,
            previousRank: candidate.currentRank,
            promotedAt: now,
            promotedByName: 'Annual 1-Year Promotion System',
            note: `Completed 1 full year (${candidate.daysInRank} days) in ${candidate.currentRank}. Stepped up to ${candidate.nextRank}.`,
            ceremonyType: 'STANDARD_PROMOTION',
          };
          const isFromJB = candidate.currentRank === 'Junior Boss (31-JB)';
          const titles = isFromJB
            ? (u.specialTitles || []).filter((t) => t !== 'Custodian')
            : u.specialTitles;
          const assignments = isFromJB
            ? (u.councilAssignments || []).filter((ca) => ca.title !== 'Custodian')
            : u.councilAssignments;

          return {
            ...u,
            rank: candidate.nextRank,
            specialTitles: titles,
            councilAssignments: assignments,
            statusMessage: `Stepped up to ${candidate.nextRank} after 1 year in rank.`,
            promotionHistory: [promoRecord, ...(u.promotionHistory || [])],
          };
        }
        return u;
      })
    );

    const notif: FamilyNotification = {
      id: `notif-single-year-${Date.now()}`,
      userId: 'all',
      type: 'YEARLY_RANK_PROMOTED',
      title: '⭐ Annual 1-Year Rank Step-Up Executed',
      message: `${candidate.user.fullName} has completed 1 full year in ${candidate.currentRank} and stepped up to ${candidate.nextRank}!`,
      priority: 'HIGH',
      createdAt: now,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    triggerCelebration(
      candidate.user,
      `⭐ STEPPED UP TO ${candidate.nextRank.toUpperCase()}`,
      `${candidate.user.fullName} completed 1-year tenure as ${candidate.currentRank}!`,
      candidate.nextRank
    );

    return {
      success: true,
      message: `${candidate.user.fullName} stepped up to ${candidate.nextRank}.`,
    };
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_CURRENT);
    localStorage.removeItem(STORAGE_KEY_COUNCILS);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_EVENTS);
    localStorage.removeItem(STORAGE_KEY_ANNOUNCEMENTS);
    localStorage.removeItem(STORAGE_KEY_LEFT_ROOMS);
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEY_AM_REQUESTS);
    localStorage.removeItem(STORAGE_KEY_PONTUS);
    localStorage.removeItem(STORAGE_KEY_HIGH_PRIEST);
    localStorage.removeItem(STORAGE_KEY_GHOST_ELECTION);
    localStorage.removeItem(STORAGE_KEY_DON_APPOINTMENT);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCouncils(INITIAL_COUNCILS);
    setMessages(INITIAL_MESSAGES);
    setEvents(INITIAL_EVENTS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setLeftRooms([]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAmRequests([]);
    setPontusRecords([]);
    setHighPriestRecords([]);
    setGhostElectionState({ status: 'INACTIVE', votes: {} });
    setDonAppointmentState({
      status: 'INACTIVE',
      honchoAppointedLordIds: [],
      ghostAppointedLordIds: [],
    });
  };

  return (
    <FamilyContext.Provider
      value={{
        currentUser,
        users,
        councils,
        chatRooms: CHAT_ROOMS,
        messages,
        announcements,
        events,
        notifications,
        userNotifications,
        unreadNotifsCount,
        m19MilestoneCandidates,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        dismissAllNotifications,
        activeRoomId,
        leftRooms,
        selectedProfileUser,
        setSelectedProfileUser,
        setActiveRoomId,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isQuickActionsOpen,
        setIsQuickActionsOpen,
        loginUser,
        logoutUser,
        signupUser,
        updateProfile,
        updateUserProfile,
        denounceMembership,
        approveRecruit,
        makeJuniorBossM19,
        advanceNewBornDays,
        promoteUserRank,
        addPromotionRecord,
        isHonchoOrGhost,
        canAccessAdmin,
        isAboveFounders,
        banUser,
        unbanUser,
        permanentlyDeleteUser,
        celebration,
        triggerCelebration,
        dismissCelebration,
        sendMessage,
        leaveRoom,
        rejoinRoom,
        canAccessRoom,
        amRequests,
        sendAmA13Request,
        respondToAmA13Request,
        cancelAmA13Assignment,
        createRegion,
        createDomaine,
        updateCouncil,
        deleteCouncil,
        appointCustodian,
        removeCustodian,
        appointCouncilElder,
        removeCouncilElder,
        voteForNextLeader,
        concludeTenureAndElectNextLeader,
        assignSpecialTitle,
        createCouncil,
        assignCouncilLeader,
        createEvent,
        toggleRsvp,
        createAnnouncement,
        resetAllData,

        // High Table Succession, Voting & Appointment System
        pontusRecords,
        highPriestRecords,
        ghostElectionState,
        donAppointmentState,
        triggerHonchoStepDown,
        triggerGhostStepDown,
        castGhostVote,
        finalizeGhostElection,
        appointLordAsDon,
        batchAppointLordsForRole,
        batchAppointLordsAsDons,
        batchAppointAll12Dons,
        resetSuccessionWorkflow,

        // Annual 1-Year Automatic Promotion (JB -> Boss -> Cartel Man -> O.G)
        yearlyPromotionCandidates,
        runYearlyPromotions,
        promoteSingleYearlyCandidate,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
