import { LineItem } from '../types';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  PKR: 'Rs ',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
};

export const calculateLineItemAmount = (quantity: number, unitPrice: number, taxRate: number = 0): number => {
  return Number((quantity * unitPrice).toFixed(2));
};

export interface InvoiceCalculations {
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  balanceDue: number;
}

export const calculateInvoiceTotals = (
  lineItems: LineItem[],
  discountRate: number = 0,
  amountPaid: number = 0
): InvoiceCalculations => {
  let subtotal = 0;

  lineItems.forEach((item) => {
    subtotal += item.quantity * item.unitPrice;
  });

  const discountTotal = subtotal * ((discountRate || 0) / 100);
  const grandTotal = Number((subtotal - discountTotal).toFixed(2));
  const balanceDue = Math.max(0, Number((grandTotal - amountPaid).toFixed(2)));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxTotal: 0,
    discountTotal: Number(discountTotal.toFixed(2)),
    grandTotal,
    balanceDue,
  };
};

export const generateInvoiceNumber = (lastInvoiceNum?: string): string => {
  const currentYear = new Date().getFullYear();
  if (!lastInvoiceNum) {
    return `INV-${currentYear}-001`;
  }
  
  const match = lastInvoiceNum.match(/INV-(\d{4})-(\d+)/);
  if (match) {
    const nextSeq = parseInt(match[2], 10) + 1;
    return `INV-${currentYear}-${String(nextSeq).padStart(3, '0')}`;
  }
  
  return `INV-${currentYear}-${Math.floor(100 + Math.random() * 900)}`;
};
