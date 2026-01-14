import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, GasCylinder, Invoice, Settings } from '../types';
import { initInvoiceNumberSystem, setCurrentInvoiceNumber } from '../lib/utils';
import { supabase } from '@/lib/supabase';
import { repo } from '@/lib/supabaseRepo';

interface AppContextType {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Client) => void;
  deleteClient: (id: string) => void;
  inventory: GasCylinder[];
  setInventory: (inventory: GasCylinder[]) => void;
  addInventoryItem: (item: GasCylinder) => void;
  updateInventoryItem: (id: string, item: GasCylinder) => void;
  deleteInventoryItem: (id: string) => void;
  resetInventoryToDefault: () => void;
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  selectedInvoices: string[];
  toggleInvoiceSelection: (id: string) => void;
  selectAllInvoices: () => void;
  deselectAllInvoices: () => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  setInvoiceStartNumber: (startNumber: number) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// Default inventory items with fixed IDs for consistency
const defaultInventory: GasCylinder[] = [
  { id: '12kg-id', type: '12KG', totalQuantity: 0, distributedQuantity: 0, remainingQuantity: 0, unitPrice: 0, taxRate: 20 },
  { id: '6kg-id', type: '6KG', totalQuantity: 0, distributedQuantity: 0, remainingQuantity: 0, unitPrice: 0, taxRate: 20 },
  { id: '3kg-id', type: '3KG', totalQuantity: 0, distributedQuantity: 0, remainingQuantity: 0, unitPrice: 0, taxRate: 20 },
  { id: 'bng-12kg-id', type: 'BNG 12 KG', totalQuantity: 0, distributedQuantity: 0, remainingQuantity: 0, unitPrice: 0, taxRate: 20 },
  { id: 'propane-34kg-id', type: 'PROPANE 34 KG', totalQuantity: 0, distributedQuantity: 0, remainingQuantity: 0, unitPrice: 0, taxRate: 20 },
  { id: 'detendeur-id', type: 'DETENDEUR CLIC-ON', totalQuantity: 0, distributedQuantity: 0, remainingQuantity: 0, unitPrice: 0, taxRate: 20 }
];

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [inventory, setInventory] = useState<GasCylinder[]>(defaultInventory);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings>({
    secretCode: 'admin',
    selectedCompany: 'SEBAI AMA',
    companyName: 'SEBAI AMA',
    companyAddress: '38-40 RUE MONTAIGE, BATHA MAARIF',
    companyPhone: '0522991403',
    companyFax: '0522992424',
    companyEmail: 'contact@sebaiama.com',
    taxRate: 20,
    currency: 'MAD',
    invoicePrefix: 'FAC',
    minInvoiceAmount: 1000,
    maxInvoiceAmount: 10000,
    defaultPaymentTerms: 'Net 30',
    companyRegistration: 'RC: 96175',
    companyCNSS: 'CNSS: 6009197',
    companyPatente: 'PATENTE: 34772854',
    companyICE: 'ICE: 000000664000017'
  });

  useEffect(() => {
    const init = async () => {
      initInvoiceNumberSystem();
      console.log('Initializing AppContext with Supabase:', !!supabase);
      if (supabase) {
        console.log('Fetching data from Supabase...');
        const [c, inv, invs, st] = await Promise.all([
          repo.fetchClients(),
          repo.fetchInventory(),
          repo.fetchInvoices(),
          repo.fetchSettings(),
        ]);
        console.log('Fetched inventory from Supabase:', inv?.length || 0);
        if (c && c.length > 0) setClients(c);
        if (inv && inv.length > 0) setInventory(inv);
        if (invs && invs.length > 0) setInvoices(invs);
        if (st) setSettings(st);
        setIsInitialLoadDone(true);
      } else {
        console.log('Supabase not available, using localStorage...');
        const savedClients = localStorage.getItem('clients');
        if (savedClients) setClients(JSON.parse(savedClients));
        const savedInventory = localStorage.getItem('inventory');
        if (savedInventory) setInventory(JSON.parse(savedInventory));
        else setInventory(defaultInventory);
        const savedInvoices = localStorage.getItem('invoices');
        if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        const savedAuth = localStorage.getItem('isAuthenticated');
        if (savedAuth) setIsAuthenticated(JSON.parse(savedAuth));
        setIsInitialLoadDone(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const save = async () => {
      if (!isInitialLoadDone) return;
      if (supabase) {
        await repo.upsertClients(clients);
      } else {
        localStorage.setItem('clients', JSON.stringify(clients));
      }
    };
    save();
  }, [clients, isInitialLoadDone]);

  useEffect(() => {
    const save = async () => {
      if (!isInitialLoadDone) return;
      console.log('Inventory changed, saving to Supabase:', !!supabase);
      if (supabase) {
        console.log('Saving inventory to Supabase:', inventory.length);
        await repo.upsertInventory(inventory);
      } else {
        console.log('Supabase not available, saving inventory to localStorage');
        localStorage.setItem('inventory', JSON.stringify(inventory));
      }
    };
    save();
  }, [inventory, isInitialLoadDone]);

  useEffect(() => {
    const save = async () => {
      if (!isInitialLoadDone) return;
      if (supabase) {
        await repo.syncInvoices(invoices);
      } else {
        localStorage.setItem('invoices', JSON.stringify(invoices));
      }
    };
    save();
  }, [invoices, isInitialLoadDone]);

  useEffect(() => {
    const save = async () => {
      if (!isInitialLoadDone) return;
      if (supabase) {
        await repo.upsertSettings(settings);
      } else {
        localStorage.setItem('settings', JSON.stringify(settings));
      }
    };
    save();
  }, [settings, isInitialLoadDone]);

  useEffect(() => {
    if (!supabase) {
      localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    }
  }, [isAuthenticated]);

  const addClient = (client: Client) => {
    setClients([...clients, client]);
  };

  const updateClient = (id: string, updatedClient: Client) => {
    setClients(clients.map(client => client.id === id ? updatedClient : client));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const addInventoryItem = (item: GasCylinder) => {
    setInventory([...inventory, item]);
  };

  const updateInventoryItem = (id: string, updatedItem: GasCylinder) => {
    setInventory(inventory.map(item => item.id === id ? updatedItem : item));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const resetInventoryToDefault = () => {
    setInventory(defaultInventory);
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
  };

  const updateInvoice = (id: string, updatedInvoice: Invoice) => {
    setInvoices(invoices.map(invoice => invoice.id === id ? updatedInvoice : invoice));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
  };

  const toggleInvoiceSelection = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) 
        ? prev.filter(invoiceId => invoiceId !== id)
        : [...prev, id]
    );
  };

  const selectAllInvoices = () => {
    setSelectedInvoices(invoices.map(invoice => invoice.id));
  };

  const deselectAllInvoices = () => {
    setSelectedInvoices([]);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setInvoiceStartNumber = (startNumber: number) => {
    setCurrentInvoiceNumber(startNumber);
  };

  const login = (username: string, password: string): boolean => {
    if (username === settings.secretCode && password === settings.secretCode) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const value: AppContextType = {
    clients,
    setClients,
    addClient,
    updateClient,
    deleteClient,
    inventory,
    setInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    resetInventoryToDefault,
    invoices,
    setInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    selectedInvoices,
    toggleInvoiceSelection,
    selectAllInvoices,
    deselectAllInvoices,
    settings,
    setSettings,
    updateSettings,
    setInvoiceStartNumber,
    isAuthenticated,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
