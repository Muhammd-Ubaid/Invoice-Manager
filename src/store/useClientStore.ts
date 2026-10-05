import { create } from 'zustand';
import { db as dexieDb } from '../db/database';
import { db as firebaseDb, auth, doc, setDoc, deleteDoc, collection, getDocs } from '../firebase';
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
    // 1. Try local Dexie DB first
    let localClients = await dexieDb.clients.toArray();
    set({ clients: localClients });

    // 2. Try Firestore if user is authenticated
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const querySnapshot = await getDocs(collection(firebaseDb, 'users', currentUser.uid, 'clients'));
        if (!querySnapshot.empty) {
          const fsClients: Client[] = [];
          querySnapshot.forEach((docSnap) => {
            fsClients.push(docSnap.data() as Client);
          });
          set({ clients: fsClients });
          // Sync back to local Dexie
          await dexieDb.clients.clear();
          await dexieDb.clients.bulkAdd(fsClients);
        }
      } catch (err) {
        console.warn('Firestore load clients note:', err);
      }
    }
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

    // Save locally to Dexie
    if (isEdit) {
      await dexieDb.clients.put(client);
    } else {
      await dexieDb.clients.add(client);
    }

    // Save remotely to Firestore
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(doc(firebaseDb, 'users', currentUser.uid, 'clients', client.id), client);
      } catch (fsErr) {
        console.warn('Firestore save client note:', fsErr);
      }
    }

    await get().loadClients();
    set({ isClientModalOpen: false, editingClient: null });
    return client;
  },

  deleteClient: async (id) => {
    await dexieDb.clients.delete(id);

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await deleteDoc(doc(firebaseDb, 'users', currentUser.uid, 'clients', id));
      } catch (fsErr) {
        console.warn('Firestore delete client note:', fsErr);
      }
    }

    await get().loadClients();
    set({ isClientModalOpen: false, editingClient: null });
    if (get().selectedClient?.id === id) {
      set({ selectedClient: null });
    }
  }
}));
