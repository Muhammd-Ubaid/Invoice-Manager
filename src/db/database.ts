import Dexie, { Table } from 'dexie';
import { Invoice, Client, BusinessProfile, PaymentRecord } from '../types';

export class InvoiceDatabase extends Dexie {
  invoices!: Table<Invoice, string>;
  clients!: Table<Client, string>;
  businessProfile!: Table<BusinessProfile, string>;
  payments!: Table<PaymentRecord, string>;

  constructor() {
    super('InvoiceManagerDB');
    
    this.version(1).stores({
      invoices: 'id, invoiceNumber, clientId, status, dueDate, issueDate, createdAt',
      clients: 'id, name, companyName, email, createdAt',
      businessProfile: 'id',
      payments: 'id, invoiceId, paymentDate'
    });
  }
}

export const db = new InvoiceDatabase();
