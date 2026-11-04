export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ThreatLog {
  id: string;
  type: 'anti-nuke' | 'anti-spam' | 'anti-invite' | 'rogue-bot' | 'lockdown';
  action: string;
  target: string;
  executor: string;
  timestamp: string;
  severity: ThreatSeverity;
  details: string;
}

export interface AntiNukeConfig {
  enabled: boolean;
  massBanLimit: number; // max bans in window
  massBanWindowSeconds: number;
  massBanAction: 'ban' | 'kick' | 'strip_roles';
  massKickLimit: number;
  massChannelDeleteLimit: number;
  massRoleDeleteLimit: number;
  quarantineNewBots: boolean;
  blockWebhookCreation: boolean;
  whitelistUserIds: string[];
}

export interface AntiSpamConfig {
  enabled: boolean;
  maxMessages: number;
  windowSeconds: number;
  maxMentions: number;
  blockRepetitiveMessages: boolean;
  blockEmojiFlood: boolean;
  punishment: 'timeout' | 'kick' | 'ban';
  timeoutDurationMinutes: number;
  trapChannels: string[];
}

export interface AntiInviteConfig {
  enabled: boolean;
  blockDiscordInvites: boolean;
  blockSuspiciousLinks: boolean;
  whitelistDomains: string[];
  exemptRoles: string[];
  action: 'delete_warn' | 'timeout' | 'kick';
}

export interface TicketMessage {
  id: string;
  author: string;
  avatar: string;
  isStaff: boolean;
  content: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  channelName: string;
  category: 'store' | 'support' | 'complaints' | 'partnerships';
  categoryLabel: string;
  user: {
    name: string;
    avatar: string;
    id: string;
  };
  claimedBy: string | null; // Staff name
  status: 'open' | 'claimed' | 'closed';
  createdAt: string;
  messages: TicketMessage[];
}

export interface ApplicationQuestion {
  id: string;
  question: string;
  placeholder?: string;
  type: 'short' | 'paragraph';
  required: boolean;
}

export interface ApplicationsConfig {
  enabled: boolean;
  applyChannelName: string;
  adminReviewChannelName: string;
  resultsChannelName?: string;
  acceptedRoleName: string;
  panelTitle: string;
  panelDescription: string;
  panelColor: string;
  panelBannerUrl?: string;
  panelButtonLabel: string;
  panelButtonEmoji: string;
  dmOnAccept: boolean;
  acceptDmMessage: string;
  dmOnReject: boolean;
  rejectDmMessage: string;
  questions: ApplicationQuestion[];
}

export interface ApplicationForm {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  questions: ApplicationQuestion[];
}

export interface ApplicationSubmission {
  id: string;
  formId: string;
  formTitle: string;
  applicant: {
    id?: string;
    name: string;
    tag: string;
    avatar: string;
    joinedAt: string;
  };
  answers: { [questionId: string]: string };
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  reviewNotes?: string;
}

export interface AutoResponse {
  id: string;
  trigger: string;
  matchType: 'exact' | 'contains' | 'starts_with';
  reply: string;
  autoReaction?: string;
  enabled: boolean;
}

export interface QuranReciter {
  id: string;
  name: string;
  nameEn: string;
  streamUrl: string;
  description: string;
  style: 'murattal' | 'mujawwad' | 'radio';
}

export interface QuranScheduleSlot {
  id: string;
  startHour: number; // 0-23 (e.g. 6 for morning, 12 for dhuhr, 16 for asr, 20 for night)
  endHour: number;   // 0-23
  reciterId: string;
  label: string;
}

export interface Voice247Config {
  enabled: boolean;
  channelId: string;
  channelName: string;
  audioMode: 'quran' | 'radio' | 'silent';
  selectedReciter: string;
  autoReconnect: boolean;
  deafened: boolean;
  muted: boolean;
  scheduleEnabled?: boolean;
  scheduleSlots?: QuranScheduleSlot[];
}

export interface LevelUser {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  messagesCount: number;
}

export interface LevelConfig {
  enabled: boolean;
  xpMultiplier: number;
  levelUpChannel: string;
  cardTheme: 'crimson' | 'obsidian' | 'emerald';
}

export interface GiveawayItem {
  id: string;
  prize: string;
  winnersCount: number;
  channel: string;
  endsAt: string;
  entriesCount: number;
  status: 'active' | 'ended';
  winnerNames?: string[];
}

export interface BackupSnapshot {
  id: string;
  code: string;
  createdAt: string;
  rolesCount: number;
  channelsCount: number;
  sizeKB: number;
  note: string;
}

export interface VerificationConfig {
  enabled: boolean;
  channelName: string;
  verifiedRoleName: string;
  minAccountAgeDays: number;
  blockDefaultAvatar: boolean;
  captchaMode: 'button' | 'code_image' | 'web_shield';
}

