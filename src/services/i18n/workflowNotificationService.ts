// Mock workflow notification service for translation workflow

import type { WorkflowStatus } from '@/i18n/types';

export interface WorkflowNotification {
  id: string;
  type: 'submission_received' | 'review_started' | 'translation_approved' | 'translation_rejected' | 
        'changes_requested' | 'translation_published' | 'reviewer_assigned' | 'deadline_reminder';
  recipientEmail: string;
  recipientName: string;
  translationKey: string;
  languageCode: string;
  previousStatus?: WorkflowStatus;
  newStatus: WorkflowStatus;
  message?: string;
  reviewerName?: string;
  sentAt: string;
}

// Store notifications in memory (mock)
const notifications: WorkflowNotification[] = [];

// Email templates
const emailTemplates: Record<WorkflowNotification['type'], (data: Partial<WorkflowNotification>) => { subject: string; body: string }> = {
  submission_received: (data) => ({
    subject: `Translation Submitted: ${data.translationKey}`,
    body: `Dear ${data.recipientName},\n\nYour translation submission for "${data.translationKey}" (${data.languageCode}) has been received and is pending review.\n\nThank you for your contribution!\n\nBest regards,\nBurnerMail Translation Team`,
  }),
  
  review_started: (data) => ({
    subject: `Review Started: ${data.translationKey}`,
    body: `Dear ${data.recipientName},\n\nYour translation for "${data.translationKey}" (${data.languageCode}) is now being reviewed by ${data.reviewerName || 'a reviewer'}.\n\nYou will be notified once the review is complete.\n\nBest regards,\nBurnerMail Translation Team`,
  }),
  
  translation_approved: (data) => ({
    subject: `✅ Translation Approved: ${data.translationKey}`,
    body: `Dear ${data.recipientName},\n\nCongratulations! Your translation for "${data.translationKey}" (${data.languageCode}) has been approved!\n\n${data.message || ''}\n\nThank you for your excellent contribution!\n\nBest regards,\nBurnerMail Translation Team`,
  }),
  
  translation_rejected: (data) => ({
    subject: `Translation Needs Revision: ${data.translationKey}`,
    body: `Dear ${data.recipientName},\n\nYour translation for "${data.translationKey}" (${data.languageCode}) requires revision.\n\nFeedback: ${data.message || 'Please review and resubmit.'}\n\nPlease update your submission when ready.\n\nBest regards,\nBurnerMail Translation Team`,
  }),
  
  changes_requested: (data) => ({
    subject: `Changes Requested: ${data.translationKey}`,
    body: `Dear ${data.recipientName},\n\nSome changes have been requested for your translation of "${data.translationKey}" (${data.languageCode}).\n\nRequested changes: ${data.message || 'Please check the translation panel for details.'}\n\nBest regards,\nBurnerMail Translation Team`,
  }),
  
  translation_published: (data) => ({
    subject: `🎉 Translation Published: ${data.translationKey}`,
    body: `Dear ${data.recipientName},\n\nGreat news! Your translation for "${data.translationKey}" (${data.languageCode}) is now live!\n\nThank you for making BurnerMail accessible to more users.\n\nBest regards,\nBurnerMail Translation Team`,
  }),
  
  reviewer_assigned: (data) => ({
    subject: `New Review Assignment: ${data.translationKey}`,
    body: `Dear ${data.recipientName},\n\nYou have been assigned to review the translation for "${data.translationKey}" (${data.languageCode}).\n\nPlease review at your earliest convenience.\n\nBest regards,\nBurnerMail Translation Team`,
  }),
  
  deadline_reminder: (data) => ({
    subject: `⏰ Reminder: Review Pending for ${data.translationKey}`,
    body: `Dear ${data.recipientName},\n\nThis is a reminder that the translation for "${data.translationKey}" (${data.languageCode}) is awaiting review.\n\nPlease complete the review soon.\n\nBest regards,\nBurnerMail Translation Team`,
  }),
};

export const workflowNotificationService = {
  // Send a workflow notification (mock - just stores in memory)
  async sendNotification(notification: Omit<WorkflowNotification, 'id' | 'sentAt'>): Promise<WorkflowNotification> {
    const template = emailTemplates[notification.type];
    const { subject, body } = template(notification);
    
    const fullNotification: WorkflowNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    
    notifications.push(fullNotification);
    
    // Log the mock email
    console.log(`📧 [MOCK EMAIL] To: ${notification.recipientEmail}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${body.substring(0, 100)}...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return fullNotification;
  },
  
  // Get all notifications for a user
  getNotificationsForUser(email: string): WorkflowNotification[] {
    return notifications.filter(n => n.recipientEmail === email);
  },
  
  // Get notifications for a specific translation
  getNotificationsForTranslation(key: string, languageCode: string): WorkflowNotification[] {
    return notifications.filter(n => n.translationKey === key && n.languageCode === languageCode);
  },
  
  // Get recent notifications
  getRecentNotifications(limit: number = 20): WorkflowNotification[] {
    return [...notifications]
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, limit);
  },
  
  // Clear all notifications (for testing)
  clearAll(): void {
    notifications.length = 0;
  },
  
  // Get notification templates (for preview)
  getTemplate(type: WorkflowNotification['type'], data: Partial<WorkflowNotification>): { subject: string; body: string } {
    return emailTemplates[type](data);
  },
};
