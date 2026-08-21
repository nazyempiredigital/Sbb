export type MafiaRank =
  | 'No Man'
  | 'New Born'
  | 'Junior Boss (31-JB)'
  | 'Boss'
  | 'Cartel Man'
  | 'O.G'
  | 'Lord'
  | 'BARON'
  | 'Ghost (007)'
  | 'Don'
  | 'Honcho (King)'
  | string; // Allows numbered honorary ranks like 'PONTUS I', 'HIGH PRIEST I'

export const RANK_HIERARCHY: MafiaRank[] = [
  'No Man',
  'New Born',
  'Junior Boss (31-JB)',
  'Boss',
  'Cartel Man',
  'O.G',
  'Lord',
  'Don',
  'Ghost (007)',
  'Honcho (King)',
];

export const RANK_LEVELS: Record<string, number> = {
  'No Man': 1,
  'New Born': 2,
  'Junior Boss (31-JB)': 3,
  'Boss': 4,
  'Cartel Man': 5,
  'O.G': 6,
  'Lord': 7,
  'Don': 8,
  'BARON': 8,
  'Baron': 8,
  'Ghost (007)': 9,
  'Ghost': 9,
  'Honcho (King)': 10,
  'Pontus': 10,
  'High Priest': 10,
};

export type SpecialTitle =
  | 'Ash-Lord'
  | 'Caesar'
  | 'Supreme Lord'
  | 'Regional Council Elder'
  | 'High Chief'
  | 'Domaine Council Elder'
  | 'Silenzio / Silent Killer / 07'
  | 'Problem Man / P-Man'
  | 'Bishop'
  | 'FM (Front man)'
  | 'O.R'
  | 'AM (A13)'
  | 'Custodian'
  | 'Pontus'
  | 'High Priest'
  | 'Baron'
  | string; // Allows dynamic titles like 'AM/A13 to [Name]', 'PONTUS I', etc.

export const ALL_SPECIAL_TITLES: string[] = [
  'Ash-Lord',
  'Caesar',
  'Supreme Lord',
  'Regional Council Elder',
  'High Chief',
  'Domaine Council Elder',
  'Silenzio / Silent Killer / 07',
  'Problem Man / P-Man',
  'Bishop',
  'FM (Front man)',
  'O.R',
  'AM (A13)',
  'Custodian',
  'Pontus',
  'High Priest',
  'Baron',
];

export type CouncilTitle =
  | 'Supreme Lord'
  | 'Regional Council Elder'
  | 'High Chief'
  | 'Domaine Council Elder'
  | 'Council Elder'
  | 'Custodian';

export type TerritoryType = 'REGION' | 'DOMAINE';

export interface CouncilAssignment {
  councilId: string;
  councilName: string;
  type?: TerritoryType;
  regionName?: string;
  domaineName?: string;
  title: CouncilTitle;
  assignedAt: string;
}

export interface DomaineCouncil {
  id: string;
  name: string;
  type: TerritoryType; // 'REGION' comes before 'DOMAINE'
  regionName?: string; // For Domaines: specifies the parent Region
  domaine?: string;
  description: string;
  leaderUserId?: string;
  leaderName?: string;
  leaderTitle?: CouncilTitle;
  governingRank: 'Lord' | 'O.G'; // Law: Regions are ruled ONLY by Lords; Domaines are ruled ONLY by O.Gs
  memberCount: number;
  territorySector: string;
  
  // Elders and Custodians
  elderUserIds?: string[]; // 12 Lords for Region, 9 O.Gs for Domaine
  custodianUserIds?: string[]; // 31-JBs appointed to guard the territory
  
  // Establishment
  establishedByUserId?: string;
  establishedByName?: string;
  establishedByRank?: MafiaRank;
  establishedAt?: string;
  
  // 1-Year Tenure & Succession
  tenureStartDate?: string;
  tenureEndDate?: string;
  nextLeaderVotes?: Record<string, string>; // voterUserId -> candidateElderUserId
  pastLeaders?: {
    userId: string;
    name: string;
    title: CouncilTitle;
    termConcludedAt: string;
    honoraryTitleBestowed?: string;
    rankUpgradedTo?: MafiaRank;
  }[];
}

export interface AmA13Assignment {
  targetUserId: string;
  targetName: string;
  targetRank: MafiaRank;
  assignedAt: string;
}

export interface MyAmA13Info {
  amUserId: string;
  amName: string;
  amRank: MafiaRank;
  assignedAt: string;
}

export interface AmA13Request {
  id: string;
  requesterUserId: string;
  requesterName: string;
  requesterRank: MafiaRank;
  requesterAvatar: string;
  targetUserId: string;
  targetName: string;
  targetRank: MafiaRank;
  targetAvatar: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  respondedAt?: string;
}

export interface RankPromotionRecord {
  id: string;
  rank: MafiaRank;
  previousRank?: MafiaRank;
  promotedAt: string; // ISO string or date
  promotedByUserId?: string;
  promotedByName?: string;
  promotedByRank?: MafiaRank;
  note?: string;
  ceremonyType?: 'GATE_APPROVAL' | 'M19_INDUCTION' | 'HIGH_TABLE_DECREE' | 'FOUNDER_ASCENSION' | 'STANDARD_PROMOTION' | 'COUNCIL_SUCCESSION_HONOR';
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  gtaHandle: string;
  discordTag: string;
  rank: MafiaRank;
  specialTitles: string[];
  councilAssignments: CouncilAssignment[];
  bio: string;
  joinedAt: string; // ISO string
  
