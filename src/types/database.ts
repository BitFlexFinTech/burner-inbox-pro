// Database types for Supabase backend

export type PlanType = 'free' | 'premium' | 'enterprise';
export type UserRoleType = 'user' | 'admin';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
export type NotificationType = 'banner' | 'toast' | 'modal' | 'info' | 'warning' | 'success' | 'error';
export type TargetAudience = 'all' | 'free' | 'premium' | 'enterprise';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

// Feature type for FeatureGate component
export type Feature = 'sms' | 'inboxHistory' | 'forwarding' | 'apiAccess' | 'adsEnabled';

// Plan features configuration (static, replaces db.getPlanConfig)
export interface PlanFeatures {
  maxEmailsPerDay: number;
  lifespanMinutes: number;
  inboxHistory: boolean;
  adsEnabled: boolean;
  forwarding: boolean;
  apiAccess: boolean;
  smsEnabled: boolean;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    maxEmailsPerDay: 3,
    lifespanMinutes: 60,
    inboxHistory: false,
    adsEnabled: true,
    forwarding: false,
    apiAccess: false,
    smsEnabled: false,
  },
  premium: {
    maxEmailsPerDay: 50,
    lifespanMinutes: 1440,
    inboxHistory: true,
    adsEnabled: false,
    forwarding: true,
    apiAccess: true,
    smsEnabled: false,
  },
  enterprise: {
    maxEmailsPerDay: -1, // unlimited
    lifespanMinutes: 10080,
    inboxHistory: true,
    adsEnabled: false,
    forwarding: true,
    apiAccess: true,
    smsEnabled: true,
  },
};

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  plan: PlanType;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleRecord {
  id: string;
  userId: string;
  role: UserRoleType;
}

export interface PlanConfig {
  id: string;
  name: PlanType;
  maxEmailsPerDay: number;
  lifespanMinutes: number;
  inboxHistory: boolean;
  adsEnabled: boolean;
  forwarding: boolean;
  apiAccess: boolean;
  smsEnabled: boolean;
  price: number;
}

export interface Inbox {
  id: string;
  userId: string;
  emailAddress: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  // Forwarding fields
  forwardingEnabled?: boolean;
  forwardingEmail?: string;
  // SMS fields
  phoneNumber?: string;
  // Tags
  tags?: string[];
}

export interface Message {
  id: string;
  inboxId: string;
  fromAddress: string;
  fromName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  verificationCode: string | null;
  receivedAt: string;
  isRead: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  provider: 'stripe' | 'paypal' | 'crypto';
  externalId?: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  createdAt: string;
}

export interface CryptoTransaction {
  id: string;
  userId: string;
  currency: 'BTC' | 'USDT' | 'ETH' | 'ZCASH';
  walletAddress: string;
  amount: string;
  amountUsd: number;
  txHash: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface AdminWallet {
  id: string;
  currency: 'BTC' | 'USDT' | 'ETH' | 'ZCASH';
  network: string;
  address: string;
  isActive: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface SiteNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetAudience: TargetAudience;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
}

export interface Integration {
  id: string;
  name: string;
  provider: 'stripe' | 'paypal' | 'resend' | 'datagenit' | 'metamask';
  status: IntegrationStatus;
  connectedAt?: string;
  settings: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  userId?: string;
  adminId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface UserQuota {
  id: string;
  userId: string;
  emailsCreatedToday: number;
  lastResetAt: string;
}

export interface SMSMessage {
  id: string;
  inboxId: string;
  phoneNumber: string;
  fromNumber: string;
  body: string;
  receivedAt: string;
  isRead: boolean;
}

export interface ForwardingLog {
  id: string;
  inboxId: string;
  messageId: string;
  forwardedTo: string;
  status: 'success' | 'failed';
  createdAt: string;
}

// =============================================================================
// DATABASE ROW TYPES (snake_case for Supabase)
// =============================================================================

export interface SiteNotificationRow {
  id: string;
  title: string;
  message: string;
  type: string;
  target_audience: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
}

export interface AdminWalletRow {
  id: string;
  currency: string;
  network: string;
  address: string;
  is_active: boolean;
  updated_by: string | null;
  updated_at: string | null;
}

export interface CryptoTransactionRow {
  id: string;
  user_id: string;
  currency: string;
  wallet_address: string;
  amount: string;
  amount_usd: number;
  tx_hash: string | null;
  status: string;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// =============================================================================
// TRANSFORMATION HELPERS
// =============================================================================

export function transformSiteNotification(row: SiteNotificationRow): SiteNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type as NotificationType,
    targetAudience: row.target_audience as TargetAudience,
    isActive: row.is_active,
    startDate: row.start_date || '',
    endDate: row.end_date || undefined,
    createdBy: row.created_by || '',
    createdAt: row.created_at,
  };
}

export function transformAdminWallet(row: AdminWalletRow): AdminWallet {
  return {
    id: row.id,
    currency: row.currency as 'BTC' | 'USDT' | 'ETH' | 'ZCASH',
    network: row.network,
    address: row.address,
    isActive: row.is_active,
    updatedBy: row.updated_by || '',
    updatedAt: row.updated_at || '',
  };
}

export function transformCryptoTransaction(row: CryptoTransactionRow): CryptoTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    currency: row.currency as 'BTC' | 'USDT' | 'ETH' | 'ZCASH',
    walletAddress: row.wallet_address,
    amount: row.amount,
    amountUsd: row.amount_usd,
    txHash: row.tx_hash || '',
    status: row.status as PaymentStatus,
    createdAt: row.created_at,
  };
}

export function transformAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    adminId: row.admin_id || undefined,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata,
    ipAddress: row.ip_address || undefined,
    createdAt: row.created_at,
  };
}

// Database state type (for legacy compatibility)
export interface DatabaseState {
  users: User[];
  userRoles: UserRoleRecord[];
  planConfigs: PlanConfig[];
  inboxes: Inbox[];
  messages: Message[];
  subscriptions: Subscription[];
  cryptoTransactions: CryptoTransaction[];
  adminWallets: AdminWallet[];
  siteNotifications: SiteNotification[];
  integrations: Integration[];
  auditLogs: AuditLog[];
  userQuotas: UserQuota[];
  smsMessages: SMSMessage[];
  forwardingLogs: ForwardingLog[];
}
