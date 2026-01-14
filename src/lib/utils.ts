import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Client, GasCylinder, Invoice, InvoiceItem, Settings } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Global variable to track the last invoice number
let lastInvoiceNumber = 0;

// Initialize the invoice number system
export function initInvoiceNumberSystem(startingNumber?: number) {
  if (startingNumber && startingNumber > 0) {
    // Fix: Set to startingNumber - 1 so the first generated invoice will be startingNumber
    lastInvoiceNumber = startingNumber - 1;
  } else if (lastInvoiceNumber === 0) {
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      const invoices = JSON.parse(storedInvoices) as Invoice[];
      if (invoices.length > 0) {
        const numbers = invoices.map(inv => {
          const parts = inv.number.split('/');
          if (parts.length >= 3) {
            return parseInt(parts[parts.length - 1], 10);
          }
          return 0;
        });
        lastInvoiceNumber = Math.max(...numbers, 0);
      } else {
        lastInvoiceNumber = 0;
      }
    } else {
      lastInvoiceNumber = 0;
    }
  }
}

// Generate sequential invoice number - ALWAYS format FA/YY/MM/XXXXX (without day)
export function generateInvoiceNumber(invoiceDate?: Date): string {
  const date = invoiceDate || new Date();
  const year = date.getFullYear();
  const shortYear = year.toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  if (lastInvoiceNumber === 0) {
    initInvoiceNumberSystem();
  }
  
  lastInvoiceNumber++;
  
  const formattedNumber = lastInvoiceNumber.toString().padStart(5, '0');
  
  // ALWAYS return format WITHOUT day: FA/YY/MM/XXXXX
  return `FA/${shortYear}/${month}/${formattedNumber}`;
}

// Generate manual invoice number - ALWAYS format FP/YY/MM/XXXXX (without day)
export function generateManualInvoiceNumber(invoiceDate?: Date): string {
  const date = invoiceDate || new Date();
  const year = date.getFullYear();
  const shortYear = year.toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  if (lastInvoiceNumber === 0) {
    initInvoiceNumberSystem();
  }
  
  lastInvoiceNumber++;
  
  const formattedNumber = lastInvoiceNumber.toString().padStart(5, '0');
  
  // ALWAYS return format WITHOUT day: FP/YY/MM/XXXXX
  return `FP/${shortYear}/${month}/${formattedNumber}`;
}

// Get the current invoice number without incrementing
export function getCurrentInvoiceNumber(): number {
  if (lastInvoiceNumber === 0) {
    initInvoiceNumberSystem();
  }
  return lastInvoiceNumber;
}

// Set the current invoice number (for manual adjustment) - Fixed to set to exactly number - 1
export function setCurrentInvoiceNumber(number: number): void {
  if (number > 0) {
    // Set to number - 1 so the next generated invoice will be exactly the desired number
    lastInvoiceNumber = number - 1;
  }
}

// Format date for display based on hideDay parameter
export function formatDate(date: Date, hideDay: boolean = false): string {
  if (hideDay) {
    // Return format MM/YYYY when hideDay is true
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  } else {
    // Return format DD/MM/YYYY when hideDay is false
    return date.toLocaleDateString('fr-FR');
  }
}

// Calculate totals for invoice items
export function calculateTotal(items: InvoiceItem[]): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0);
  const total = subtotal + taxAmount;
  
  return { subtotal, taxAmount, total };
}

// Function to convert number to words (in French)
export function numberToWords(num: number): string {
  // This is a simplified version - for production, consider using a library
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  
  if (num === 0) return 'zéro';
  
  function convert(n: number): string {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const unit = n % 10;
      const ten = Math.floor(n / 10);
      return unit ? `${tens[ten]}-${units[unit]}` : tens[ten];
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      return remainder
        ? `${hundred > 1 ? `${units[hundred]} cents` : 'cent'} ${convert(remainder)}`
        : `${hundred > 1 ? `${units[hundred]} cents` : 'cent'}`;
    }
    if (n < 1000000) {
      const thousand = Math.floor(n / 1000);
      const remainder = n % 1000;
      return remainder
        ? `${thousand > 1 ? `${convert(thousand)} mille` : 'mille'} ${convert(remainder)}`
        : `${thousand > 1 ? `${convert(thousand)} mille` : 'mille'}`;
    }
    return 'nombre trop grand';
  }
  
  const result = convert(Math.floor(num));
  const decimal = Math.round((num - Math.floor(num)) * 100);
  
  return decimal ? `${result} et ${convert(decimal)} centimes` : result;
}

/**
 * Generate invoices with varied amounts within min/max range
 */
