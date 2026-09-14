import { create } from 'zustand';
import { db } from '../db/database';
import { BusinessProfile } from '../types';

interface SettingsState {
  profile: BusinessProfile | null;
  isDarkMode: boolean;
  
  loadProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<BusinessProfile>) => Promise<void>;
  toggleDarkMode: () => void;
  setPrimaryColor: (color: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  profile: null,
  isDarkMode: false,

  loadProfile: async () => {
    const profiles = await db.businessProfile.toArray();
    if (profiles.length > 0) {
      set({ profile: profiles[0] });
    }
  },

  updateProfile: async (profileData) => {
    const current = get().profile;
    const updated: BusinessProfile = {
      id: current?.id || 'profile-default',
      companyName: profileData.companyName || current?.companyName || 'My Business',
      ownerName: profileData.ownerName || current?.ownerName || '',
      email: profileData.email || current?.email || '',
      phone: profileData.phone || current?.phone || '',
      address: profileData.address || current?.address || '',
      logoUrl: profileData.logoUrl || current?.logoUrl || '',
      taxId: profileData.taxId || current?.taxId || '',
      bankName: profileData.bankName || current?.bankName || '',
      accountName: profileData.accountName || current?.accountName || '',
      accountNumber: profileData.accountNumber || current?.accountNumber || '',
      routingNumber: profileData.routingNumber || current?.routingNumber || '',
      iban: profileData.iban || current?.iban || '',
      swift: profileData.swift || current?.swift || '',
      defaultCurrency: profileData.defaultCurrency || current?.defaultCurrency || 'USD',
      defaultTaxRate: profileData.defaultTaxRate !== undefined ? profileData.defaultTaxRate : (current?.defaultTaxRate || 0),
      invoiceTerms: profileData.invoiceTerms || current?.invoiceTerms || '',
      primaryColor: profileData.primaryColor || current?.primaryColor || '#026fc7'
    };

    await db.businessProfile.put(updated);
    set({ profile: updated });
  },

  toggleDarkMode: () => {
    const newDark = !get().isDarkMode;
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDarkMode: newDark });
  },

  setPrimaryColor: (color) => {
    const current = get().profile;
    if (current) {
      get().updateProfile({ primaryColor: color });
    }
  }
}));