  // AM / A13 Mentorship & Personal Guard
  amAssignments?: AmA13Assignment[]; // If user is AM/A13 to other lower rank members
  myAmA13?: MyAmA13Info; // If user has an AM/A13 assigned to them
  
  // Rank Promotion History Timeline
  promotionHistory?: RankPromotionRecord[];
  
  // Approval / New Born / Made Status
  approvedAt?: string; // When No Man was confirmed as New Born (Day 1 starts)
  approvedByUserId?: string; // Approver's ID (O.G or higher)
  approvedByName?: string;
  approvedByRank?: MafiaRank;
  
  // Made Status (M19 induction on Day 31)
  madeAt?: string; // When ceremony was held
  madeByUserId?: string;
  madeByName?: string;
  madeByRank?: MafiaRank;
  
  // Custom manual day offset for testing 31-day countdown
  simulatedDaysPassed?: number;
  
  isAdmin?: boolean; // Can manage titles, councils, events
  statusMessage?: string;
  
  // Account moderation status (AB / Apex authority)
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
  bannedBy?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  tagline: string;
  minRank: MafiaRank;
  description: string;
  iconName: string;
  badgeColor: string;
  canLeaveAndRejoin?: boolean; // For higher ranks joining lower lounges
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRank: MafiaRank;
  senderAvatar: string;
  senderSpecialTitles?: SpecialTitle[];
  senderCouncilTitle?: string;
  text: string;
  createdAt: string;
}

export interface FamilyEvent {
  id: string;
  title: string;
  category: 'M19_CEREMONY' | 'WAR_COUNCIL' | 'RP_CONVOY' | 'DOMAINE_MEET' | 'FAMILY_SUMMIT';
  description: string;
  scheduledFor: string;
  isMandatoryForNewBorns?: boolean;
  location: string;
  createdBy: string;
  creatorRank: MafiaRank;
  rsvps: string[]; // User IDs who RSVPed
  createdAt: string;
}

export interface FamilyAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'CRITICAL' | 'IMPORTANT' | 'GENERAL';
  author: string;
  authorRank: MafiaRank;
  date: string;
}

export type NotificationType =
  | 'M19_MILESTONE_3DAYS'
  | 'M19_ELIGIBLE_NOW'
  | 'M19_CEREMONY_COMPLETED'
  | 'RECRUIT_APPROVED'
  | 'RANK_PROMOTED'
  | 'SPECIAL_TITLE_BESTOWED'
  | 'COUNCIL_ASSIGNED'
  | 'COUNCIL_ESTABLISHED'
  | 'CUSTODIAN_APPOINTED'
  | 'AM_A13_REQUEST_RECEIVED'
  | 'AM_A13_REQUEST_ACCEPTED'
  | 'AM_A13_REQUEST_DECLINED'
  | 'SUCCESSION_COMPLETED'
  | 'HONCHO_STEPPED_DOWN'
  | 'GHOST_ASCENDED'
  | 'GHOST_ELECTED'
  | 'DON_APPOINTED'
  | 'BARON_CONFERRED'
  | 'YEARLY_RANK_PROMOTED'
  | 'SYSTEM_ALERT';

export interface PontusRecord {
  id: string;
  userId: string;
  name: string;
  gtaHandle: string;
  pontusTitle: string; // e.g. 'PONTUS I'
  steppedDownAt: string;
  tenureDays: number;
}

export interface HighPriestRecord {
  id: string;
  userId: string;
  name: string;
  gtaHandle: string;
  highPriestTitle: string; // e.g. 'HIGH PRIEST I'
  concludedAt: string;
  tenureDays: number;
}

export interface GhostElectionState {
  status: 'INACTIVE' | 'VOTING_OPEN' | 'COMPLETED';
  votes: Record<string, string>; // voterDonId -> candidateDonId
  startedAt?: string;
  completedAt?: string;
  electedGhostId?: string;
  electedGhostName?: string;
  baronIds?: string[];
}

export interface DonAppointmentState {
  status: 'INACTIVE' | 'APPOINTMENT_OPEN' | 'COMPLETED';
  honchoAppointedLordIds: string[]; // max 6
  ghostAppointedLordIds: string[]; // max 6
  completedAt?: string;
}

export interface YearlyPromotionCandidate {
  user: User;
  currentRank: 'Junior Boss (31-JB)' | 'Boss' | 'Cartel Man';
  nextRank: 'Boss' | 'Cartel Man' | 'O.G';
  daysInRank: number;
  daysRemaining: number;
  isEligible: boolean;
}

export function toRomanNumeral(num: number): string {
  const romanMap: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let result = '';
  let n = Math.max(1, Math.floor(num));
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result || 'I';
}

export interface FamilyNotification {
  id: string;
  userId: string; // 'all' or specific target user id
  type: NotificationType;
  title: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  createdAt: string;
  read: boolean;
  actionLabel?: string;
  actionTab?: string;
  targetUserId?: string;
  requestId?: string;
  meta?: {
    recruitId?: string;
    recruitName?: string;
    daysPassed?: number;
    daysRemaining?: number;
    sponsorId?: string;
    sponsorName?: string;
    promotedRank?: MafiaRank;
    councilId?: string;
    councilName?: string;
    councilType?: TerritoryType;
    councilTitle?: CouncilTitle;
    amRequestId?: string;
    requesterId?: string;
    requesterName?: string;
    requesterRank?: MafiaRank;
    voterId?: string;
    voterName?: string;
    appointerId?: string;
    appointerName?: string;
    appointerRank?: string;
    pontusTitle?: string;
    highPriestTitle?: string;
  };
}
