import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface PricingSettings {
  hourlyPlay: {
    childGuardian: number;
    childOnly: number;
    groupDiscount: number;
  };
  events: {
    basic: number;
    standard: number;
    premium: number;
    deluxe: number;
  };
}

interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  enabled: boolean;
}

interface BusinessInfo {
  name: string;
  nameBn: string;
  phone: string;
  email: string;
  address: string;
  addressBn: string;
  openingTime: string;
  closingTime: string;
  website: string;
}

interface NotificationSettings {
  emailBooking: boolean;
  smsBooking: boolean;
  emailPayment: boolean;
  smsPayment: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
}

// Default values
const defaultPricing: PricingSettings = {
  hourlyPlay: {
    childGuardian: 300,
    childOnly: 250,
    groupDiscount: 10
  },
  events: {
    basic: 5000,
    standard: 8000,
    premium: 12000,
    deluxe: 18000
  }
};

const defaultTimeSlots: TimeSlot[] = [
  { id: '1', label: '10:00 AM - 11:00 AM', start: '10:00', end: '11:00', enabled: true },
  { id: '2', label: '11:00 AM - 12:00 PM', start: '11:00', end: '12:00', enabled: true },
  { id: '3', label: '12:00 PM - 1:00 PM', start: '12:00', end: '13:00', enabled: true },
  { id: '4', label: '1:00 PM - 2:00 PM', start: '13:00', end: '14:00', enabled: true },
  { id: '5', label: '2:00 PM - 3:00 PM', start: '14:00', end: '15:00', enabled: true },
  { id: '6', label: '3:00 PM - 4:00 PM', start: '15:00', end: '16:00', enabled: true },
  { id: '7', label: '4:00 PM - 5:00 PM', start: '16:00', end: '17:00', enabled: true },
  { id: '8', label: '5:00 PM - 6:00 PM', start: '17:00', end: '18:00', enabled: true },
  { id: '9', label: '6:00 PM - 7:00 PM', start: '18:00', end: '19:00', enabled: true },
  { id: '10', label: '7:00 PM - 8:00 PM', start: '19:00', end: '20:00', enabled: true },
  { id: '11', label: '8:00 PM - 9:00 PM', start: '20:00', end: '21:00', enabled: true },
];

const defaultBusinessInfo: BusinessInfo = {
  name: 'Baby World Indoor Playground',
  nameBn: 'বেবি ওয়ার্ল্ড ইনডোর প্লেগ্রাউন্ড',
  phone: '+880 1234-567890',
  email: 'info@babyworld.com',
  address: 'Dhaka, Bangladesh',
  addressBn: 'ঢাকা, বাংলাদেশ',
  openingTime: '10:00',
  closingTime: '21:00',
  website: 'https://babyworld.lovable.app'
};

const defaultNotifications: NotificationSettings = {
  emailBooking: true,
  smsBooking: true,
  emailPayment: true,
  smsPayment: false,
  whatsappEnabled: false,
  smsEnabled: true
};

