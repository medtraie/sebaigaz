import { supabase } from './supabase';
import { Client, GasCylinder, Invoice, InvoiceItem, Settings } from '@/types';

type InvoiceRow = {
  id: string;
  number: string;
  date: string;
  client_id: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  companyName: Invoice['companyName'];
};

type InvoiceItemRow = {
  invoice_id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
};

type InventoryRowSnake = {
  id: string;
  type: GasCylinder['type'] | string;
  total_quantity: number;
  distributed_quantity: number;
  remaining_quantity: number;
  unit_price: number;
  tax_rate: number;
};

type InventoryRowCamel = {
  id: string;
  type: GasCylinder['type'] | string;
  totalQuantity: number;
  distributedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  taxRate: number;
};

type InventoryRowLowerCamel = {
  id: string;
  type: GasCylinder['type'] | string;
  totalquantity: number;
  distributedquantity: number;
  remainingquantity: number;
  unitprice: number;
  taxrate: number;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const pickString = (row: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const v = row[key];
    if (typeof v === 'string') return v;
  }
  return null;
};

const pickNumber = (row: Record<string, unknown>, keys: string[]): number => {
  for (const key of keys) {
    if (key in row) return toNumber(row[key]);
  }
  return 0;
};

const rowToGasCylinder = (row: unknown): GasCylinder | null => {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const id = typeof r.id === 'string' ? r.id : null;
  const type = typeof r.type === 'string' ? r.type : null;
  if (!id || !type) return null;

  if ('total_quantity' in r || 'unit_price' in r) {
    return {
      id,
      type: type as GasCylinder['type'],
      totalQuantity: toNumber(r.total_quantity),
      distributedQuantity: toNumber(r.distributed_quantity),
      remainingQuantity: toNumber(r.remaining_quantity),
      unitPrice: toNumber(r.unit_price),
      taxRate: toNumber(r.tax_rate),
    };
  }

  if ('totalQuantity' in r || 'unitPrice' in r) {
    return {
      id,
      type: type as GasCylinder['type'],
      totalQuantity: toNumber(r.totalQuantity),
      distributedQuantity: toNumber(r.distributedQuantity),
      remainingQuantity: toNumber(r.remainingQuantity),
      unitPrice: toNumber(r.unitPrice),
      taxRate: toNumber(r.taxRate),
    };
  }

  if ('totalquantity' in r || 'unitprice' in r) {
    return {
      id,
      type: type as GasCylinder['type'],
      totalQuantity: toNumber(r.totalquantity),
      distributedQuantity: toNumber(r.distributedquantity),
      remainingQuantity: toNumber(r.remainingquantity),
      unitPrice: toNumber(r.unitprice),
      taxRate: toNumber(r.taxrate),
    };
  }

  return null;
};

const toInventoryRowSnake = (item: GasCylinder): InventoryRowSnake => ({
  id: item.id,
  type: item.type,
  total_quantity: item.totalQuantity,
  distributed_quantity: item.distributedQuantity,
  remaining_quantity: item.remainingQuantity,
  unit_price: item.unitPrice,
  tax_rate: item.taxRate,
});

const toInventoryRowCamel = (item: GasCylinder): InventoryRowCamel => ({
  id: item.id,
  type: item.type,
  totalQuantity: item.totalQuantity,
  distributedQuantity: item.distributedQuantity,
  remainingQuantity: item.remainingQuantity,
  unitPrice: item.unitPrice,
  taxRate: item.taxRate,
});

const toInventoryRowLowerCamel = (item: GasCylinder): InventoryRowLowerCamel => ({
  id: item.id,
  type: item.type,
  totalquantity: item.totalQuantity,
  distributedquantity: item.distributedQuantity,
  remainingquantity: item.remainingQuantity,
  unitprice: item.unitPrice,
  taxrate: item.taxRate,
});

// Check if Supabase client is properly initialized
const isSupabaseReady = (): boolean => {
  if (!supabase) {
    console.error('Supabase client not initialized. Please check your environment variables.');
    return false;
  }
  return true;
};