export const generateInvoices = (
  inventory: GasCylinder[],
  clients: Client[],
  settings: Settings,
  excludedHolidays: number[] = [],
  hideDay: boolean,
  distributionMonth?: number,
  distributionYear?: number
): { invoices: Invoice[], remainingInventory: GasCylinder[] } => {
  const workingInventory = JSON.parse(JSON.stringify(inventory)) as GasCylinder[];
  const invoices: Invoice[] = [];
  
  const totalCounts: Record<number, number> = {};
  const MAX_IDENTICAL_INVOICES = Math.floor(2 + Math.random() * 4);
  
  const shuffledClients = [...clients].sort(() => Math.random() - 0.5);
  let clientIndex = 0;
  
  const getTotalValue = (inv: GasCylinder[]): number => {
    return inv.reduce((sum, item) => {
      const itemTotal = item.remainingQuantity * item.unitPrice;
      const tax = itemTotal * (item.taxRate / 100);
      return sum + itemTotal + tax;
    }, 0);
  };
  
  while (getTotalValue(workingInventory) >= settings.minInvoiceAmount && clients.length > 0) {
    const client = shuffledClients[clientIndex % shuffledClients.length];
    clientIndex++;
    
    const invoiceItems: InvoiceItem[] = [];
    
    let targetAmount: number;
    
    do {
      targetAmount = Math.floor(
        settings.minInvoiceAmount + 
        (Math.random() * (settings.maxInvoiceAmount - settings.minInvoiceAmount))
      );
      targetAmount = Math.round(targetAmount / 100) * 100;
    } while (
      totalCounts[targetAmount] >= MAX_IDENTICAL_INVOICES && 
      Object.keys(totalCounts).length < 10
    );
    
    let invoiceTotal = 0;
    
    for (const cylinder of workingInventory) {
      if (cylinder.remainingQuantity <= 0) continue;
      
      let quantity = 0;
      let amount = 0;
      
      while (
        cylinder.remainingQuantity > quantity && 
        invoiceTotal + amount + cylinder.unitPrice + (cylinder.unitPrice * cylinder.taxRate / 100) <= targetAmount
      ) {
        quantity++;
        amount = quantity * cylinder.unitPrice;
        const tax = amount * (cylinder.taxRate / 100);
        invoiceTotal = invoiceItems.reduce((sum, item) => sum + item.amount + (item.amount * item.taxRate / 100), 0) + amount + tax;
      }
      
      if (quantity > 0) {
        invoiceItems.push({
          description: cylinder.type,
          quantity,
          unitPrice: cylinder.unitPrice,
          taxRate: cylinder.taxRate,
          amount
        });
        
        cylinder.remainingQuantity -= quantity;
        cylinder.distributedQuantity += quantity;
      }
    }
    
    if (invoiceItems.length > 0) {
      const { subtotal, taxAmount, total } = calculateTotal(invoiceItems);
      
      if (total >= settings.minInvoiceAmount) {
        totalCounts[Math.round(total)] = (totalCounts[Math.round(total)] || 0) + 1;
        
        const invoiceDate = distributionMonth && distributionYear 
          ? new Date(distributionYear, distributionMonth - 1, 1)
          : new Date();
        
        // Invoice number format is ALWAYS FA/YY/MM/XXXXX (without day)
        // Date format depends on hideDay parameter
        invoices.push({
          id: crypto.randomUUID(),
          number: generateInvoiceNumber(invoiceDate),
          date: formatDate(invoiceDate, hideDay),
          client,
          items: invoiceItems,
          subtotal,
          taxAmount,
          total,
          companyName: settings.selectedCompany || settings.companyName // Use selected company
        });
      } else {
        invoiceItems.forEach(item => {
          const cylinder = workingInventory.find(c => c.type === item.description);
          if (cylinder) {
            cylinder.remainingQuantity += item.quantity;
            cylinder.distributedQuantity -= item.quantity;
          }
        });
      }
    }
    
    if (getTotalValue(workingInventory) < settings.minInvoiceAmount) {
      break;
    }
  }
  
  return { invoices, remainingInventory: workingInventory };
}

// Generate distribution days, excluding Sundays (0) but allowing Saturdays (6) and specified holidays
export function generateDistributionDays(
  year: number,
  month: number,
  holidays: number[] = [],
  customDays: number[] = []
): number[] {
  const lastDay = new Date(year, month, 0).getDate();
  if (customDays && customDays.length > 0) {
    const filtered = customDays
      .filter((day) => day >= 1 && day <= lastDay && !holidays.includes(day))
      .filter((day) => new Date(year, month - 1, day).getDay() !== 0)
      .sort((a, b) => a - b);
    return filtered;
  }
  const days: number[] = [];
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && !holidays.includes(day)) {
      days.push(day);
    }
  }
  return days;
}
