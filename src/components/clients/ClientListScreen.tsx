import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Edit2, 
  Trash2,
  DollarSign,
  Building2,
  X,
  Ruler
} from 'lucide-react';
import { useClientStore } from '../../store/useClientStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/calculations';
import { Client } from '../../types';
import { TailorMeasurementView } from './TailorMeasurementView';

const HighlightText: React.FC<{ text?: string; query: string }> = ({ text, query }) => {
  if (!text) return null;
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 text-slate-900 dark:text-white rounded px-0.5 font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export const ClientListScreen: React.FC = () => {
  const { clients, openCreateClientModal, openEditClientModal, deleteClient } = useClientStore();
  const { invoices, openDetailModal } = useInvoiceStore();
  const { profile } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);
  const [selectedClientForMeasurements, setSelectedClientForMeasurements] = useState<Client | null>(null);

  const filteredClients = clients.filter((client) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const cleanQueryPhone = query.replace(/[\s\-\+\(\)]/g, '');

    const nameMatch = (client.name || '').toLowerCase().includes(query);
    const companyMatch = (client.companyName || '').toLowerCase().includes(query);
    const emailMatch = (client.email || '').toLowerCase().includes(query);
    const addressMatch = (client.address || '').toLowerCase().includes(query);

    const rawPhone = (client.phone || '').toLowerCase();
    const cleanPhone = rawPhone.replace(/[\s\-\+\(\)]/g, '');
    const phoneMatch = rawPhone.includes(query) || (cleanQueryPhone.length > 0 && cleanPhone.includes(cleanQueryPhone));

    return nameMatch || companyMatch || emailMatch || addressMatch || phoneMatch;
  });

  const getClientMetrics = (clientId: string) => {
    const clientInvoices = invoices.filter((i) => i.clientId === clientId);
    const totalBilled = clientInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const totalPaid = clientInvoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.grandTotal, 0);
    
    return {
      count: clientInvoices.length,
      totalBilled,
      totalPaid,
      invoices: clientInvoices
    };
  };

  const handleDeleteClient = (client: Client) => {
    if (window.confirm(`Are you sure you want to delete client "${client.name}"? This action cannot be undone.`)) {
      deleteClient(client.id);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 animate-fade-in pb-24 md:pb-6">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name, phone, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-card"
          />
        </div>

        <button
          onClick={openCreateClientModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm transition-all shadow-md shadow-brand-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client Profile</span>
        </button>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-card">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No clients found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add client profiles to quickly create invoices and store tailoring fitting measurements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const metrics = getClientMetrics(client.id);

            return (
              <div
                key={client.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-extrabold text-sm flex items-center justify-center border border-brand-200/50 dark:border-brand-800/40">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                          <HighlightText text={client.name} query={searchQuery} />
                        </h3>
                        {client.companyName && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <HighlightText text={client.companyName} query={searchQuery} />
                          </p>
                        )}
                      </div>
                    </div>

                    {client.measurements && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Ruler className="w-3 h-3" />
                        <span>Fitted</span>
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          <HighlightText text={client.phone} query={searchQuery} />
                        </span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <HighlightText text={client.email} query={searchQuery} />
                        </span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <HighlightText text={client.address} query={searchQuery} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics & Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Invoices</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {metrics.count}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Billed</span>
                      <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 font-mono">
                        {formatCurrency(metrics.totalBilled, metrics.invoices[0]?.currency || profile?.defaultCurrency || 'PKR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedClientForHistory(client)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      History ({metrics.count})
                    </button>

                    <button
                      onClick={() => setSelectedClientForMeasurements(client)}
                      className="p-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="View Tailoring Measurements"
                    >
                      <Ruler className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openEditClientModal(client)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Edit Client"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteClient(client)}
                      className="p-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Delete Client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Measurements Sub-Modal */}
      {selectedClientForMeasurements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Tailoring Measurements: {selectedClientForMeasurements.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedClientForMeasurements.phone || selectedClientForMeasurements.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientForMeasurements(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TailorMeasurementView measurements={selectedClientForMeasurements.measurements} />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  const client = selectedClientForMeasurements;
                  setSelectedClientForMeasurements(null);
                  openEditClientModal(client);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md"
              >
                Edit Measurements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client History Sub-Modal */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Invoice History: {selectedClientForHistory.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedClientForHistory.phone || selectedClientForHistory.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientForHistory(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {getClientMetrics(selectedClientForHistory.id).invoices.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">No invoices issued for this client yet.</p>
              ) : (
                getClientMetrics(selectedClientForHistory.id).invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedClientForHistory(null);
                      openDetailModal(inv);
                    }}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{inv.invoiceNumber}</span>
                      <p className="text-[11px] text-slate-500">Issued: {inv.issueDate} • Due: {inv.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 block font-mono">
                        {formatCurrency(inv.grandTotal, inv.currency)}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{inv.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

