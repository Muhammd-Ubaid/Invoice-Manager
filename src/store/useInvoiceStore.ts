import { create } from 'zustand';
import { db as dexieDb } from '../db/database';
import { db as firebaseDb, auth, doc, setDoc, deleteDoc, collection, getDocs } from '../firebase';
import { Invoice, InvoiceStatus, PaymentMethod } from '../types';
import { calculateInvoiceTotals, generateInvoiceNumber } from '../utils/calculations';

interface InvoiceState {
  invoices: Invoice[];
  filterStatus: 'all' | InvoiceStatus;
  searchQuery: string;
  selectedInvoice: Invoice | null;
  isFormModalOpen: boolean;
  isDetailModalOpen: boolean;
  isPdfModalOpen: boolean;
  editingInvoice: Invoice | null;
  previewInvoice: Invoice | null;

  loadInvoices: () => Promise<void>;
  setFilterStatus: (status: 'all' | InvoiceStatus) => void;
  setSearchQuery: (query: string) => void;
  openCreateModal: () => void;
  openEditModal: (invoice: Invoice) => void;
  closeFormModal: () => void;
  openDetailModal: (invoice: Invoice) => void;
  closeDetailModal: () => void;
  openPdfModal: (invoice: Invoice) => void;
  closePdfModal: () => void;

  saveInvoice: (invoiceData: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  markAsPaid: (id: string, paymentMethod: PaymentMethod, notes?: string) => Promise<void>;
  updateStatus: (id: string, status: InvoiceStatus) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  filterStatus: 'all',
  searchQuery: '',
  selectedInvoice: null,
  isFormModalOpen: false,
  isDetailModalOpen: false,
  isPdfModalOpen: false,
  editingInvoice: null,
  previewInvoice: null,

  loadInvoices: async () => {
    // 1. Local Dexie load
    let localInvoices = await dexieDb.invoices.toArray();
    set({ invoices: localInvoices });

    // 2. Remote Firestore load if logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const querySnapshot = await getDocs(collection(firebaseDb, 'users', currentUser.uid, 'invoices'));
        if (!querySnapshot.empty) {
          const fsInvoices: Invoice[] = [];
          querySnapshot.forEach((docSnap) => {
            fsInvoices.push(docSnap.data() as Invoice);
          });
          set({ invoices: fsInvoices });
          await dexieDb.invoices.clear();
          await dexieDb.invoices.bulkAdd(fsInvoices);
        }
      } catch (err) {
        console.warn('Firestore load invoices note:', err);
      }
    }
  },

  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  openCreateModal: () => set({ isFormModalOpen: true, editingInvoice: null }),
  openEditModal: (invoice) => set({ isFormModalOpen: true, editingInvoice: invoice }),
  closeFormModal: () => set({ isFormModalOpen: false, editingInvoice: null }),

  openDetailModal: (invoice) => set({ isDetailModalOpen: true, selectedInvoice: invoice }),
  closeDetailModal: () => set({ isDetailModalOpen: false, selectedInvoice: null }),

  openPdfModal: (invoice) => set({ isPdfModalOpen: true, previewInvoice: invoice }),
  closePdfModal: () => set({ isPdfModalOpen: false, previewInvoice: null }),

  saveInvoice: async (invoiceData) => {
    const state = get();
    const isEdit = !!invoiceData.id;
    
    let invoiceNum = invoiceData.invoiceNumber;
    if (!invoiceNum) {
      const lastInvoice = state.invoices[state.invoices.length - 1];
      invoiceNum = generateInvoiceNumber(lastInvoice?.invoiceNumber);
    }

    const lineItems = invoiceData.lineItems || [];
    const totals = calculateInvoiceTotals(
      lineItems,
      invoiceData.discountRate || 0,
      invoiceData.amountPaid || 0
    );

    const now = new Date().toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: invoiceData.id || `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      clientId: invoiceData.clientId || '',
      clientName: invoiceData.clientName || 'Unknown Client',
      clientEmail: invoiceData.clientEmail || '',
      clientAddress: invoiceData.clientAddress || '',
      issueDate: invoiceData.issueDate || now,
      dueDate: invoiceData.dueDate || now,
      status: invoiceData.status || 'draft',
      currency: invoiceData.currency || 'USD',
      lineItems: lineItems,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      discountRate: invoiceData.discountRate || 0,
      discountTotal: totals.discountTotal,
      grandTotal: totals.grandTotal,
      amountPaid: invoiceData.amountPaid || 0,
      balanceDue: totals.balanceDue,
      notes: invoiceData.notes || '',
      terms: invoiceData.terms || '',
      recurringFrequency: invoiceData.recurringFrequency || 'none',
      createdAt: isEdit ? invoiceData.createdAt || now : now,
      updatedAt: now
    };

    if (isEdit) {
      await dexieDb.invoices.put(newInvoice);
    } else {
      await dexieDb.invoices.add(newInvoice);
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(doc(firebaseDb, 'users', currentUser.uid, 'invoices', newInvoice.id), newInvoice);
      } catch (fsErr) {
        console.warn('Firestore save invoice note:', fsErr);
      }
    }

    await get().loadInvoices();
    set({ isFormModalOpen: false, editingInvoice: null });
    
    if (state.selectedInvoice?.id === newInvoice.id) {
      set({ selectedInvoice: newInvoice });
    }

    return newInvoice;
  },

  deleteInvoice: async (id) => {
    await dexieDb.invoices.delete(id);

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await deleteDoc(doc(firebaseDb, 'users', currentUser.uid, 'invoices', id));
      } catch (fsErr) {
        console.warn('Firestore delete invoice note:', fsErr);
      }
    }

    await get().loadInvoices();
    set({ isDetailModalOpen: false, selectedInvoice: null, isFormModalOpen: false, editingInvoice: null });
  },

  markAsPaid: async (id, paymentMethod, notes) => {
    const invoice = await dexieDb.invoices.get(id);
    if (!invoice) return;

    const updated: Invoice = {
      ...invoice,
      status: 'paid',
      amountPaid: invoice.grandTotal,
      balanceDue: 0,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    await dexieDb.invoices.put(updated);
    
    await dexieDb.payments.add({
      id: `pay-${Date.now()}`,
      invoiceId: id,
      amount: invoice.grandTotal,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      notes
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(doc(firebaseDb, 'users', currentUser.uid, 'invoices', id), updated);
      } catch (fsErr) {
        console.warn('Firestore markAsPaid invoice note:', fsErr);
      }
    }

    await get().loadInvoices();
    set({ selectedInvoice: updated });
  },

  updateStatus: async (id, status) => {
    const invoice = await dexieDb.invoices.get(id);
    if (!invoice) return;

    const updated: Invoice = {
      ...invoice,
      status,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    await dexieDb.invoices.put(updated);

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(doc(firebaseDb, 'users', currentUser.uid, 'invoices', id), updated);
      } catch (fsErr) {
        console.warn('Firestore updateStatus invoice note:', fsErr);
      }
    }

    await get().loadInvoices();
    if (get().selectedInvoice?.id === id) {
      set({ selectedInvoice: updated });
    }
  }
}));
