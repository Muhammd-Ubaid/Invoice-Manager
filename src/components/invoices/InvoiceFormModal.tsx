import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Calendar, DollarSign, UserCheck, FileText, AlertTriangle } from 'lucide-react';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { useClientStore } from '../../store/useClientStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { LineItem, InvoiceStatus, RecurringFrequency, TailorMeasurement } from '../../types';
import { calculateInvoiceTotals, formatCurrency, generateInvoiceNumber } from '../../utils/calculations';

export const InvoiceFormModal: React.FC = () => {
  const { isFormModalOpen, editingInvoice, closeFormModal, saveInvoice, deleteInvoice, invoices } = useInvoiceStore();
  const { clients } = useClientStore();
  const { profile } = useSettingsStore();

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('draft');
  const [currency, setCurrency] = useState('USD');
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('none');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [measurements, setMeasurements] = useState<TailorMeasurement | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setErrorMessage(null);

    if (editingInvoice) {
      setInvoiceNumber(editingInvoice.invoiceNumber);
      setClientId(editingInvoice.clientId);
      setClientName(editingInvoice.clientName);
      setClientEmail(editingInvoice.clientEmail);
      setClientAddress(editingInvoice.clientAddress || '');
      setIssueDate(editingInvoice.issueDate);
      setDueDate(editingInvoice.dueDate);
      setStatus(editingInvoice.status);
      setCurrency(editingInvoice.currency);
      setDiscountRate(editingInvoice.discountRate);
      setNotes(editingInvoice.notes || '');
      setTerms(editingInvoice.terms || '');
      setRecurringFrequency(editingInvoice.recurringFrequency || 'none');
      setLineItems(editingInvoice.lineItems);
      setMeasurements(editingInvoice.measurements);
    } else {
      const lastNum = invoices[invoices.length - 1]?.invoiceNumber;
      const initialClient = clients[0];
      setInvoiceNumber(generateInvoiceNumber(lastNum));
      setClientId(initialClient?.id || '');
      setClientName(initialClient?.companyName || initialClient?.name || '');
      setClientEmail(initialClient?.email || '');
      setClientAddress(initialClient?.address || '');
      setMeasurements(initialClient?.measurements);
      setIssueDate(today);
      setDueDate(due);
      setStatus('draft');
      setCurrency(profile?.defaultCurrency || 'PKR');
      setDiscountRate(0);
      setNotes('Thank you for your business!');
      setTerms(profile?.invoiceTerms || 'Payment due within 15 days of invoice date.');
      setRecurringFrequency('none');
      setLineItems([
        {
          id: 'item-1',
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: profile?.defaultTaxRate || 0,
          amount: 0
        }
      ]);
    }
  }, [editingInvoice, isFormModalOpen, clients, profile, invoices]);

  if (!isFormModalOpen) return null;

  const handleClientSelect = (selectedId: string) => {
    const found = clients.find((c) => c.id === selectedId);
    if (found) {
      setClientId(found.id);
      setClientName(found.companyName || found.name);
      setClientEmail(found.email);
      setClientAddress(found.address);
      setMeasurements(found.measurements);
    }
  };

  const validateLineItems = (): boolean => {
    if (lineItems.length === 0) {
      setErrorMessage('Please add at least one line item.');
      return false;
    }

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      if (!item.description.trim()) {
        setErrorMessage(`Please fill up the description for line item #${i + 1} first.`);
        return false;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        setErrorMessage(`Please enter a valid price (greater than 0) for line item #${i + 1} ("${item.description.trim()}").`);
        return false;
      }
      if (!item.quantity || item.quantity <= 0) {
        setErrorMessage(`Please enter a valid quantity for line item #${i + 1}.`);
        return false;
      }
    }

    setErrorMessage(null);
    return true;
  };

  const handleAddLineItem = () => {
    // Check restriction: all current line items must be filled in first
    if (!validateLineItems()) {
      return;
    }

    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        amount: 0
      }
    ]);
    setErrorMessage(null);
  };

  const handleDeleteInvoice = async () => {
    if (!editingInvoice) return;
    if (window.confirm(`Are you sure you want to delete invoice ${editingInvoice.invoiceNumber}?`)) {
      await deleteInvoice(editingInvoice.id);
    }
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setErrorMessage(null);
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        const sub = (updated.quantity || 0) * (updated.unitPrice || 0);
        updated.amount = Number(sub.toFixed(2));
        return updated;
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    setErrorMessage(null);
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totals = calculateInvoiceTotals(lineItems, discountRate, 0);

  const handleSubmit = async (e: React.FormEvent, targetStatus?: InvoiceStatus) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Please select or enter a client name.');
      return;
    }

    if (!validateLineItems()) {
      return;
    }

    await saveInvoice({
      id: editingInvoice?.id,
      invoiceNumber,
      clientId,
      clientName,
      clientEmail,
      clientAddress,
      issueDate,
      dueDate,
      status: targetStatus || status,
      currency,
      lineItems,
      discountRate,
      notes,
      terms,
      recurringFrequency,
      measurements
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fill in client, line items & payment terms
            </p>
          </div>
          <button
            onClick={closeFormModal}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={(e) => handleSubmit(e)} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Client
              </label>
              <select
                value={clientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Select Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
              >
                <option value="PKR">PKR (Rs)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD (CA$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* Client Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Name / Company
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Name"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Email (Optional)
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Dates & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recurring Frequency
              </label>
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value as RecurringFrequency)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="none">One-time (No repeat)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Line Items</h3>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, index) => {
                const isDescEmpty = errorMessage && !item.description.trim();
                const isPriceEmpty = errorMessage && (!item.unitPrice || item.unitPrice <= 0);

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Item description / Service"
                        required
                        value={item.description}
                        onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                          isDescEmpty
                            ? 'border-rose-400 dark:border-rose-500 focus:ring-2 focus:ring-rose-500'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        required
                        value={item.quantity}
                        onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs text-center font-medium"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className={`w-full px-2 py-1.5 rounded-lg border text-xs text-right font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                          isPriceEmpty
                            ? 'border-rose-400 dark:border-rose-500 focus:ring-2 focus:ring-rose-500'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right font-bold text-xs text-slate-900 dark:text-white">
                      {formatCurrency(item.amount, currency)}
                    </div>

                    <div className="col-span-2 sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discount & Totals Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row justify-between gap-4">
            <div className="w-full sm:w-1/2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Terms
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thank you for your business!"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium self-end">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(totals.subtotal, currency)}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount ({discountRate}%):</span>
                  <span>-{formatCurrency(totals.discountTotal, currency)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="text-brand-600 dark:text-brand-400">{formatCurrency(totals.grandTotal, currency)}</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            {editingInvoice && (
              <button
                type="button"
                onClick={handleDeleteInvoice}
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Invoice</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'sent')}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition-all"
            >
              Save & Mark Sent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
