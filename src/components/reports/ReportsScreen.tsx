import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Users, Award, ShieldCheck, DollarSign, Globe } from 'lucide-react';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { useClientStore } from '../../store/useClientStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency, CURRENCY_SYMBOLS } from '../../utils/calculations';

export const ReportsScreen: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const { clients } = useClientStore();
  const { profile } = useSettingsStore();

  const defaultCurr = profile?.defaultCurrency || 'PKR';
  const availableCurrencies = Array.from(
    new Set([defaultCurr, ...invoices.map((i) => i.currency || 'PKR')])
  );

  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurr);

  useEffect(() => {
    if (profile?.defaultCurrency) {
      setSelectedCurrency(profile.defaultCurrency);
    } else if (invoices.length > 0) {
      setSelectedCurrency(invoices[0].currency || 'PKR');
    }
  }, [profile, invoices]);

  // Filter invoices matching active currency selector
  const currencyInvoices = invoices.filter((i) => (i.currency || 'PKR') === selectedCurrency);

  const totalInvoiced = currencyInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalPaid = currencyInvoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.grandTotal, 0);
  const totalUnpaid = currencyInvoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((acc, i) => acc + i.balanceDue, 0);

  const paidCount = currencyInvoices.filter((i) => i.status === 'paid').length;
  const overdueCount = currencyInvoices.filter((i) => i.status === 'overdue').length;
  const sentCount = currencyInvoices.filter((i) => i.status === 'sent').length;
  const draftCount = currencyInvoices.filter((i) => i.status === 'draft').length;

  // Aggregate top revenue clients with their exact invoice currency
  const clientRevenueMap: { [key: string]: { name: string; amount: number; currency: string } } = {};
  invoices.forEach((inv) => {
    const invCurr = inv.currency || 'PKR';
    const key = `${inv.clientName}-${invCurr}`;
    if (!clientRevenueMap[key]) {
      clientRevenueMap[key] = { name: inv.clientName, amount: 0, currency: invCurr };
    }
    clientRevenueMap[key].amount += inv.grandTotal;
  });

  const topClients = Object.values(clientRevenueMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in pb-24 md:pb-6">
      {/* Header & Currency Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Reports & Financial Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filter metrics for <span className="font-extrabold text-brand-600 dark:text-brand-400">{selectedCurrency}</span> ({CURRENCY_SYMBOLS[selectedCurrency] || '$'})
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
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105'
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

      {/* Top Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Revenue Collected</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {formatCurrency(totalPaid, selectedCurrency)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Paid in full across {paidCount} invoice(s)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Outstanding Receivables</span>
          <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 font-mono">
            {formatCurrency(totalUnpaid, selectedCurrency)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{overdueCount} overdue, {sentCount} awaiting payment</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Average Invoice Value</span>
          <h3 className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-2 font-mono">
            {formatCurrency(currencyInvoices.length > 0 ? totalInvoiced / currencyInvoices.length : 0, selectedCurrency)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Based on {currencyInvoices.length} {selectedCurrency} invoice(s)</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <PieChart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Invoice Status Distribution ({selectedCurrency})</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 dark:text-emerald-400">Paid ({paidCount})</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {currencyInvoices.length > 0 ? Math.round((paidCount / currencyInvoices.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${currencyInvoices.length > 0 ? (paidCount / currencyInvoices.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-700 dark:text-blue-400">Sent / Pending ({sentCount})</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {currencyInvoices.length > 0 ? Math.round((sentCount / currencyInvoices.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${currencyInvoices.length > 0 ? (sentCount / currencyInvoices.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700 dark:text-rose-400">Overdue ({overdueCount})</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {currencyInvoices.length > 0 ? Math.round((overdueCount / currencyInvoices.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${currencyInvoices.length > 0 ? (overdueCount / currencyInvoices.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600 dark:text-slate-400">Draft ({draftCount})</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {currencyInvoices.length > 0 ? Math.round((draftCount / currencyInvoices.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-slate-400 rounded-full transition-all duration-500" 
                  style={{ width: `${currencyInvoices.length > 0 ? (draftCount / currencyInvoices.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Clients Ranking */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Revenue Clients</h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topClients.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">No client revenue recorded yet.</p>
            ) : (
              topClients.map((client, idx) => (
                <div key={`${client.name}-${client.currency}`} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {client.name}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 font-mono">
                    {formatCurrency(client.amount, client.currency)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
