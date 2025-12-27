// LocalStorage-based mock database for end-to-end testing

import type { 
  DatabaseState, 
  User, 
  Inbox, 
  Message, 
  PlanConfig,
  SiteNotification,
  CryptoTransaction,
  AdminWallet,
  Integration,
  AuditLog,
  UserQuota,
  SMSMessage,
  UserRoleRecord,
  UserRoleType
} from '@/types/database';

const DB_KEY = 'burnermail_db';
const DB_VERSION = '1.0.0';

// Default plan configurations
const defaultPlanConfigs: PlanConfig[] = [
  {
    id: 'plan_free',
    name: 'free',
    maxEmailsPerDay: 1,
    lifespanMinutes: 5,
    inboxHistory: false,
    adsEnabled: true,
    forwarding: false,
    apiAccess: false,
    smsEnabled: false,
    price: 0,
  },
  {
    id: 'plan_premium',
    name: 'premium',
    maxEmailsPerDay: 999999,
    lifespanMinutes: 1440,
    inboxHistory: true,
    adsEnabled: false,
    forwarding: true,
    apiAccess: true,
    smsEnabled: true,
    price: 5,
  },
  {
    id: 'plan_enterprise',
    name: 'enterprise',
    maxEmailsPerDay: 999999,
    lifespanMinutes: 43200,
    inboxHistory: true,
    adsEnabled: false,
    forwarding: true,
    apiAccess: true,
    smsEnabled: true,
    price: 20,
  },
];

// Default admin wallets
const defaultAdminWallets: AdminWallet[] = [
  {
    id: 'wallet_btc',
    currency: 'BTC',
    network: 'Bitcoin',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    isActive: true,
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wallet_usdt',
    currency: 'USDT',
    network: 'TRC-20',
    address: 'TN9R6DxWoLUVPVcSYwVJ8bYJpn2kGYqXw4',
    isActive: true,
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wallet_eth',
    currency: 'ETH',
    network: 'ERC-20',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5e123',
    isActive: true,
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wallet_zcash',
    currency: 'ZCASH',
    network: 'Zcash',
    address: 't1abc123xyz456',
    isActive: true,
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  },
];

// Default integrations
const defaultIntegrations: Integration[] = [
  { id: 'int_stripe', name: 'Stripe', provider: 'stripe', status: 'disconnected', settings: {} },
  { id: 'int_paypal', name: 'PayPal', provider: 'paypal', status: 'disconnected', settings: {} },
  { id: 'int_resend', name: 'Resend Email', provider: 'resend', status: 'disconnected', settings: {} },
  { id: 'int_datagenit', name: 'DataGenit SMS', provider: 'datagenit', status: 'disconnected', settings: {} },
  { id: 'int_metamask', name: 'MetaMask', provider: 'metamask', status: 'disconnected', settings: {} },
];

