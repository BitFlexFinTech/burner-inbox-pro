// Mock email forwarding service for demo/testing

import { db } from '@/lib/mockDatabase';
import type { Message, ForwardingLog } from '@/types/database';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockForwardingService = {
  async forwardEmail(
    message: Message, 
    toEmail: string, 
    inboxId: string
  ): Promise<{ success: boolean; logId: string }> {
    await delay(1000);
    
    console.log('[MockForwarding] Forwarding email:', message.subject, 'to:', toEmail);
    
    // Add forwarding log
    const log: Omit<ForwardingLog, 'id' | 'createdAt'> = {
      inboxId,
      messageId: message.id,
      forwardedTo: toEmail,
      status: 'success',
    };
    
    db.addForwardingLog(log);
    
    // Add audit log
    db.addAuditLog({
      action: 'email_forwarded',
      entityType: 'message',
      entityId: message.id,
      metadata: { toEmail, subject: message.subject },
    });
    
    return { 
      success: true,
      logId: `fwd_${Date.now()}`,
    };
  },

  async setupForwarding(
    inboxId: string, 
    email: string
  ): Promise<boolean> {
    await delay(500);
    
    db.updateInbox(inboxId, { 
      forwardingEnabled: true, 
      forwardingEmail: email 
    });
    
    db.addAuditLog({
      action: 'forwarding_enabled',
      entityType: 'inbox',
      entityId: inboxId,
      metadata: { forwardingEmail: email },
    });
    
    console.log('[MockForwarding] Forwarding enabled for inbox:', inboxId, 'to:', email);
    
    return true;
  },

  async disableForwarding(inboxId: string): Promise<boolean> {
    await delay(500);
    
    db.updateInbox(inboxId, { 
      forwardingEnabled: false, 
      forwardingEmail: undefined 
    });
    
    db.addAuditLog({
      action: 'forwarding_disabled',
      entityType: 'inbox',
      entityId: inboxId,
      metadata: {},
    });
    
    console.log('[MockForwarding] Forwarding disabled for inbox:', inboxId);
    
    return true;
  },

  async getForwardingLogs(inboxId: string): Promise<ForwardingLog[]> {
    await delay(300);
    return db.getForwardingLogs(inboxId);
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};
