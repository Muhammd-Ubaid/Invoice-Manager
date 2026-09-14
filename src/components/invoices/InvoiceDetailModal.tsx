import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Edit2, 
  Building2, 
  CreditCard,
  Send,
  FileCheck
} from 'lucide-react';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { generateInvoicePDF, shareInvoiceViaWhatsApp, generateEmailShareLink } from '../../services/pdfService';
import { formatCurrency } from '../../utils/calculations';
import { PaymentMethod } from '../../types';
import { TailorMeasurementView } from '../clients/TailorMeasurementView';

export const InvoiceDetailModal: React.FC = () => {
  const { 
    isDetailModalOpen, 
    selectedInvoice, 
    closeDetailModal, 
    openEditModal, 
    markAsPaid,
    updateStatus,
    openPdfModal
  } = useInvoiceStore();
  
  const { profile } = useSettingsStore();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [paymentNotes, setPaymentNotes] = useState('');

  if (!isDetailModalOpen || !selectedInvoice) return null;

  const handleMarkAsPaid = async () => {
    await markAsPaid(selectedInvoice.id, paymentMethod, paymentNotes);
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Actions Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              {selectedInvoice.invoiceNumber}
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedInvoice.clientName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateInvoicePDF(selectedInvoice, profile || undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={closeDetailModal}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Preview Document */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-xs">
          {/* Status & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Status:</span>
              <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[11px] ${
                selectedInvoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                selectedInvoice.status === 'overdue' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                selectedInvoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {selectedInvoice.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedInvoice.status !== 'paid' && (
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Paid</span>
                </button>
              )}

              <button
                onClick={() => shareInvoiceViaWhatsApp(selectedInvoice, profile || undefined)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Business & Client Header Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">From</p>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {profile?.companyName || 'Lumina Studio & Co'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {profile?.address || '120 Market Street, San Francisco, CA 94105'}<br />
                {profile?.email || 'alex@luminastudio.dev'} • {profile?.phone || '+1 (555) 019-2831'}
              </p>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">Billed To</p>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {selectedInvoice.clientName}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {selectedInvoice.clientEmail}<br />
                {selectedInvoice.clientAddress || 'No address provided'}
              </p>
            </div>
          </div>

          {/* Dates & Currency Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Issue Date</span>
              <span className="font-semibold text-slate-900 dark:text-white">{selectedInvoice.issueDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Due Date</span>
              <span className="font-semibold text-slate-900 dark:text-white">{selectedInvoice.dueDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Currency</span>
              <span className="font-semibold text-slate-900 dark:text-white">{selectedInvoice.currency}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Recurring</span>
              <span className="font-semibold text-slate-900 dark:text-white capitalize">{selectedInvoice.recurringFrequency}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] font-bold uppercase">
                  <th className="py-2 px-1">Description</th>
                  <th className="py-2 px-1 text-center">Qty</th>
                  <th className="py-2 px-1 text-right">Price</th>
                  <th className="py-2 px-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {selectedInvoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-1 font-medium">{item.description}</td>
                    <td className="py-3 px-1 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-1 text-right font-medium">{formatCurrency(item.unitPrice, selectedInvoice.currency)}</td>
                    <td className="py-3 px-1 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount, selectedInvoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</span>
              </div>
              {selectedInvoice.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount ({selectedInvoice.discountRate}%):</span>
                  <span>-{formatCurrency(selectedInvoice.discountTotal, selectedInvoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="text-brand-600 dark:text-brand-400">{formatCurrency(selectedInvoice.grandTotal, selectedInvoice.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px] pt-1">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedInvoice.amountPaid, selectedInvoice.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white text-xs font-bold">
                <span>Balance Due:</span>
                <span>{formatCurrency(selectedInvoice.balanceDue, selectedInvoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Tailoring Measurements */}
          {selectedInvoice.measurements && (
            <TailorMeasurementView measurements={selectedInvoice.measurements} />
          )}

          {/* Notes & Bank Info */}
          {selectedInvoice.notes && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
              <span className="font-bold block mb-0.5">Notes:</span>
              <p>{selectedInvoice.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeDetailModal();
                openEditModal(selectedInvoice);
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Record Payment Sub-Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Record Payment</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  <option value="bank_transfer">Direct Bank Transfer</option>
                  <option value="credit_card">Credit / Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Transaction Ref #98231"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>

                <button
                  onClick={handleMarkAsPaid}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  Confirm Paid ({formatCurrency(selectedInvoice.grandTotal, selectedInvoice.currency)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