export function useSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState<PricingSettings>(defaultPricing);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(defaultTimeSlots);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);

  // Load all settings from database
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      if (data) {
        data.forEach((setting) => {
          const value = setting.value as Record<string, unknown>;
          switch (setting.key) {
            case 'pricing_hourly':
              if (value) {
                setPricing(prev => ({
                  ...prev,
                  hourlyPlay: {
                    childGuardian: (value.child_guardian as number) || prev.hourlyPlay.childGuardian,
                    childOnly: (value.child_only as number) || prev.hourlyPlay.childOnly,
                    groupDiscount: (value.group_discount as number) || prev.hourlyPlay.groupDiscount
                  }
                }));
              }
              break;
            case 'pricing_events':
              if (value) {
                setPricing(prev => ({
                  ...prev,
                  events: {
                    basic: (value.basic as number) || prev.events.basic,
                    standard: (value.standard as number) || prev.events.standard,
                    premium: (value.premium as number) || prev.events.premium,
                    deluxe: (value.deluxe as number) || prev.events.deluxe
                  }
                }));
              }
              break;
            case 'time_slots':
              if (Array.isArray(value)) {
                const loadedSlots = (value as Array<Record<string, unknown>>).map((slot, idx) => ({
                  id: (slot.id as string) || String(idx + 1),
                  label: `${slot.start} - ${slot.end}`,
                  start: (slot.start as string) || '',
                  end: (slot.end as string) || '',
                  enabled: slot.enabled !== false
                }));
                if (loadedSlots.length > 0) setTimeSlots(loadedSlots);
              }
              break;
            case 'business_info':
              if (value) {
                setBusinessInfo(prev => ({
                  ...prev,
                  name: (value.name as string) || prev.name,
                  nameBn: (value.nameBn as string) || prev.nameBn,
                  phone: (value.phone as string) || prev.phone,
                  email: (value.email as string) || prev.email,
                  address: (value.address as string) || prev.address,
                  addressBn: (value.addressBn as string) || prev.addressBn,
                  openingTime: (value.openTime as string) || (value.openingTime as string) || prev.openingTime,
                  closingTime: (value.closeTime as string) || (value.closingTime as string) || prev.closingTime,
                  website: (value.website as string) || prev.website
                }));
              }
              break;
            case 'notifications':
              if (value) {
                setNotifications(prev => ({
                  ...prev,
                  emailBooking: value.emailBooking !== false,
                  smsBooking: value.smsBooking !== false,
                  emailPayment: value.emailPayment !== false,
                  smsPayment: value.smsPayment === true,
                  whatsappEnabled: value.whatsappEnabled === true,
                  smsEnabled: value.smsEnabled !== false
                }));
              }
              break;
            case 'notification_channels':
              if (value) {
                setNotifications(prev => ({
                  ...prev,
                  smsEnabled: value.sms !== false,
                  whatsappEnabled: value.whatsapp === true
                }));
              }
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: unknown, category: string) => {
    // First check if the setting exists
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('key', key)
      .maybeSingle();

    let error;
    if (existing) {
      // Update existing
      const result = await supabase
        .from('settings')
        .update({ value: value as Json, category })
        .eq('key', key);
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('settings')
        .insert([{ key, value: value as Json, category }]);
      error = result.error;
    }
    
    if (error) throw error;
  };

  const savePricing = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('pricing_hourly', {
          child_guardian: pricing.hourlyPlay.childGuardian,
          child_only: pricing.hourlyPlay.childOnly,
          group_discount: pricing.hourlyPlay.groupDiscount
        }, 'pricing'),
        saveSetting('pricing_events', {
          basic: pricing.events.basic,
          standard: pricing.events.standard,
          premium: pricing.events.premium,
          deluxe: pricing.events.deluxe
        }, 'pricing')
      ]);
      return true;
    } catch (error) {
      console.error('Error saving pricing:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const saveTimeSlots = async () => {
    setSaving(true);
    try {
      await saveSetting('time_slots', timeSlots.map(slot => ({
        id: slot.id,
        start: slot.start,
        end: slot.end,
        enabled: slot.enabled
      })), 'schedule');
      return true;
    } catch (error) {
      console.error('Error saving time slots:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const saveBusinessInfo = async () => {
    setSaving(true);
    try {
      await saveSetting('business_info', {
        name: businessInfo.name,
        nameBn: businessInfo.nameBn,
        phone: businessInfo.phone,
        email: businessInfo.email,
        address: businessInfo.address,
        addressBn: businessInfo.addressBn,
        openingTime: businessInfo.openingTime,
        closingTime: businessInfo.closingTime,
        website: businessInfo.website
      }, 'business');
      return true;
    } catch (error) {
      console.error('Error saving business info:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('notifications', {
          emailBooking: notifications.emailBooking,
          smsBooking: notifications.smsBooking,
          emailPayment: notifications.emailPayment,
          smsPayment: notifications.smsPayment,
          whatsappEnabled: notifications.whatsappEnabled,
          smsEnabled: notifications.smsEnabled
        }, 'general'),
        saveSetting('notification_channels', {
          sms: notifications.smsEnabled,
          whatsapp: notifications.whatsappEnabled
        }, 'notifications')
      ]);
      return true;
    } catch (error) {
      console.error('Error saving notifications:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const toggleTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, enabled: !slot.enabled } : slot
    ));
  };

  return {
    loading,
    saving,
    pricing,
    setPricing,
    timeSlots,
    setTimeSlots,
    toggleTimeSlot,
    businessInfo,
    setBusinessInfo,
    notifications,
    setNotifications,
    savePricing,
    saveTimeSlots,
    saveBusinessInfo,
    saveNotifications,
    loadSettings
  };
}
