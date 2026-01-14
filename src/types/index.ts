
// Client type
export interface Client {
  id: string;
  name: string;
  code: string; // This represents the Patente number
  ice?: string; // Optional ICE number
  address?: string; // Optional address
}

// Product type
export interface GasCylinder {
  id: string; // Add missing id field
  type: '12KG' | '6KG' | '3KG' | 'DETENDEUR CLIC-ON' | 'PROPANE 34 KG' | 'BNG 12 KG';
  totalQuantity: number;
  distributedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  taxRate: number;
}

// Invoice type
export interface Invoice {
  id: string;
  number: string;
  date: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  companyName: 'STE ZAGAZ' | 'SEBAI AMA' | 'STE SEBAI FRERES DISTRIBUTION' | 'STE TASNIM SBAI sarl' | 'STE TAHA SBAI sarl';
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface CompanyInfo {
  name: 'SEBAI AMA' | 'STE SEBAI FRERES DISTRIBUTION' | 'STE TASNIM SBAI sarl' | 'STE TAHA SBAI sarl';
  address: string;
  phone: string;
  fax: string;
  rc: string;
  tf?: string;
  if?: string;
  cnss: string;
  patente?: string;
  ice: string;
}

export interface Settings {
  secretCode: string;
  selectedCompany: 'SEBAI AMA' | 'STE SEBAI FRERES DISTRIBUTION' | 'STE TASNIM SBAI sarl' | 'STE TAHA SBAI sarl';
  companyName: 'STE ZAGAZ' | 'SEBAI AMA' | 'STE SEBAI FRERES DISTRIBUTION' | 'STE TASNIM SBAI sarl' | 'STE TAHA SBAI sarl';
  companyAddress: string;
  companyPhone: string;
  companyFax: string;
  companyEmail: string;
  taxRate: number;
  currency: string;
  invoicePrefix: string;
  minInvoiceAmount: number;
  maxInvoiceAmount: number;
  defaultPaymentTerms: string;
  companyRegistration: string;
  companyCNSS: string;
  companyPatente: string;
  companyICE: string;
  customDistributionDaysByMonth?: Record<string, number[]>;
}