// Demo user with admin role
const demoUser: User = {
  id: 'user_demo',
  email: 'demo@burnermail.app',
  displayName: 'Demo User',
  plan: 'premium',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const demoUserRole: UserRoleRecord = {
  id: 'role_demo',
  userId: 'user_demo',
  role: 'admin',
};

// Demo inboxes
const demoInboxes: Inbox[] = [
  {
    id: 'inbox_1',
    userId: 'user_demo',
    emailAddress: 'netflix_test_7x9@burnermail.app',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
  },
  {
    id: 'inbox_2',
    userId: 'user_demo',
    emailAddress: 'spotify_trial_42@burnermail.app',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
  },
  {
    id: 'inbox_3',
    userId: 'user_demo',
    emailAddress: 'github_signup_88@burnermail.app',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: false,
  },
];

// Demo messages
const demoMessages: Message[] = [
  {
    id: 'msg_1',
    inboxId: 'inbox_1',
    fromAddress: 'noreply@netflix.com',
    fromName: 'Netflix',
    subject: 'Verify your email address',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E50914;">Welcome to Netflix!</h1>
        <p>Thank you for signing up. Please verify your email address by entering the code below:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">847291</span>
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
    bodyText: 'Your verification code is: 847291',
    verificationCode: '847291',
    receivedAt: new Date(Date.now() - 120000).toISOString(),
    isRead: false,
  },
  {
    id: 'msg_2',
    inboxId: 'inbox_1',
    fromAddress: 'hello@netflix.com',
    fromName: 'Netflix',
    subject: 'Welcome to Netflix!',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E50914;">You're all set!</h1>
        <p>Your Netflix account is now active. Start exploring thousands of movies and TV shows.</p>
        <a href="#" style="display: inline-block; background: #E50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Start Watching</a>
      </div>
    `,
    bodyText: 'Your Netflix account is now active.',
    verificationCode: null,
    receivedAt: new Date(Date.now() - 300000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg_3',
    inboxId: 'inbox_1',
    fromAddress: 'security@netflix.com',
    fromName: 'Netflix Security',
    subject: 'New sign-in to your account',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New sign-in detected</h1>
        <p>We noticed a new sign-in to your Netflix account:</p>
        <ul>
          <li>Device: Chrome on Windows</li>
          <li>Location: New York, USA</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
      </div>
    `,
    bodyText: 'We noticed a new sign-in to your Netflix account.',
    verificationCode: null,
    receivedAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg_4',
    inboxId: 'inbox_2',
    fromAddress: 'noreply@spotify.com',
    fromName: 'Spotify',
    subject: 'Confirm your email',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1DB954;">Almost there!</h1>
        <p>Use this code to verify your Spotify account:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1DB954;">529304</span>
        </div>
      </div>
    `,
    bodyText: 'Your verification code is: 529304',
    verificationCode: '529304',
    receivedAt: new Date(Date.now() - 5400000).toISOString(),
    isRead: false,
  },
  {
    id: 'msg_5',
    inboxId: 'inbox_3',
    fromAddress: 'noreply@github.com',
    fromName: 'GitHub',
    subject: 'Please verify your email',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Verify your email address</h1>
        <p>Click the button below to verify your GitHub email address.</p>
        <a href="#" style="display: inline-block; background: #238636; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify email address</a>
      </div>
    `,
    bodyText: 'Click the link to verify your GitHub email.',
    verificationCode: null,
    receivedAt: new Date(Date.now() - 10800000).toISOString(),
    isRead: true,
  },
];

// Demo crypto transactions
const demoCryptoTransactions: CryptoTransaction[] = [
  {
    id: 'tx_1',
    userId: 'user_demo',
    currency: 'BTC',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    amount: '0.00012',
    amountUsd: 5.00,
    txHash: 'abc123def456789xyz',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'tx_2',
    userId: 'user_demo',
    currency: 'USDT',
    walletAddress: 'TN9R6DxWoLUVPVcSYwVJ8bYJpn2kGYqXw4',
    amount: '5.00',
    amountUsd: 5.00,
    txHash: 'xyz789uvw012abc',
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

// Demo notifications
const demoNotifications: SiteNotification[] = [
  {
    id: 'notif_1',
    title: 'Welcome to BurnerMail!',
    message: 'Create your first disposable email inbox and start protecting your privacy.',
    type: 'banner',
    targetAudience: 'all',
    isActive: true,
    startDate: new Date().toISOString(),
    createdBy: 'user_demo',
    createdAt: new Date().toISOString(),
  },
];

// Initial database state
const getInitialState = (): DatabaseState => ({
  users: [demoUser],
  userRoles: [demoUserRole],
  planConfigs: defaultPlanConfigs,
  inboxes: demoInboxes,
  messages: demoMessages,
  subscriptions: [],
  cryptoTransactions: demoCryptoTransactions,
  adminWallets: defaultAdminWallets,
  siteNotifications: demoNotifications,
  integrations: defaultIntegrations,
  auditLogs: [],
  userQuotas: [
    {
      id: 'quota_demo',
      userId: 'user_demo',
      emailsCreatedToday: 0,
      lastResetAt: new Date().toISOString(),
    },
  ],
  smsMessages: [],
});

// Database class for localStorage operations
class MockDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === DB_VERSION) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('Failed to load database from localStorage:', e);
    }
    return getInitialState();
  }

  private save(): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify({
        version: DB_VERSION,
        data: this.state,
      }));
    } catch (e) {
      console.error('Failed to save database to localStorage:', e);
    }
  }

  reset(): void {
    this.state = getInitialState();
    this.save();
  }

  // Users
  getUsers(): User[] {
    return this.state.users;
  }

  getUser(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email === email);
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.state.users[idx] = { ...this.state.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.state.users[idx];
    }
    return undefined;
  }

  deleteUser(id: string): boolean {
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.state.users.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // User Roles
  getUserRole(userId: string): UserRoleRecord | undefined {
    return this.state.userRoles.find(r => r.userId === userId);
  }

  isAdmin(userId: string): boolean {
    const role = this.getUserRole(userId);
    return role?.role === 'admin';
  }

  setUserRole(userId: string, role: 'user' | 'admin'): void {
    const existingIdx = this.state.userRoles.findIndex(r => r.userId === userId);
    if (existingIdx !== -1) {
      this.state.userRoles[existingIdx].role = role;
    } else {
      this.state.userRoles.push({
        id: `role_${Date.now()}`,
        userId,
        role,
      });
    }
    this.save();
  }

  // Plan Configs
  getPlanConfigs(): PlanConfig[] {
    return this.state.planConfigs;
  }

  getPlanConfig(name: string): PlanConfig | undefined {
    return this.state.planConfigs.find(p => p.name === name);
  }

  // Inboxes
  getInboxes(userId?: string): Inbox[] {
    if (userId) {
      return this.state.inboxes.filter(i => i.userId === userId);
    }
    return this.state.inboxes;
  }

  getInbox(id: string): Inbox | undefined {
    return this.state.inboxes.find(i => i.id === id);
  }

  createInbox(inbox: Omit<Inbox, 'id' | 'createdAt'>): Inbox {
    const newInbox: Inbox = {
      ...inbox,
      id: `inbox_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.inboxes.unshift(newInbox);
    this.save();
    return newInbox;
  }

  updateInbox(id: string, updates: Partial<Inbox>): Inbox | undefined {
    const idx = this.state.inboxes.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.state.inboxes[idx] = { ...this.state.inboxes[idx], ...updates };
      this.save();
      return this.state.inboxes[idx];
    }
    return undefined;
  }

  deleteInbox(id: string): boolean {
    const idx = this.state.inboxes.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.state.inboxes.splice(idx, 1);
      // Also delete associated messages
      this.state.messages = this.state.messages.filter(m => m.inboxId !== id);
      this.save();
      return true;
    }
    return false;
  }

  // Messages
  getMessages(inboxId?: string): Message[] {
    if (inboxId) {
      return this.state.messages.filter(m => m.inboxId === inboxId);
    }
    return this.state.messages;
  }

  getMessage(id: string): Message | undefined {
    return this.state.messages.find(m => m.id === id);
  }

  createMessage(message: Omit<Message, 'id' | 'receivedAt'>): Message {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}`,
      receivedAt: new Date().toISOString(),
    };
    this.state.messages.unshift(newMessage);
    this.save();
    return newMessage;
  }

  markMessageRead(id: string): void {
    const msg = this.getMessage(id);
    if (msg) {
      msg.isRead = true;
      this.save();
    }
  }

  deleteMessage(id: string): boolean {
    const idx = this.state.messages.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.state.messages.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Crypto Transactions
  getCryptoTransactions(userId?: string): CryptoTransaction[] {
    if (userId) {
      return this.state.cryptoTransactions.filter(t => t.userId === userId);
    }
    return this.state.cryptoTransactions;
  }

  createCryptoTransaction(tx: Omit<CryptoTransaction, 'id' | 'createdAt'>): CryptoTransaction {
    const newTx: CryptoTransaction = {
      ...tx,
      id: `tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.cryptoTransactions.unshift(newTx);
    this.save();
    return newTx;
  }

  updateCryptoTransaction(id: string, updates: Partial<CryptoTransaction>): CryptoTransaction | undefined {
    const idx = this.state.cryptoTransactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.state.cryptoTransactions[idx] = { ...this.state.cryptoTransactions[idx], ...updates };
      this.save();
      return this.state.cryptoTransactions[idx];
    }
    return undefined;
  }

  // Admin Wallets
  getAdminWallets(): AdminWallet[] {
    return this.state.adminWallets;
  }

  updateAdminWallet(id: string, updates: Partial<AdminWallet>): AdminWallet | undefined {
    const idx = this.state.adminWallets.findIndex(w => w.id === id);
    if (idx !== -1) {
      this.state.adminWallets[idx] = { 
        ...this.state.adminWallets[idx], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      this.save();
      return this.state.adminWallets[idx];
    }
    return undefined;
  }

  // Site Notifications
  getSiteNotifications(activeOnly = false): SiteNotification[] {
    if (activeOnly) {
      const now = new Date();
      return this.state.siteNotifications.filter(n => 
        n.isActive && 
        new Date(n.startDate) <= now && 
        (!n.endDate || new Date(n.endDate) >= now)
      );
    }
    return this.state.siteNotifications;
  }

  createSiteNotification(notification: Omit<SiteNotification, 'id' | 'createdAt'>): SiteNotification {
    const newNotif: SiteNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.siteNotifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  updateSiteNotification(id: string, updates: Partial<SiteNotification>): SiteNotification | undefined {
    const idx = this.state.siteNotifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.state.siteNotifications[idx] = { ...this.state.siteNotifications[idx], ...updates };
      this.save();
      return this.state.siteNotifications[idx];
    }
    return undefined;
  }

  deleteSiteNotification(id: string): boolean {
    const idx = this.state.siteNotifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.state.siteNotifications.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Integrations
  getIntegrations(): Integration[] {
    return this.state.integrations;
  }

  updateIntegration(id: string, updates: Partial<Integration>): Integration | undefined {
    const idx = this.state.integrations.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.state.integrations[idx] = { ...this.state.integrations[idx], ...updates };
      this.save();
      return this.state.integrations[idx];
    }
    return undefined;
  }

  // User Quotas
  getUserQuota(userId: string): UserQuota | undefined {
    return this.state.userQuotas.find(q => q.userId === userId);
  }

  incrementUserQuota(userId: string): void {
    const quota = this.getUserQuota(userId);
    if (quota) {
      quota.emailsCreatedToday++;
      this.save();
    } else {
      this.state.userQuotas.push({
        id: `quota_${Date.now()}`,
        userId,
        emailsCreatedToday: 1,
        lastResetAt: new Date().toISOString(),
      });
      this.save();
    }
  }

  resetDailyQuotas(): void {
    this.state.userQuotas.forEach(q => {
      q.emailsCreatedToday = 0;
      q.lastResetAt = new Date().toISOString();
    });
    this.save();
  }

  // Audit Logs
  addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): void {
    this.state.auditLogs.unshift({
      ...log,
      id: `audit_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    this.save();
  }

  getAuditLogs(limit = 100): AuditLog[] {
    return this.state.auditLogs.slice(0, limit);
  }
}

// Export singleton instance
export const db = new MockDatabase();
