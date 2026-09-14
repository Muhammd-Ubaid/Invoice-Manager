import { Invoice } from '../types';

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop/local notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const checkOverdueInvoicesAndNotify = (invoices: Invoice[]) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  const overdueInvoices = invoices.filter(
    (inv) => inv.status === 'sent' && inv.dueDate < today
  );

  if (overdueInvoices.length > 0) {
    new Notification('Overdue Invoice Reminder', {
      body: `You have ${overdueInvoices.length} overdue invoice(s) needing client follow-up.`,
      icon: '/favicon.svg',
    });
  }
};
