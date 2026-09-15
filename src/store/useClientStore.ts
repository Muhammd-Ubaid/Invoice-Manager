import { create } from 'zustand';
import { db } from '../db/database';
import { Client } from '../types';

interface ClientState {
  clients: Client[];
  isClientModalOpen: boolean;
  editingClient: Client | null;
  selectedClient: Client | null;

  loadClients: () => Promise<void>;
  openCreateClientModal: () => void;
  openEditClientModal: (client: Client) => void;
  closeClientModal: () => void;
  setSelectedClient: (client: Client | null) => void;

  saveClient: (clientData: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  isClientModalOpen: false,
  editingClient: null,
  selectedClient: null,

  loadClients: async () => {
    const clients = await db.clients.toArray();
    set({ clients });
  },

  openCreateClientModal: () => set({ isClientModalOpen: true, editingClient: null }),
  openEditClientModal: (client) => set({ isClientModalOpen: true, editingClient: client }),
  closeClientModal: () => set({ isClientModalOpen: false, editingClient: null }),

  setSelectedClient: (client) => set({ selectedClient: client }),

  saveClient: async (clientData) => {
    const isEdit = !!clientData.id;
    const now = new Date().toISOString();

    const client: Client = {
      id: clientData.id || `cli-${Date.now()}`,
      name: clientData.name || '',
      companyName: clientData.companyName || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      address: clientData.address || '',
      notes: clientData.notes || '',
      measurements: clientData.measurements,
      createdAt: isEdit ? clientData.createdAt || now : now
    };

    if (isEdit) {
      await db.clients.put(client);
    } else {
      await db.clients.add(client);
    }

    await get().loadClients();
    set({ isClientModalOpen: false, editingClient: null });
    return client;
  },

  deleteClient: async (id) => {
    await db.clients.delete(id);
    await get().loadClients();
    set({ isClientModalOpen: false, editingClient: null });
    if (get().selectedClient?.id === id) {
      set({ selectedClient: null });
    }
  }
}));
