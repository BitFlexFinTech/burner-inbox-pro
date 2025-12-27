// Database types for localStorage-based backend

export type PlanType = 'free' | 'premium' | 'enterprise';
export type UserRoleType = 'user' | 'admin';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
export type NotificationType = 'banner' | 'toast' | 'modal';
export type TargetAudience = 'all' | 'free' | 'premium' | 'enterprise';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

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
  settings: Record<string, any>;
}

export interface AuditLog {
  id: string;
  userId?: string;
  adminId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any>;
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

// Database state type
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
}
