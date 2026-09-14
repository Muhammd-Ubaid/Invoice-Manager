import React, { useState, useEffect } from 'react';
import { X, UserPlus, Ruler, Trash2 } from 'lucide-react';
import { useClientStore } from '../../store/useClientStore';
import { TailorMeasurementEditor, defaultTailorMeasurement } from './TailorMeasurementEditor';
import { TailorMeasurement } from '../../types';

export const ClientFormModal: React.FC = () => {
  const { isClientModalOpen, editingClient, closeClientModal, saveClient, deleteClient } = useClientStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState<TailorMeasurement>(defaultTailorMeasurement);

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setEmail(editingClient.email);
      setPhone(editingClient.phone);
      setAddress(editingClient.address);
      if (editingClient.measurements) {
        setMeasurements(editingClient.measurements);
        setShowMeasurements(true);
      } else {
        setMeasurements(defaultTailorMeasurement);
        setShowMeasurements(false);
      }
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setMeasurements(defaultTailorMeasurement);
      setShowMeasurements(false);
    }
  }, [editingClient, isClientModalOpen]);

  if (!isClientModalOpen) return null;

  const handleDeleteClient = async () => {
    if (!editingClient) return;
    if (window.confirm(`Are you sure you want to delete client "${editingClient.name}"?`)) {
      await deleteClient(editingClient.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveClient({
      id: editingClient?.id,
      name,
      companyName: '',
      email,
      phone,
      address,
      notes: '',
      measurements: showMeasurements ? measurements : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>{editingClient ? 'Edit Client Profile' : 'Add New Client Profile'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Store client contacts & custom tailoring fitting measurements
            </p>
          </div>

          <button
            onClick={closeClientModal}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Muhammad Ubaid"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp / Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 03363064720"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Delivery / Billing Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Yaseenabad FB Area Block 8, Karachi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          {/* Toggle Tailoring Measurement Section */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowMeasurements(!showMeasurements)}
              className="flex items-center gap-2 w-full p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold transition-all hover:bg-brand-100 dark:hover:bg-brand-900/40"
            >
              <Ruler className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>{showMeasurements ? '✓ Tailoring Measurements Active' : '+ Add Tailoring Measurements'}</span>
            </button>
          </div>

          {/* Measurement Editor Container */}
          {showMeasurements && (
            <TailorMeasurementEditor
              value={measurements}
              onChange={setMeasurements}
            />
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              {editingClient && (
                <button
                  type="button"
                  onClick={handleDeleteClient}
                  className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Client</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeClientModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-md shadow-brand-600/30 transition-all cursor-pointer"
              >
                Save Client Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

