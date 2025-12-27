// Mock DataGenit SMS service for demo/testing

import { db } from '@/lib/mockDatabase';
import type { SMSMessage } from '@/types/database';

interface PhoneNumber {
  number: string;
  country: string;
  carrier: string;
  expiresAt: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a random US phone number
const generatePhoneNumber = (): string => {
  const areaCodes = ['212', '310', '415', '305', '312', '617', '702', '404'];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${prefix}${line}`;
};

export const mockDataGenitService = {
  async provisionPhoneNumber(userId: string): Promise<PhoneNumber> {
    await delay(2000);
    
    return {
      number: generatePhoneNumber(),
      country: 'US',
      carrier: 'DataGenit Virtual',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async releasePhoneNumber(phoneNumber: string): Promise<boolean> {
    await delay(500);
    return true;
  },

  async receiveSMS(inboxId: string): Promise<SMSMessage[]> {
    await delay(800);
    
    // Return demo SMS messages
    return [
      {
        id: `sms_${Date.now()}_1`,
        inboxId,
        phoneNumber: '+12125551234',
        fromNumber: '+18005551234',
        body: 'Your verification code is: 847291. It expires in 10 minutes.',
        receivedAt: new Date(Date.now() - 120000).toISOString(),
        isRead: false,
      },
      {
        id: `sms_${Date.now()}_2`,
        inboxId,
        phoneNumber: '+12125551234',
        fromNumber: '+18885554321',
        body: 'Your one-time password is 529304. Do not share this code.',
        receivedAt: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
      },
    ];
  },

  async forwardSMS(
    phoneNumber: string, 
    toEmail: string
  ): Promise<{ success: boolean; forwardedCount: number }> {
    await delay(1000);
    
    console.log('[MockDataGenit] Forwarding SMS from', phoneNumber, 'to', toEmail);
    
    return {
      success: true,
      forwardedCount: 2,
    };
  },

  async getUsageStats(userId: string): Promise<{
    smsReceived: number;
    smsForwarded: number;
    activeNumbers: number;
    monthlyLimit: number;
  }> {
    await delay(500);
    
    return {
      smsReceived: 24,
      smsForwarded: 18,
      activeNumbers: 1,
      monthlyLimit: 100,
    };
  },

  extractVerificationCode(message: string): string | null {
    // Try to extract 4-8 digit codes
    const patterns = [
      /(?:code|otp|password|pin)[\s:]*(\d{4,8})/i,
      /(\d{4,8})[\s]*(?:is your|is the)/i,
      /\b(\d{6})\b/,
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  },
};
