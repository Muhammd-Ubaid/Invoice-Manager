import React from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Download, 
  Share2, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Edit2,
  Trash2
} from 'lucide-react';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { generateInvoicePDF, shareInvoiceViaWhatsApp } from '../../services/pdfService';
import { formatCurrency } from '../../utils/calculations';
import { Invoice, InvoiceStatus } from '../../types';

export const InvoiceListScreen: React.FC = () => {
  const { 
    invoices, 
    filterStatus, 
    setFilterStatus, 
    searchQuery, 
    setSearchQuery, 
    openCreateModal, 
    openEditModal, 
    openDetailModal,
    openPdfModal,
    deleteInvoice
  } = useInvoiceStore();
  
  const { profile } = useSettingsStore();

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.clientName.toLowerCase().includes(query) ||
      invoice.clientEmail.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Overdue
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Sent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Draft
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 animate-fade-in pb-24 md:pb-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number or client..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-card"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm transition-all shadow-md shadow-brand-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => {
          const isActive = filterStatus === status;
          const count = status === 'all' 
            ? invoices.length 
            : invoices.filter(i => i.status === status).length;

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{status}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                isActive 
                  ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900' 
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Invoices List Grid / Table */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-card">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No invoices found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search or status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 block tracking-tight">
                      {invoice.invoiceNumber}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                      {invoice.clientName}
                    </h4>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>

                {/* Info & Line items count */}
                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
                  <div className="flex justify-between">
                    <span>Issue Date:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{invoice.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{invoice.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Total Amount */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs text-slate-400 font-medium">Grand Total</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(invoice.grandTotal, invoice.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDetailModal(invoice)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors text-center"
                  >
                    View Details
                  </button>
                  
                  <button
                    onClick={() => generateInvoicePDF(invoice, profile || undefined)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => shareInvoiceViaWhatsApp(invoice, profile || undefined)}
                    className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                    title="Share Invoice PDF via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(invoice)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Edit Invoice"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