export interface BotBasicSettings {
  botUsername: string;
  presenceStatus: 'online' | 'dnd' | 'idle' | 'invisible';
  activityType: 'PLAYING' | 'WATCHING' | 'LISTENING' | 'COMPETING' | 'STREAMING';
  activityText: string;
  streamingUrl: string;
  prefix: string;
  logChannelName: string;
  commandsChannelName?: string;
  keepAlive247: boolean;
  heartbeatIntervalSec: number;
  bioDescription?: string;
  websiteUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
  supportServerUrl?: string;
  bannerColor?: string;
}

export interface TicketPanelButton {
  id: string;
  label: string;
  emoji: string;
  style: 'Primary' | 'Secondary' | 'Success' | 'Danger';
  categoryDescription: string;
  targetCategoryName?: string;
  enabled: boolean;
}

export type ThemeMode = 'dark' | 'midnight' | 'cyber';

export interface TicketPanelConfig {
  storeName: string;
  embedTitle: string;
  embedDescription: string;
  embedColor: string;
  welcomeMessage: string;
  targetChannelName: string;
  ticketLogChannelName?: string;
  ticketCategoryName?: string;
  supportRoleName: string;
  buttons: TicketPanelButton[];
  // NEW ENHANCEMENTS:
  namingFormat?: 'number' | 'username' | 'username_number'; // النمط: رقم فقط | اسم العضو فقط | اسم العضو ورقم
  channelPrefix?: string; // e.g. 'ticket' or 'تذكرة'
  askReasonModal?: boolean; // طلب سبب فتح التذكرة في نافذة منبثقة (Modal)
  aiWaitingAssistant?: boolean; // تفعيل رسالة الانتظار الذكية وسؤال الذكاء الاصطناعي لحين وصول الإدارة
  waitingMessage?: string; // نص رسالة الانتظار المخصصة
}

export interface DiscordCommandConfig {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  category: 'moderation' | 'channels' | 'voice' | 'security' | 'tickets' | 'islamic' | 'utility' | 'general';
  enabled: boolean;
  cooldownSec: number;
  customReply: string;
  allowedChannel?: string; // '' or 'all' means all channels, or specific channel name like 'cmd'
  isSensitive?: boolean; // true for dangerous/destructive commands hidden from regular server control mode
}

export type AccessRoleMode = 'bot_owner' | 'server_admin';

export interface GuildJoinNotification {
  id: string;
  guildId: string;
  guildName: string;
  guildIcon: string;
  memberCount: number;
  channelsCount: number;
  ownerId: string;
  ownerTag: string;
  joinedAt: string;
  permissionGranted: string;
  accessMode: 'server_admin';
  read: boolean;
}

export interface ConnectedGuildItem {
  id: string;
  name: string;
  icon: string;
  memberCount: number;
  channelsCount: number;
  rolesCount: number;
  ownerId?: string;
  owner?: boolean;
}

export interface GuildChannelItem {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'category';
  guildId?: string;
}

export interface AzkarItem {
  id: string;
  category: 'sabah' | 'masaa' | 'istighfar' | 'salawat' | 'quran' | 'general';
  categoryLabel: string;
  arabicText: string;
  virtue: string;
  source?: string;
  enabled: boolean;
}

export interface AzkarConfig {
  enabled: boolean;
  channelName: string;
  intervalMinutes: number; // e.g. 15, 30, 60, 180, 360
  embedColor: string;
  showVirtue: boolean;
  mentionRoleName?: string;
  items: AzkarItem[];
}

export interface HoneypotTrapConfig {
  enabled: boolean;
  channelName: string; // e.g. "🚫-ممنوع-الدخول" or "trap"
  punishment: 'ban' | 'kick' | 'timeout' | 'quarantine';
  timeoutDurationMinutes: number;
  deleteMessage: boolean;
  alertLogChannel: string;
  customWarningMessage: string;
  whitelistUserIds: string[];
  whitelistRoleNames: string[];
  totalTrapped: number;
}

export interface WelcomeConfig {
  enabled: boolean;
  channelName: string;
  messageMode: 'embed_and_text' | 'embed_only' | 'text_only';
  welcomeMessage: string;
  embedTitle: string;
  embedDescription: string;
  embedColor: string;
  bannerUrl: string;
  embedBannerUrl?: string;
  showAvatarThumbnail: boolean;
  showMemberCount: boolean;
  showAccountAge: boolean;
  footerText: string;
  embedFooter?: string;
  autoRoleEnabled: boolean;
  autoRoleName: string;
  botAutoRoleEnabled?: boolean;
  botAutoRoleName: string;
  sendDm: boolean;
  dmMessage: string;
  leaveEnabled: boolean;
  leaveChannelName: string;
  leaveMessage: string;
  mentionUser?: boolean;
  useEmbed?: boolean;
}



