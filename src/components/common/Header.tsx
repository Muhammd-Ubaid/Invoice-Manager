import React from 'react';
import { 
  FileText, 
  Plus, 
  Sun, 
  Moon, 
  User as UserIcon, 
  Building2, 
  Bell, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { user, openAuthModal, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode, profile } = useSettingsStore();
  const { openCreateModal } = useInvoiceStore();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'invoices': return 'Invoices';
      case 'clients': return 'Clients';
      case 'reports': return 'Reports & Analytics';
      case 'settings': return 'Settings';
      default: return 'Invoice Manager';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Branding / Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
              {getTitle()}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              <span>{profile?.companyName || 'Arzo Tailor'}</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Invoice Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-medium text-xs sm:text-sm transition-all shadow-sm shadow-brand-600/30"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark/Light Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Account / Auth Status */}
          {user?.isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left pr-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                    {user.username ? `@${user.username}` : user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
