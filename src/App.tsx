import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { InvoiceListScreen } from './components/invoices/InvoiceListScreen';
import { ClientListScreen } from './components/clients/ClientListScreen';
import { ReportsScreen } from './components/reports/ReportsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { InvoiceFormModal } from './components/invoices/InvoiceFormModal';
import { InvoiceDetailModal } from './components/invoices/InvoiceDetailModal';
import { PdfPreviewModal } from './components/invoices/PdfPreviewModal';
import { ClientFormModal } from './components/clients/ClientFormModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';

import { useInvoiceStore } from './store/useInvoiceStore';
import { useClientStore } from './store/useClientStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useAuthStore } from './store/useAuthStore';
import { initializeSeedData, clearAllData } from './db/seed';
import { checkOverdueInvoicesAndNotify, requestNotificationPermissions } from './services/notificationService';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  const { loadInvoices, invoices } = useInvoiceStore();
  const { loadClients } = useClientStore();
  const { loadProfile } = useSettingsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Safety fallback: ensure loading screen disappears within 1.5s max
    const timer = setTimeout(() => {
      if (mounted) setIsInitializing(false);
    }, 1500);

    const init = async () => {
      try {
        await initializeSeedData();
        await Promise.all([
          loadInvoices(),
          loadClients(),
          loadProfile(),
        ]);
        // Trigger notification request in background without blocking init
        requestNotificationPermissions().catch(() => {});
      } catch (err) {
        console.error('Failed to initialize database:', err);
      } finally {
        if (mounted) {
          clearTimeout(timer);
          setIsInitializing(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isInitializing && invoices.length > 0) {
      checkOverdueInvoicesAndNotify(invoices);
    }
  }, [isInitializing, invoices]);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 animate-bounce flex items-center justify-center font-bold text-xl mb-4 shadow-lg shadow-brand-500/50">
          INV
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">Loading Invoice Manager...</p>
      </div>
    );
  }

  // If user is not authenticated, show dedicated full-screen Login & Sign Up page
  if (!user || !user.isLoggedIn) {
    return <AuthPage onSuccessLogin={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header activeTab={activeTab} />

      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardScreen onNavigate={setActiveTab} />}
          {activeTab === 'invoices' && <InvoiceListScreen />}
          {activeTab === 'clients' && <ClientListScreen />}
          {activeTab === 'reports' && <ReportsScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* Global Modals */}
      <InvoiceFormModal />
      <InvoiceDetailModal />
      <ClientFormModal />
      <AuthModal />
    </div>
  );
}

export default App;
