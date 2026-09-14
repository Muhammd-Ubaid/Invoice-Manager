import { db } from './database';
import { Client, Invoice, BusinessProfile } from '../types';

export const SEED_CLIENTS: Client[] = [];

export const SEED_BUSINESS_PROFILE: BusinessProfile = {
  id: 'profile-default',
  companyName: 'Arzo Tailor',
  ownerName: '',
  email: '',
  phone: '',
  address: '',
  taxId: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  routingNumber: '',
  iban: '',
  swift: '',
  defaultCurrency: 'PKR',
  defaultTaxRate: 0,
  invoiceTerms: 'Payment due within 15 days of invoice date.',
  primaryColor: '#026fc7'
};

export const generateSeedInvoices = (): Invoice[] => [];

export const clearAllDummyData = async () => {
  // Clear any legacy seed invoices and clients from previous runs
  const allInvoices = await db.invoices.toArray();
  const dummyIds = ['inv-001', 'inv-002', 'inv-003', 'inv-004', 'inv-005'];
  
  // If dummy seed invoices exist in local IndexedDB, clear them
  const hasDummy = allInvoices.some(inv => dummyIds.includes(inv.id) || inv.clientName === 'Apex Digital Solutions');
  
  if (hasDummy) {
    await db.invoices.clear();
    await db.clients.clear();
    await db.payments.clear();
  }
};

export const initializeSeedData = async () => {
  await clearAllDummyData();

  const profileCount = await db.businessProfile.count();
  if (profileCount === 0) {
    await db.businessProfile.add(SEED_BUSINESS_PROFILE);
  }
};

export const clearAllData = async () => {
  await db.invoices.clear();
  await db.clients.clear();
  await db.payments.clear();
};