export const repo = {
  async fetchClients(): Promise<Client[]> {
    if (!isSupabaseReady()) return [];
    try {
      const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });
      if (error) {
        console.error('Error fetching clients:', error);
        return [];
      }
      return (data || []) as Client[];
    } catch (err) {
      console.error('Exception fetching clients:', err);
      return [];
    }
  },
  async upsertClients(clients: Client[]): Promise<void> {
    if (!isSupabaseReady() || clients.length === 0) return;
    try {
      const { error } = await supabase.from('clients').upsert(clients, { onConflict: 'id' });
      if (error) {
        console.error('Error upserting clients:', error);
      }
    } catch (err) {
      console.error('Exception upserting clients:', err);
    }
  },
  async deleteClient(id: string): Promise<void> {
    if (!isSupabaseReady()) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        console.error('Error deleting client:', error);
      }
    } catch (err) {
      console.error('Exception deleting client:', err);
    }
  },

  async fetchInventory(): Promise<GasCylinder[]> {
    if (!isSupabaseReady()) return [];
    try {
      const { data, error } = await supabase.from('inventory').select('*').order('type', { ascending: true });
      if (error) {
        console.error('Error fetching inventory:', error);
        // If the table doesn't exist, it's expected behavior until the user runs the SQL script
        console.info('Inventory table may not exist yet. Please run the SQL script from supabase-simple-tables.sql in your Supabase dashboard.');
        return [];
      }
      return ((data || []) as unknown[])
        .map((row) => rowToGasCylinder(row))
        .filter((x): x is GasCylinder => x !== null);
    } catch (err) {
      console.error('Exception fetching inventory:', err);
      return [];
    }
  },
  async upsertInventory(items: GasCylinder[]): Promise<void> {
    if (!isSupabaseReady() || items.length === 0) return;
    try {
      console.log('Attempting to upsert inventory items:', items);
      const attempts: Array<{ label: string; payload: unknown[] }> = [
        { label: 'snake_case', payload: items.map(toInventoryRowSnake) },
        { label: 'camelCase', payload: items.map(toInventoryRowCamel) },
        { label: 'lowercase_camel', payload: items.map(toInventoryRowLowerCamel) },
      ];

      for (const attempt of attempts) {
        const { error } = await supabase.from('inventory').upsert(attempt.payload, { onConflict: 'id' });
        if (!error) {
          console.log('Inventory upserted successfully:', items.length, 'items');
          return;
        }
        console.error('Error upserting inventory (' + attempt.label + '):', error.code, error.message, error.details);
      }

      console.info('Please ensure the inventory table exists with the correct schema. Run the SQL script from supabase-simple-tables.sql in your Supabase dashboard.');
    } catch (err) {
      console.error('Exception during inventory upsert:', err);
    }
  },
  async deleteInventoryItem(id: string): Promise<void> {
    if (!isSupabaseReady()) return;
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) {
        console.error('Error deleting inventory item:', error);
      }
    } catch (err) {
      console.error('Exception deleting inventory item:', err);
    }
  },

  async fetchInvoices(): Promise<Invoice[]> {
    if (!isSupabaseReady()) return [];
    try {
      const { data: invs } = await supabase.from('invoices').select('*').order('date', { ascending: true });
      const { data: items } = await supabase.from('invoice_items').select('*');
      const { data: clients } = await supabase.from('clients').select('*');
      const itemsByInv: Record<string, InvoiceItem[]> = {};
      ((items || []) as unknown[]).forEach((row) => {
        if (!row || typeof row !== 'object') return;
        const it = row as Record<string, unknown>;
        const id = pickString(it, ['invoice_id']) || '';
        if (!id) return;
        itemsByInv[id] = itemsByInv[id] || [];
        itemsByInv[id].push({
          description: pickString(it, ['description']) || '',
          quantity: pickNumber(it, ['quantity']),
          unitPrice: pickNumber(it, ['unit_price', 'unitPrice', 'unitprice']),
          taxRate: pickNumber(it, ['tax_rate', 'taxRate', 'taxrate']),
          amount: pickNumber(it, ['amount']),
        });
      });
      const clientsById: Record<string, Client> = {};
      ((clients || []) as Client[]).forEach((c) => {
        clientsById[c.id] = c;
      });
      return ((invs || []) as unknown[])
        .map((row) => {
          if (!row || typeof row !== 'object') return null;
          const r = row as Record<string, unknown>;
          const id = pickString(r, ['id']);
          const number = pickString(r, ['number']);
          const date = pickString(r, ['date']);
          const clientId = pickString(r, ['client_id']);
          if (!id || !number || !date || !clientId) return null;
          const companyName = pickString(r, ['company_name', 'companyName', 'companyname']) as Invoice['companyName'] | null;
          return {
            id,
            number,
            date,
            client: clientsById[clientId],
            items: itemsByInv[id] || [],
            subtotal: pickNumber(r, ['subtotal']),
            taxAmount: pickNumber(r, ['tax_amount', 'taxAmount', 'taxamount']),
            total: pickNumber(r, ['total']),
            companyName: (companyName || 'SEBAI AMA') as Invoice['companyName'],
          } as Invoice;
        })
        .filter((x): x is Invoice => x !== null);
    } catch (err) {
      console.error('Exception fetching invoices:', err);
      return [];
    }
  },
  async syncInvoices(invoices: Invoice[]): Promise<void> {
    if (!isSupabaseReady()) return;
    try {
      const invRowsSnake = invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        date: inv.date,
        client_id: inv.client.id,
        subtotal: inv.subtotal,
        tax_amount: inv.taxAmount,
        total: inv.total,
        company_name: inv.companyName,
      }));

      const invRowsCamel = invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        date: inv.date,
        client_id: inv.client.id,
        subtotal: inv.subtotal,
        taxAmount: inv.taxAmount,
        total: inv.total,
        companyName: inv.companyName,
      }));

      const invRowsLowerCamel = invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        date: inv.date,
        client_id: inv.client.id,
        subtotal: inv.subtotal,
        taxamount: inv.taxAmount,
        total: inv.total,
        companyname: inv.companyName,
      }));

      const invAttempts: Array<{ label: string; payload: unknown[] }> = [
        { label: 'snake_case', payload: invRowsSnake },
        { label: 'camelCase', payload: invRowsCamel },
        { label: 'lowercase_camel', payload: invRowsLowerCamel },
      ];

      let invoicesUpserted = false;
      for (const attempt of invAttempts) {
        const { error } = await supabase.from('invoices').upsert(attempt.payload, { onConflict: 'id' });
        if (!error) {
          invoicesUpserted = true;
          break;
        }
        console.error('Error upserting invoices (' + attempt.label + '):', error.code, error.message, error.details);
      }

      if (!invoicesUpserted) {
        throw new Error('Failed to upsert invoices with known schema variants');
      }

      const { data: existing } = await supabase.from('invoices').select('id');
      const existingIds = new Set(((existing || []) as Array<{ id: string }>).map((r) => r.id));
      const newIds = new Set(invoices.map(inv => inv.id));
      const toDelete = [...existingIds].filter(id => !newIds.has(id));
      if (toDelete.length > 0) {
        await supabase.from('invoice_items').delete().in('invoice_id', toDelete);
        await supabase.from('invoices').delete().in('id', toDelete);
      }
      for (const inv of invoices) {
        await supabase.from('invoice_items').delete().eq('invoice_id', inv.id);
        const itemRowsSnake = inv.items.map((it) => ({
          invoice_id: inv.id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          tax_rate: it.taxRate,
          amount: it.amount,
        }));

        const itemRowsCamel = inv.items.map((it) => ({
          invoice_id: inv.id,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          taxRate: it.taxRate,
          amount: it.amount,
        }));

        const itemRowsLowerCamel = inv.items.map((it) => ({
          invoice_id: inv.id,
          description: it.description,
          quantity: it.quantity,
          unitprice: it.unitPrice,
          taxrate: it.taxRate,
          amount: it.amount,
        }));

        const itemAttempts: Array<{ label: string; payload: unknown[] }> = [
          { label: 'snake_case', payload: itemRowsSnake },
          { label: 'camelCase', payload: itemRowsCamel },
          { label: 'lowercase_camel', payload: itemRowsLowerCamel },
        ];

        if (inv.items.length > 0) {
          let inserted = false;
          for (const attempt of itemAttempts) {
            const { error } = await supabase.from('invoice_items').insert(attempt.payload);
            if (!error) {
              inserted = true;
              break;
            }
            console.error('Error inserting invoice_items (' + attempt.label + '):', error.code, error.message, error.details);
          }
          if (!inserted) {
            throw new Error('Failed to insert invoice items with known schema variants');
          }
        }
      }
    } catch (err) {
      console.error('Exception syncing invoices:', err);
    }
  },
  async deleteInvoice(id: string): Promise<void> {
    if (!isSupabaseReady()) return;
    try {
      await supabase.from('invoice_items').delete().eq('invoice_id', id);
      await supabase.from('invoices').delete().eq('id', id);
    } catch (err) {
      console.error('Exception deleting invoice:', err);
    }
  },

  async fetchSettings(): Promise<Settings | null> {
    if (!isSupabaseReady()) return null;
    try {
      const { data } = await supabase.from('settings').select('data').eq('key', 'default').maybeSingle();
      return (data?.data as Settings) || null;
    } catch (err) {
      console.error('Exception fetching settings:', err);
      return null;
    }
  },
  async upsertSettings(settings: Settings): Promise<void> {
    if (!isSupabaseReady()) return;
    try {
      await supabase.from('settings').upsert({ key: 'default', data: settings }, { onConflict: 'key' });
    } catch (err) {
      console.error('Exception upserting settings:', err);
    }
  },
};
