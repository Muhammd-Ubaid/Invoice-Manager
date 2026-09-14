export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'paypal' | 'other';

export type RecurringFrequency = 'none' | 'weekly' | 'monthly' | 'yearly';

export interface SuitsMeasurement {
  shoulder?: string;    // SHOULDER
  sleeves?: string;     // SLEEVES
  length?: string;      // LENGTH
  chest?: string;       // CHEST (box 1)
  chest2?: string;      // CHEST (box 2)
  waist?: string;       // WAIST (box 1)
  waist2?: string;      // WAIST (box 2)
  hips?: string;        // HIPS (box 1)
  hips2?: string;       // HIPS (box 2)
  collar?: string;      // COLLAR
  waistCoat?: string;   // W/C
  crossBack?: string;   // CB
  bicep?: string;       // BI-CEP (box 1)
  bicep2?: string;      // BI-CEP (box 2)
}

export interface ShalwarPantMeasurement {
  length?: string;       // LENGTH
  waist?: string;        // WAIST (box 1)
  waist2?: string;       // WAIST (box 2)
  hips?: string;         // HIPS (box 1)
  hips2?: string;        // HIPS (box 2)
  insideLength?: string; // INSIDE LENGTH
  tight?: string;        // TIGHT
  bottom?: string;       // BOTTOM
  frontFly?: string;     // F. FLY
  backFly?: string;      // B. FLY
  knee?: string;         // KNEE
}

export interface QameezMeasurement {
  qameezLength?: string;
  shoulder?: string;
  chest?: string;
  waist?: string;
  hip?: string;
  sleeveLength?: string;
  armhole?: string;
  neck?: string;
  cuff?: string;
}

export interface ShalwarMeasurement {
  shalwarLength?: string;
  waist?: string;
  hip?: string;
  bottomPaicha?: string;
}

export interface TailorMeasurement {
  unit: 'inch' | 'cm';
  suits: SuitsMeasurement;
  shalwarPant: ShalwarPantMeasurement;
  specialInstructions?: string;
  qameez?: QameezMeasurement;
  shalwar?: ShalwarMeasurement;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // Percentage e.g. 10 for 10%
  amount: number; // (quantity * unitPrice) + tax
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  notes?: string;
  measurements?: TailorMeasurement;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-001
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string; // e.g. "USD", "EUR", "GBP", "INR"
  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  discountRate: number; // Discount percentage e.g. 5 for 5%
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  recurringFrequency: RecurringFrequency;
  createdAt: string;
  updatedAt: string;
  measurements?: TailorMeasurement;
}

export interface BusinessProfile {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  taxId?: string; // VAT / GST / EIN
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  invoiceTerms?: string;
  primaryColor?: string; // Brand accent hex color
}

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName: string;
  password?: string;
  isEmailVerified?: boolean;
  photoURL?: string;
  isLoggedIn: boolean;
}
