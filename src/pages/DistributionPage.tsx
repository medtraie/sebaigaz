import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { generateInvoices, generateDistributionDays, generateInvoiceNumber, getCurrentInvoiceNumber, formatDate, setCurrentInvoiceNumber } from "@/lib/utils";
import { Client, GasCylinder, Invoice, InvoiceItem } from "@/types";
import ManualInvoiceForm from "@/components/ManualInvoiceForm";
import { 
  Truck, 
  Wand2, 
  ClipboardList, 
  Settings2, 
  Calendar, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  EyeOff,
  Boxes,
  ArrowRight,
  Save,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DistributionPage() {
  const { 
    clients, inventory, settings, setInvoices, setInventory, invoices,
    setInvoiceStartNumber 
  } = useAppContext();
  const [includeRemaining, setIncludeRemaining] = useState(false);
  const [distributionMonth, setDistributionMonth] = useState(new Date().getMonth() + 1);
  const [distributionYear, setDistributionYear] = useState(new Date().getFullYear());
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [manualItems, setManualItems] = useState<InvoiceItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([]);
  const [remainingInventory, setRemainingInventory] = useState<GasCylinder[]>([]);
  const [distributionDays, setDistributionDays] = useState<number[]>([]);
  const [excludedHolidays, setExcludedHolidays] = useState<number[]>([]);
  const [newHoliday, setNewHoliday] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("automatic");
  const [startingInvoiceNumber, setStartingInvoiceNumber] = useState<string>("");
  const [useCustomInvoiceNumber, setUseCustomInvoiceNumber] = useState<boolean>(false);
  const [hideDay, setHideDay] = useState<boolean>(false);

  const monthKey = `${distributionYear}-${String(distributionMonth).padStart(2, '0')}`;
  // Calculate distribution days when month/year or holidays change
  useEffect(() => {
    const customDays = settings.customDistributionDaysByMonth?.[monthKey] || [];
    const days = generateDistributionDays(distributionYear, distributionMonth, excludedHolidays, customDays);
    setDistributionDays(days);
  }, [distributionYear, distributionMonth, excludedHolidays, settings.customDistributionDaysByMonth, monthKey]);

  // Helper function to format date based on hideDay setting
  const formatInvoiceDate = (date: Date): string => {
    if (hideDay) {
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
    return date.toLocaleDateString('fr-FR');
  };

  const handleAddHoliday = () => {
    const day = parseInt(newHoliday);
    if (!isNaN(day) && day >= 1 && day <= 31) {
      if (!excludedHolidays.includes(day)) {
        setExcludedHolidays([...excludedHolidays, day]);
        setNewHoliday("");
        toast.success("Jour férié ajouté");
      } else {
        toast.error("Déjà ajouté");
      }
    } else {
      toast.error("Jour invalide");
    }
  };

  const handleRemoveHoliday = (day: number) => {
    setExcludedHolidays(excludedHolidays.filter(d => d !== day));
    toast.success("Jour férié supprimé");
  };

  const handleGenerateInvoices = () => {
    if (clients.length === 0) {
      toast.error("Veuillez d'abord ajouter des clients");
      return;
    }

    if (inventory.every(item => item.remainingQuantity === 0)) {
      toast.error("Aucun inventaire disponible");
      return;
    }

    if (useCustomInvoiceNumber && startingInvoiceNumber) {
      const startNumber = parseInt(startingInvoiceNumber);
      if (!isNaN(startNumber) && startNumber > 0) {
        setCurrentInvoiceNumber(startNumber);
        setInvoiceStartNumber(startNumber);
      } else {
        toast.error("Numéro de départ invalide");
        return;
      }
    }

    setIsGenerating(true);

    try {
      const { invoices: newInvoices, remainingInventory: remaining } = generateInvoices(
        inventory,
        clients,
        settings,
        excludedHolidays,
        hideDay,
        distributionMonth,
        distributionYear
      );

      if (newInvoices.length === 0) {
        toast.warning("Aucune facture générée");
      } else {
        setGeneratedInvoices(newInvoices);
        setRemainingInventory(remaining);
        toast.success(`${newInvoices.length} factures prêtes`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur de génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmDistribution = () => {
    const remainingValue = remainingInventory.reduce((sum, item) => {
      const itemValue = item.remainingQuantity * item.unitPrice;
      const tax = itemValue * (item.taxRate / 100);
      return sum + itemValue + tax;
    }, 0);

    const allInvoices = [...generatedInvoices];

    if (includeRemaining && remainingValue > 0 && clients.length > 0) {
      const items: InvoiceItem[] = remainingInventory
        .filter(item => item.remainingQuantity > 0)
        .map(item => ({
          description: item.type,
          quantity: item.remainingQuantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          amount: item.remainingQuantity * item.unitPrice
        }));

      if (items.length > 0) {
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = items.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0);
        const total = subtotal + taxAmount;

        const finalInvoiceDate = new Date(distributionYear, distributionMonth - 1, 1);

        const finalInvoice: Invoice = {
          id: crypto.randomUUID(),
          number: generateInvoiceNumber(),
          date: finalInvoiceDate.toISOString().split('T')[0],
          client: clients[0],
          items,
          subtotal,
          taxAmount,
          total,
          companyName: settings.selectedCompany || 'SEBAI AMA'
        };

        allInvoices.push(finalInvoice);
      }
    }

    if (distributionDays.length > 0) {
      const sortedDays = [...distributionDays].sort((a, b) => a - b);
      const invoicesPerDay = Math.ceil(allInvoices.length / sortedDays.length);
      
      const scheduledInvoices = allInvoices.map((invoice, index) => {
        const dayIndex = Math.min(Math.floor(index / invoicesPerDay), sortedDays.length - 1);
        const day = sortedDays[dayIndex];
        const date = new Date(distributionYear, distributionMonth - 1, day);
        return {
          ...invoice,
          date: date.toISOString().split('T')[0]
        };
      });
      
      setInvoices([...invoices, ...scheduledInvoices]);
    } else {
      const invoicesWithSelectedDate = allInvoices.map(invoice => {
        const date = new Date(distributionYear, distributionMonth - 1, 1);
        return {
          ...invoice,
          date: date.toISOString().split('T')[0]
        };
      });
      setInvoices([...invoices, ...invoicesWithSelectedDate]);
    }
    
    setInventory(inventory.map(item => {
      const match = remainingInventory.find(ri => ri.type === item.type);
      if (match) {
        return {
          ...item,
          remainingQuantity: includeRemaining ? 0 : match.remainingQuantity,
          distributedQuantity: item.totalQuantity - (includeRemaining ? 0 : match.remainingQuantity)
        };
      }
      return item;
    }));

    setGeneratedInvoices([]);
    setRemainingInventory([]);
    setStartingInvoiceNumber("");
    setUseCustomInvoiceNumber(false);

    toast.success("Distribution confirmée et enregistrée");
  };

  const handleManualInvoiceSubmit = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
    
    setInventory(inventory.map(item => {
      const invoiceItem = invoice.items.find(ii => ii.description === item.type);
      if (invoiceItem) {
        return {
          ...item,
          remainingQuantity: Math.max(0, item.remainingQuantity - invoiceItem.quantity),
          distributedQuantity: item.distributedQuantity + invoiceItem.quantity
        };
      }
      return item;
    }));
    
    toast.success("Facture manuelle enregistrée");
  };

  const months = [
    { value: 1, label: "Janvier" }, { value: 2, label: "Février" },
    { value: 3, label: "Mars" }, { value: 4, label: "Avril" },
    { value: 5, label: "Mai" }, { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" }, { value: 8, label: "Août" },
    { value: 9, label: "Septembre" }, { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" }, { value: 12, label: "Décembre" },
  ];

  const currentInvoiceNumber = getCurrentInvoiceNumber();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-brand-teal/10 rounded-2xl">
              <Truck className="w-9 h-9 text-brand-teal" />
            </div>
            Distribution
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">Gérez vos livraisons et la génération automatique des factures.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="bg-white p-2 h-auto rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <TabsTrigger 
              value="automatic" 
              className="px-10 py-4 rounded-2xl data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-brand-teal/20 font-black text-lg transition-all gap-3"
            >
              <Wand2 className="w-5 h-5" />
              Automatique
            </TabsTrigger>
            <TabsTrigger 
              value="manual" 
              className="px-10 py-4 rounded-2xl data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-brand-teal/20 font-black text-lg transition-all gap-3"
            >
              <ClipboardList className="w-5 h-5" />
              Manuel
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="automatic" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Config */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-xl shadow-gray-200/50 rounded-3xl bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-brand-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-gray-900">Période</CardTitle>
                      <CardDescription className="font-medium">Mois et année de distribution.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-black text-gray-400 uppercase tracking-wider ml-1">Mois</Label>
                      <Select value={distributionMonth.toString()} onValueChange={(v) => setDistributionMonth(parseInt(v))}>
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          {months.map(m => (
                            <SelectItem key={m.value} value={m.value.toString()} className="rounded-xl focus:bg-brand-teal/5 font-bold py-3">{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-black text-gray-400 uppercase tracking-wider ml-1">Année</Label>
                      <Select value={distributionYear.toString()} onValueChange={(v) => setDistributionYear(parseInt(v))}>
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          {[2024, 2025, 2026, 2027].map(y => (
                            <SelectItem key={y} value={y.toString()} className="rounded-xl focus:bg-brand-teal/5 font-bold py-3">{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Hash className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-blue-900 uppercase tracking-wider">Dernier N° de facture</p>
                      <p className="text-2xl font-black text-blue-600 mt-1">{currentInvoiceNumber}</p>
                      <p className="text-xs text-blue-600/70 mt-1 font-medium">Incrémentation automatique.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-gray-200/50 rounded-3xl bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
                      <Settings2 className="w-6 h-6 text-brand-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-gray-900">Options</CardTitle>
                      <CardDescription className="font-medium">Paramètres de génération.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100/50 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/20 group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Hash className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-base font-black text-gray-900">N° personnalisé</p>
                          <p className="text-xs text-gray-500 font-medium">Forcer le numéro de départ.</p>
                        </div>
                      </div>
                      <Switch checked={useCustomInvoiceNumber} onCheckedChange={setUseCustomInvoiceNumber} />
                    </div>

                    {useCustomInvoiceNumber && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <Input
                          type="number"
                          placeholder="Numéro de départ"
                          value={startingInvoiceNumber}
                          onChange={(e) => setStartingInvoiceNumber(e.target.value)}
                          className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100/50 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/20 group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-base font-black text-gray-900">Masquer le jour</p>
                          <p className="text-xs text-gray-500 font-medium">MM/AAAA sur les factures.</p>
                        </div>
                      </div>
                      <Switch checked={hideDay} onCheckedChange={setHideDay} />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100/50 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/20 group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Boxes className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-base font-black text-gray-900">Inclure reliquat</p>
                          <p className="text-xs text-gray-500 font-medium">Ajouter à la facture finale.</p>
                        </div>
                      </div>
                      <Switch checked={includeRemaining} onCheckedChange={setIncludeRemaining} />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <Label className="text-sm font-black text-gray-400 uppercase tracking-wider ml-1 block mb-4">Exclure des jours</Label>
                    <div className="flex gap-3 mb-6">
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Jour"
                        value={newHoliday}
                        onChange={(e) => setNewHoliday(e.target.value)}
                        className="h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-lg"
                      />
                      <Button onClick={handleAddHoliday} className="h-14 w-14 p-0 rounded-2xl bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200 transition-all">
                        <Plus className="w-6 h-6" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {excludedHolidays.map(day => (
                        <Badge key={day} variant="secondary" className="h-10 pl-4 pr-2 gap-2 rounded-xl bg-gray-100 text-gray-700 border-none group hover:bg-red-50 hover:text-red-600 transition-all cursor-default font-bold">
                          Jour {day}
                          <button onClick={() => handleRemoveHoliday(day)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Preview/Results */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-center p-12 bg-white rounded-[40px] border-4 border-dashed border-gray-50 min-h-[500px] shadow-sm">
                {generatedInvoices.length === 0 ? (
                  <div className="text-center space-y-6 py-12 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-brand-teal/5 rounded-full flex items-center justify-center mb-6">
                      <Wand2 className="w-12 h-12 text-brand-teal animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Génération Automatique</h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-lg font-medium leading-relaxed">
                      Lancez la génération pour créer des factures basées sur l'inventaire et les quotas clients.
                    </p>
                    <Button 
                      onClick={handleGenerateInvoices} 
                      disabled={isGenerating}
                      className="bg-brand-teal hover:bg-brand-teal/90 text-white h-16 px-12 rounded-2xl font-black text-xl shadow-2xl shadow-brand-teal/30 transition-all gap-4 mt-6 group"
                    >
                      {isGenerating ? "Génération en cours..." : "Lancer la Génération"}
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-brand-teal/5 p-8 rounded-3xl border border-brand-teal/10 gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-brand-teal rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-teal/20">
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-brand-teal">{generatedInvoices.length} Factures Générées</p>
                          <p className="text-base text-brand-teal/70 font-medium">Prêtes pour la confirmation finale.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 w-full sm:w-auto">
                        <Button variant="outline" onClick={() => setGeneratedInvoices([])} className="h-14 flex-1 sm:flex-none rounded-2xl border-gray-200 font-black text-lg px-8 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">
                          <Trash2 className="w-5 h-5 mr-2" /> Annuler
                        </Button>
                        <Button onClick={handleConfirmDistribution} className="bg-brand-teal hover:bg-brand-teal/90 text-white h-14 flex-1 sm:flex-none rounded-2xl font-black text-lg px-10 shadow-xl shadow-brand-teal/20 gap-3">
                          <Save className="w-5 h-5" /> Confirmer
                        </Button>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-[32px] overflow-hidden shadow-2xl shadow-gray-200/50 bg-white">
                      <Table>
                        <TableHeader className="bg-gray-50/80">
                          <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-black text-gray-400 uppercase tracking-wider py-6 px-8">N° Facture</TableHead>
                            <TableHead className="font-black text-gray-400 uppercase tracking-wider py-6 px-8">Date</TableHead>
                            <TableHead className="font-black text-gray-400 uppercase tracking-wider py-6 px-8">Client</TableHead>
                            <TableHead className="font-black text-gray-400 uppercase tracking-wider py-6 px-8 text-right">Total TTC</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {generatedInvoices.slice(0, 10).map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                              <TableCell className="font-black text-brand-teal text-lg py-6 px-8">{invoice.number}</TableCell>
                              <TableCell className="font-bold text-gray-500 py-6 px-8">{formatInvoiceDate(new Date(invoice.date))}</TableCell>
                              <TableCell className="font-black text-gray-900 text-lg py-6 px-8">{invoice.client.name}</TableCell>
                              <TableCell className="text-right font-black text-gray-900 text-xl py-6 px-8">
                                {invoice.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-gray-400">DH</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {generatedInvoices.length > 10 && (
                        <div className="p-6 text-center bg-gray-50/50 text-base text-gray-500 font-black uppercase tracking-widest border-t border-gray-50">
                          + {generatedInvoices.length - 10} autres factures
                        </div>
                      )}
                    </div>

                    <div className="bg-amber-50/50 p-8 rounded-3xl border border-amber-100 flex items-start gap-6">
                      <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                        <AlertCircle className="w-7 h-7 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-black text-amber-900 mb-2">Inventaire Restant</h4>
                        <p className="text-base text-amber-700/80 mb-6 font-medium">Quantités non distribuées qui resteront en stock :</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {remainingInventory.map(item => (
                            <div key={item.type} className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{item.type}</p>
                              <p className="text-3xl font-black text-amber-600">{item.remainingQuantity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-xl shadow-gray-200/50 rounded-3xl bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 p-10 border-b border-gray-50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center shadow-sm">
                  <ClipboardList className="w-8 h-8 text-brand-teal" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-gray-900">Facture Manuelle</CardTitle>
                  <CardDescription className="text-lg font-medium">Créez une facture personnalisée en dehors du cycle automatique.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <ManualInvoiceForm onSubmit={handleManualInvoiceSubmit} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
