// Email forwarding service using Supabase

import { supabase } from '@/integrations/supabase/client';
import type { Message, ForwardingLog } from '@/types/database';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockForwardingService = {
  async forwardEmail(
    message: Message, 
    toEmail: string, 
    inboxId: string
  ): Promise<{ success: boolean; logId: string }> {
    await delay(1000);
    
    console.log('[Forwarding] Forwarding email:', message.subject, 'to:', toEmail);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Add audit log
      const { data: auditLog, error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id || null,
          action: 'email_forwarded',
          entity_type: 'message',
          entity_id: message.id,
          metadata: { 
            toEmail, 
            subject: message.subject,
            inboxId,
          },
        })
        .select('id')
        .single();

      if (auditError) {
        console.error('Failed to log forwarding:', auditError);
      }

      return { 
        success: true,
        logId: auditLog?.id || `fwd_${Date.now()}`,
      };
    } catch (error) {
      console.error('Error forwarding email:', error);
      return {
        success: false,
        logId: '',
      };
    }
  },

  async setupForwarding(
    inboxId: string, 
    email: string
  ): Promise<boolean> {
    await delay(500);
    
    try {
      // Verify user owns this inbox
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Check inbox ownership
      const { data: inbox, error: checkError } = await supabase
        .from('inboxes')
        .select('user_id')
        .eq('id', inboxId)
        .single();

      if (checkError) throw checkError;
      if (inbox.user_id !== user.id) {
        throw new Error('Unauthorized: You do not own this inbox');
      }

      // Validate email
      if (!this.validateEmail(email)) {
        throw new Error('Invalid email address');
      }

      // Update inbox with forwarding settings
      const { error } = await supabase
        .from('inboxes')
        .update({ 
          forwarding_enabled: true, 
          forwarding_email: email 
        })
        .eq('id', inboxId);

      if (error) throw error;

      // Add audit log
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'forwarding_enabled',
          entity_type: 'inbox',
          entity_id: inboxId,
          metadata: { forwardingEmail: email },
        });

      console.log('[Forwarding] Forwarding enabled for inbox:', inboxId, 'to:', email);
      
      return true;
    } catch (error) {
      console.error('Error setting up forwarding:', error);
      throw error;
    }
  },

  async disableForwarding(inboxId: string): Promise<boolean> {
    await delay(500);
    
    try {
      // Verify user owns this inbox
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Check inbox ownership
      const { data: inbox, error: checkError } = await supabase
        .from('inboxes')
        .select('user_id')
        .eq('id', inboxId)
        .single();

      if (checkError) throw checkError;
      if (inbox.user_id !== user.id) {
        throw new Error('Unauthorized: You do not own this inbox');
      }

      const { error } = await supabase
        .from('inboxes')
        .update({ 
          forwarding_enabled: false, 
          forwarding_email: null 
        })
        .eq('id', inboxId);

      if (error) throw error;

      // Add audit log
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'forwarding_disabled',
          entity_type: 'inbox',
          entity_id: inboxId,
          metadata: {},
        });

      console.log('[Forwarding] Forwarding disabled for inbox:', inboxId);
      
      return true;
    } catch (error) {
      console.error('Error disabling forwarding:', error);
      throw error;
    }
  },

  async getForwardingLogs(inboxId: string): Promise<ForwardingLog[]> {
    await delay(300);
    
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, created_at, metadata')
        .eq('action', 'email_forwarded')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Filter to logs for this inbox and transform to ForwardingLog format
      return (data || [])
        .filter((log) => {
          const meta = log.metadata as Record<string, unknown>;
          return meta?.inboxId === inboxId;
        })
        .map((log) => {
          const meta = log.metadata as Record<string, unknown>;
          return {
            id: log.id,
            inboxId: String(meta?.inboxId || ''),
            messageId: String(meta?.messageId || ''),
            forwardedTo: String(meta?.toEmail || ''),
            status: 'success' as const,
            createdAt: log.created_at,
          };
        });
    } catch (error) {
      console.error('Error fetching forwarding logs:', error);
      return [];
    }
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};
