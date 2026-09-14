import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Plus, 
  UserPlus, 
  ArrowUpRight, 
  FileText,
  Globe,
  Sparkles,
  BarChart3,
  Download,
  Share2,
  PieChart,
  ShieldCheck,
  Zap,
  Sliders,
  ChevronRight,
  Search,
  Check,
  Send,
  AlertCircle,
  Users,
  Eye,
  BellRing,
  Scissors,
  Ruler
} from 'lucide-react';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { useClientStore } from '../../store/useClientStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { generateInvoicePDF, shareInvoiceViaWhatsApp } from '../../services/pdfService';
import { formatCurrency, CURRENCY_SYMBOLS } from '../../utils/calculations';
import { InvoiceStatus, Invoice } from '../../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { invoices, openCreateModal, openDetailModal, markAsPaid } = useInvoiceStore();
  const { openCreateClientModal, clients } = useClientStore();
  const { profile } = useSettingsStore();

  const defaultCurr = profile?.defaultCurrency || 'PKR';
  const availableCurrencies = Array.from(
    new Set([defaultCurr, ...invoices.map((i) => i.currency || 'PKR')])
  );

  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurr);
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeChartTab, setActiveChartTab] = useState<'trend' | 'distribution' | 'clients'>('trend');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.defaultCurrency) {
      setSelectedCurrency(profile.defaultCurrency);
    } else if (invoices.length > 0) {
      setSelectedCurrency(invoices[0].currency || 'PKR');
    }
  }, [profile, invoices]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter invoices matching currency
  const currencyInvoices = invoices.filter((i) => (i.currency || 'PKR') === selectedCurrency);

  // Currency-wise KPI Calculations
  const totalInvoiced = currencyInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalPaid = currencyInvoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.grandTotal, 0);
  const unpaidOverdue = currencyInvoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((acc, i) => acc + i.balanceDue, 0);
  
  // Current Month Revenue
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const thisMonthRevenue = currencyInvoices
    .filter((i) => i.status === 'paid' && i.updatedAt.startsWith(currentMonthStr))
    .reduce((acc, i) => acc + i.grandTotal, 0);

  // Tailoring specific stats
  const clientsWithMeasurements = clients.filter((c) => !!c.measurements).length;

  // Calculation percentage for progress bar
  const paidPercent = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;
  const unpaidPercent = totalInvoiced > 0 ? Math.round((unpaidOverdue / totalInvoiced) * 100) : 0;

  // Counts by status
  const countAll = currencyInvoices.length;
  const countPaid = currencyInvoices.filter((i) => i.status === 'paid').length;
  const countSent = currencyInvoices.filter((i) => i.status === 'sent').length;
  const countOverdue = currencyInvoices.filter((i) => i.status === 'overdue').length;

  // Pending collection invoice for smart reminder banner
  const pendingInvoice = currencyInvoices.find((i) => i.status === 'sent' || i.status === 'overdue');

  // Filter recent feed with search query
  const filteredInvoicesFeed = currencyInvoices.filter((i) => {
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchesSearch = 
      i.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Top clients breakdown calculation
  const clientBillingMap: { [key: string]: { name: string; total: number; count: number } } = {};
  currencyInvoices.forEach((inv) => {
    if (!clientBillingMap[inv.clientName]) {
      clientBillingMap[inv.clientName] = { name: inv.clientName, total: 0, count: 0 };
    }
    clientBillingMap[inv.clientName].total += inv.grandTotal;
    clientBillingMap[inv.clientName].count += 1;
  });
  const topClients = Object.values(clientBillingMap).sort((a, b) => b.total - a.total).slice(0, 4);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Overdue
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Sent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Draft
          </span>
        );
    }
  };

  const handleQuickMarkPaid = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    await markAsPaid(invoice.id, 'cash', 'Quick collection via dashboard');
    showToast(`Invoice ${invoice.invoiceNumber} marked as PAID!`);
  };

  const handleDownloadPDF = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    showToast(`Generating PDF for ${invoice.invoiceNumber}...`);
    await generateInvoicePDF(invoice, profile || undefined);
  };

  const handleShareWhatsApp = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    showToast(`Opening WhatsApp for ${invoice.invoiceNumber}...`);
    await shareInvoiceViaWhatsApp(invoice, profile || undefined);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in pb-24 md:pb-6 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-600 text-white shadow-2xl border border-white/20 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-xs font-extrabold">{toastMessage}</span>
        </div>
      )}

      {/* Modern Luxury Studio Executive Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 p-6 sm:p-8 text-white shadow-2xl overflow-hidden border border-brand-500/30">
        {/* Decorative Glow Elements */}
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-brand-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-brand-400/30 text-xs font-extrabold text-brand-200 shadow-inner">
              <Scissors className="w-4 h-4 text-brand-300" />
              <span>{profile?.companyName || 'Arzo Tailor Studio'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-300"></span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Studio Executive Hub
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Tailoring Command Center</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
              Manage custom orders, client fittings, instant <span className="text-brand-300 font-bold">{selectedCurrency}</span> billing, and 1-click WhatsApp invoicing.
            </p>

            {/* Quick Tailoring Studio Metrics Ribbon */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-200">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <FileText className="w-3.5 h-3.5 text-brand-300" />
                <span>{currencyInvoices.length} Active Orders</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                <span>{clientsWithMeasurements} Fitted Profiles</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Users className="w-3.5 h-3.5 text-brand-300" />
                <span>{clients.length} Clients</span>
              </div>
            </div>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black text-xs shadow-xl shadow-brand-600/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Create Suit Invoice</span>
            </button>

            <button
              onClick={openCreateClientModal}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 active:scale-95 text-white font-extrabold text-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-brand-300" />
              <span>+ Add Client & Fittings</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer flex items-center justify-center"
              title="Tailoring Analytics & Reports"
            >
              <BarChart3 className="w-4 h-4 text-brand-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tailoring Orders Pipeline Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Studio Order Pipeline Tracker
              </h3>
              <p className="text-[11px] text-slate-400">Click any stage to filter recent orders below</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Show All Orders ({countAll})
            </button>
          </div>
        </div>

        {/* Pipeline Stage Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Stage 1: All Orders */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-brand-600 text-white border-brand-600 shadow-md font-bold'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase block opacity-80">Total Studio Orders</span>
              <span className="text-lg font-black">{countAll} Orders</span>
            </div>
            <FileText className="w-5 h-5 opacity-80" />
          </button>

          {/* Stage 2: Pending / Draft */}
          <button
            onClick={() => setStatusFilter('draft')}
            className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-brand-600 text-white border-brand-600 shadow-md font-bold'
                : 'bg-brand-50/50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 hover:border-brand-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase block opacity-80">Draft / In Progress</span>
              <span className="text-lg font-black">{currencyInvoices.filter(i => i.status === 'draft').length} Orders</span>
            </div>
            <Scissors className="w-5 h-5 opacity-80" />
          </button>

          {/* Stage 3: Sent / Fitting Ready */}
          <button
            onClick={() => setStatusFilter('sent')}
            className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              statusFilter === 'sent'
                ? 'bg-brand-600 text-white border-brand-600 shadow-md font-bold'
                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:border-blue-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase block opacity-80">Sent / Fitting Ready</span>
              <span className="text-lg font-black">{countSent} Orders</span>
            </div>
            <Clock className="w-5 h-5 opacity-80" />
          </button>

          {/* Stage 4: Paid & Delivered */}
          <button
            onClick={() => setStatusFilter('paid')}
            className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-brand-600 text-white border-brand-600 shadow-md font-bold'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase block opacity-80">Completed & Paid</span>
              <span className="text-lg font-black">{countPaid} Orders</span>
            </div>
            <CheckCircle2 className="w-5 h-5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Smart Payment Reminder / Collection Action Banner */}
      {pendingInvoice && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-brand-500/10 via-brand-600/10 to-emerald-500/10 border border-brand-400/30 dark:border-brand-500/30 backdrop-blur-md shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-bounce text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Smart Billing Collection
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 font-bold text-brand-700 dark:text-brand-300">
                  Action Required
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Invoice <span className="font-mono text-brand-600 dark:text-brand-400">{pendingInvoice.invoiceNumber}</span> ({formatCurrency(pendingInvoice.balanceDue, pendingInvoice.currency)}) for <span className="font-extrabold">{pendingInvoice.clientName}</span> is pending payment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={(e) => handleShareWhatsApp(e, pendingInvoice)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Reminder</span>
            </button>

            <button
              onClick={(e) => handleQuickMarkPaid(e, pendingInvoice)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Paid</span>
            </button>
          </div>
        </div>
      )}

      {/* Currency Filter & Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Billing Currency Dashboard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active currency: <span className="font-extrabold text-brand-600 dark:text-brand-400">{selectedCurrency}</span> ({CURRENCY_SYMBOLS[selectedCurrency] || 'Rs'})
            </p>
          </div>
        </div>

        {/* Currency Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {availableCurrencies.map((curr) => {
            const isSelected = selectedCurrency === curr;
            return (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105 font-black'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{curr}</span>
                <span className="opacity-80 font-mono">({CURRENCY_SYMBOLS[curr] || '$'})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Billed</span>
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm group-hover:rotate-12 transition-transform shadow-xs">
                {CURRENCY_SYMBOLS[selectedCurrency] || '$'}
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
              {formatCurrency(totalInvoiced, selectedCurrency)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 flex items-center gap-1">
              <span>{currencyInvoices.length} order invoice(s)</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Total Volume</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-600 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Collected Revenue</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-3">
              {formatCurrency(totalPaid, selectedCurrency)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400">↑ {paidPercent}%</span>
              <span>collection rate</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Collected Ratio</span>
              <span>{paidPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${paidPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Unpaid / Overdue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Unpaid Balance</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-3">
              {formatCurrency(unpaidOverdue, selectedCurrency)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 flex items-center gap-1">
              <span className="text-rose-600 dark:text-rose-400">{unpaidPercent}%</span>
              <span>pending collection</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Pending Ratio</span>
              <span>{unpaidPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all duration-700" style={{ width: `${unpaidPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Tailoring Fitted Profiles */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Tailoring Profiles</span>
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Ruler className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400 tracking-tight mt-3">
              {clientsWithMeasurements} <span className="text-sm font-semibold text-slate-400">/ {clients.length} Clients</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
              Recorded client size profiles
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Fitted Ratio</span>
              <span>{clients.length > 0 ? Math.round((clientsWithMeasurements / clients.length) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-brand-600 h-full rounded-full transition-all duration-700" 
                style={{ width: `${clients.length > 0 ? Math.round((clientsWithMeasurements / clients.length) * 100) : 0}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Analytics & Visual Insights */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>Studio Financial Performance Visuals</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Interactive revenue performance & top client breakdown</p>
          </div>

          {/* Interactive Visual Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveChartTab('trend')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === 'trend'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Collection Breakdown
            </button>

            <button
              onClick={() => setActiveChartTab('distribution')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === 'distribution'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Status Split
            </button>

            <button
              onClick={() => setActiveChartTab('clients')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === 'clients'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Top Clients
            </button>
          </div>
        </div>

        {/* Tab 1: Collection Rate Multi-Segment Bar */}
        {activeChartTab === 'trend' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Paid Revenue Rate</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{paidPercent}%</p>
                <p className="text-xs text-slate-500 mt-1">{formatCurrency(totalPaid, selectedCurrency)} collected</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Pending Collection</span>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{unpaidPercent}%</p>
                <p className="text-xs text-slate-500 mt-1">{formatCurrency(unpaidOverdue, selectedCurrency)} pending</p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50">
                <span className="text-xs font-bold text-brand-800 dark:text-brand-300">Total Billed Volume</span>
                <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">{currencyInvoices.length}</p>
                <p className="text-xs text-slate-500 mt-1">Invoices created</p>
              </div>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Revenue Flow Breakdown</span>
                <span>{formatCurrency(totalInvoiced, selectedCurrency)} Total</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-5 rounded-2xl overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000 flex items-center justify-center text-[10px] font-black text-white" 
                  style={{ width: `${paidPercent}%` }}
                >
                  {paidPercent > 10 && `${paidPercent}% Paid`}
                </div>
                <div 
                  className="bg-rose-500 h-full transition-all duration-1000 flex items-center justify-center text-[10px] font-black text-white" 
                  style={{ width: `${unpaidPercent}%` }}
                >
                  {unpaidPercent > 10 && `${unpaidPercent}% Unpaid`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Status Split Distribution */}
        {activeChartTab === 'distribution' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{countAll}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">All Invoices</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Paid</span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{countPaid}</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">Collected</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Sent</span>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{countSent}</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">Awaiting</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">Overdue</span>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{countOverdue}</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">Past Due</p>
            </div>
          </div>
        )}

        {/* Tab 3: Top Clients Leaderboard */}
        {activeChartTab === 'clients' && (
          <div className="space-y-2 pt-2">
            {topClients.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No client billing data recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topClients.map((c, idx) => (
                  <div key={c.name} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{c.name}</p>
                        <p className="text-[11px] text-slate-400">{c.count} invoice(s)</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-brand-600 dark:text-brand-400 font-mono">
                      {formatCurrency(c.total, selectedCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Studio Quick Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={openCreateModal}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
            <Scissors className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Create Order Invoice</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Quick tailoring bill</p>
        </button>

        <button
          onClick={openCreateClientModal}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
            <Ruler className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Record Fittings</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Client size profiles</p>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
            <PieChart className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Financial Reports</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Analytics & graphs</p>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Studio Branding</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Settings & bank details</p>
        </button>
      </div>

      {/* Recent Invoices Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card p-5 space-y-4">
        {/* Feed Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Recent Invoices & Customer Feed</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest billing transactions & tailoring orders</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => onNavigate('invoices')}
              className="flex items-center gap-1 text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>View All ({invoices.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice or client..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({countAll})
            </button>

            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'paid'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Paid ({countPaid})
            </button>

            <button
              onClick={() => setStatusFilter('sent')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'sent'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sent ({countSent})
            </button>

            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'overdue'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overdue ({countOverdue})
            </button>
          </div>
        </div>

        {/* Invoice Feed List */}
        {filteredInvoicesFeed.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No invoices match current filter</p>
            <button
              onClick={openCreateModal}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Suit Invoice</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredInvoicesFeed.slice(0, 6).map((invoice) => (
              <div
                key={invoice.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-3 rounded-2xl transition-all group"
              >
                <div
                  onClick={() => openDetailModal(invoice)}
                  className="flex items-center gap-3.5 cursor-pointer flex-1"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    {invoice.clientName.slice(0, 2).toUpperCase() || 'AT'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                        {invoice.invoiceNumber}
                      </span>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {invoice.clientName} • Due {invoice.dueDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-slate-900 dark:text-white block font-mono">
                      {formatCurrency(invoice.grandTotal, invoice.currency)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {invoice.lineItems.length} line item(s)
                    </span>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Mark as Paid button if not paid */}
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={(e) => handleQuickMarkPaid(e, invoice)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Quick Mark Paid"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Paid</span>
                      </button>
                    )}

                    {/* Download PDF button */}
                    <button
                      onClick={(e) => handleDownloadPDF(e, invoice)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* WhatsApp Share button */}
                    <button
                      onClick={(e) => handleShareWhatsApp(e, invoice)}
                      className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="Share via WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* View details */}
                    <button
                      onClick={() => openDetailModal(invoice)}
                      className="p-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
