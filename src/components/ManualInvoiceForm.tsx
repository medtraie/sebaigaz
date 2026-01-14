import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InvoiceItem } from '@/types';
import { toast } from 'sonner';
import { Plus, Trash2, Receipt, User, Package, Calculator, Save, AlertCircle } from 'lucide-react';
import { cn, generateInvoiceNumber, initInvoiceNumberSystem, getCurrentInvoiceNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ManualInvoiceFormProps {
  hideDay?: boolean;
  useCustomInvoiceNumber?: boolean;
  startingInvoiceNumber?: string;
  selectedDay?: number;
  selectedMonth?: number;
  selectedYear?: number;
}

export default function ManualInvoiceForm({ 
  hideDay = true, 
  startingInvoiceNumber = "",
  selectedDay,
  selectedMonth,
  selectedYear
}: ManualInvoiceFormProps) {
  const { clients, inventory, setInvoices, invoices, setInventory, setInvoiceStartNumber, settings } = useAppContext();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<{
    cylinderType: string,
    quantity: number,
    unitPrice: number,
    taxRate: number
  }>({
    cylinderType: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0
  });

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleSelectCylinderType = (type: string) => {
    const cylinderData = inventory.find(item => item.type === type);
    if (cylinderData) {
      setNewItem({
        cylinderType: type,
        quantity: 1,
        unitPrice: cylinderData.unitPrice,
        taxRate: cylinderData.taxRate
      });
    }
  };

  const handleAddItem = () => {
    if (!newItem.cylinderType || newItem.quantity <= 0) {
      toast.error("Veuillez choisir le type de bouteille et la quantité");
      return;
    }

    const cylinderData = inventory.find(item => item.type === newItem.cylinderType);
    if (!cylinderData || cylinderData.remainingQuantity < newItem.quantity) {
      toast.error("La quantité disponible est insuffisante");
      return;
    }

    const amount = newItem.quantity * newItem.unitPrice;

    setItems([...items, {
      description: newItem.cylinderType,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      taxRate: newItem.taxRate,
      amount
    }]);

    setNewItem({
      cylinderType: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const getInvoiceDate = (): Date => {
    if (selectedYear && selectedMonth && selectedDay) {
      return new Date(selectedYear, selectedMonth - 1, selectedDay);
    }
    if (selectedYear && selectedMonth) {
      return new Date(selectedYear, selectedMonth - 1, 1);
    }
    return new Date();
  };

  const formatInvoiceDate = (date: Date): string => {
    if (hideDay) {
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
    return date.toLocaleDateString('fr-FR');
  };

  const handleCreateInvoice = () => {
    if (!selectedClientId) {
      toast.error("Veuillez choisir le client");
      return;
    }

    if (items.length === 0) {
      toast.error("Veuillez ajouter au moins un élément");
      return;
    }

    const selectedClient = clients.find(client => client.id === selectedClientId);
    if (!selectedClient) {
      toast.error("Le client n'existe pas");
      return;
    }

    if (startingInvoiceNumber) {
      const startNumber = parseInt(startingInvoiceNumber);
      if (!isNaN(startNumber) && startNumber > 0) {
        initInvoiceNumberSystem(startNumber);
        setInvoiceStartNumber(startNumber);
      } else {
        toast.error("Numéro de début invalide");
        return;
      }
    }

    const invoiceDate = getInvoiceDate();
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0);
    const total = subtotal + taxAmount;

    const manualInvoice = {
      id: crypto.randomUUID(),
      number: generateInvoiceNumber(invoiceDate),
      date: invoiceDate.toISOString().split("T")[0],
      client: selectedClient,
      items: [...items],
      subtotal,
      taxAmount,
      total,
      companyName: settings.selectedCompany || 'SEBAI AMA'
    };

    setInvoices([...invoices, manualInvoice]);

    const updatedInventory = inventory.map(inventoryItem => {
      const usedItem = items.find(item => item.description === inventoryItem.type);
      if (usedItem) {
        return {
          ...inventoryItem,
          remainingQuantity: inventoryItem.remainingQuantity - usedItem.quantity,
          distributedQuantity: inventoryItem.distributedQuantity + usedItem.quantity
        };
      }
      return inventoryItem;
    });

    setInventory(updatedInventory);
    toast.success("Facture créée avec succès");
    setSelectedClientId('');
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0);
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-gray-100">
        <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-brand-teal" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Créer une facture manuelle</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-teal" />
              Client
            </Label>
            <Select value={selectedClientId} onValueChange={handleSelectClient}>
              <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:ring-brand-teal transition-all">
                <SelectValue placeholder="Choisir un client" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="rounded-xl focus:bg-brand-teal focus:text-white">
                    {client.name} ({client.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-brand-teal" />
              <h3 className="font-bold text-gray-900">Ajouter des éléments</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4 space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase ml-1">Type de bouteille</Label>
                <Select value={newItem.cylinderType} onValueChange={handleSelectCylinderType}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white border-gray-100 focus:ring-brand-teal transition-all shadow-sm">
                    <SelectValue placeholder="Choisir le type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {inventory.map((cylinder) => (
                      <SelectItem key={cylinder.type} value={cylinder.type} className="rounded-xl">
                        {cylinder.type} ({cylinder.remainingQuantity} disponible)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase ml-1">Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                  className="h-12 rounded-2xl bg-white border-gray-100 focus:bg-white transition-all shadow-sm text-center font-bold"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase ml-1">Prix Unit.</Label>
                <Input
                  type="number"
                  value={newItem.unitPrice}
                  readOnly
                  className="h-12 rounded-2xl bg-gray-100 border-transparent text-gray-500 text-center font-bold"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase ml-1">TVA %</Label>
                <Input
                  type="number"
                  value={newItem.taxRate}
                  readOnly
                  className="h-12 rounded-2xl bg-gray-100 border-transparent text-gray-500 text-center font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <Button 
                  onClick={handleAddItem} 
                  className="w-full h-12 bg-brand-teal hover:bg-brand-teal/90 text-white rounded-2xl font-bold shadow-lg shadow-brand-teal/20 transition-all gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="font-bold text-gray-900">Description</TableHead>
                      <TableHead className="font-bold text-gray-900 text-center">Quantité</TableHead>
                      <TableHead className="font-bold text-gray-900 text-center">Prix Unit.</TableHead>
                      <TableHead className="font-bold text-gray-900 text-center">TVA</TableHead>
                      <TableHead className="font-bold text-gray-900 text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                        <TableCell className="font-bold text-gray-900">{item.description}</TableCell>
                        <TableCell className="text-center font-bold text-brand-teal">{item.quantity}</TableCell>
                        <TableCell className="text-center font-medium text-gray-600">{item.unitPrice.toLocaleString()} MAD</TableCell>
                        <TableCell className="text-center font-medium text-gray-600">{item.taxRate}%</TableCell>
                        <TableCell className="text-right font-black text-gray-900">{item.amount.toLocaleString()} MAD</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="w-8 h-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-8 bg-brand-teal/5 p-8 rounded-3xl border border-brand-teal/10">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calculator className="w-5 h-5 text-brand-teal" />
                    <h4 className="font-bold text-gray-900">Résumé de la facture</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                    <span className="text-gray-500 font-medium">Sous-total :</span>
                    <span className="text-right font-bold text-gray-900">{subtotal.toLocaleString()} MAD</span>
                    <span className="text-gray-500 font-medium">Montant TVA :</span>
                    <span className="text-right font-bold text-gray-900">{taxAmount.toLocaleString()} MAD</span>
                    <div className="col-span-2 pt-3 border-t border-brand-teal/10 flex justify-between items-center">
                      <span className="text-brand-teal font-black text-lg">Total TTC :</span>
                      <span className="text-brand-teal font-black text-2xl">{total.toLocaleString()} MAD</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateInvoice} 
                    disabled={!selectedClientId || items.length === 0}
                    className="w-full md:w-auto bg-brand-teal hover:bg-brand-teal/90 text-white h-16 px-12 rounded-2xl font-black shadow-xl shadow-brand-teal/20 transition-all gap-3 hover:scale-[1.02] active:scale-95"
                  >
                    <Save className="w-6 h-6" />
                    Enregistrer et émettre la facture
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
