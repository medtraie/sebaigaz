import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { generateInvoices, generateDistributionDays, generateInvoiceNumber, getCurrentInvoiceNumber, initInvoiceNumberSystem } from "@/lib/utils";
import { Client, GasCylinder, Invoice, InvoiceItem } from "@/types";
import { 
  Wand2, 
  Calendar, 
  Settings2, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  EyeOff,
  Plus,
  X,
  FileText,
  Boxes,
  ArrowRight,
  Save,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AutomaticDistributionPage() {
  const { 
    clients, inventory, settings, setInvoices, setInventory, invoices,
    setInvoiceStartNumber, updateSettings
  } = useAppContext();
  const [includeRemaining, setIncludeRemaining] = useState(false);
  const [distributionMonth, setDistributionMonth] = useState(new Date().getMonth() + 1);
  const [distributionYear, setDistributionYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([]);
  const [remainingInventory, setRemainingInventory] = useState<GasCylinder[]>([]);
  const [distributionDays, setDistributionDays] = useState<number[]>([]);
  const [excludedHolidays, setExcludedHolidays] = useState<number[]>([]);
  const [newHoliday, setNewHoliday] = useState<string>("");
  const [startingInvoiceNumber, setStartingInvoiceNumber] = useState<string>("");
  const [useCustomInvoiceNumber, setUseCustomInvoiceNumber] = useState<boolean>(false);
  const [hideDay, setHideDay] = useState<boolean>(true);

  const monthKey = `${distributionYear}-${String(distributionMonth).padStart(2, '0')}`;
  // Calculate distribution days when month/year or holidays change
  useEffect(() => {
    const customDays = settings.customDistributionDaysByMonth?.[monthKey] || [];
    const days = generateDistributionDays(distributionYear, distributionMonth, excludedHolidays, customDays);
    setDistributionDays(days);
  }, [distributionYear, distributionMonth, excludedHolidays, settings.customDistributionDaysByMonth, monthKey]);

  // Helper function to format date based on hideDay setting and selected month/year
  const formatInvoiceDate = (date: Date): string => {
    if (hideDay) {
      return `${distributionMonth.toString().padStart(2, '0')}/${distributionYear}`;
    }
    const selectedDate = new Date(distributionYear, distributionMonth - 1, date.getDate());
    return selectedDate.toLocaleDateString('fr-FR');
  };

  const handleAddHoliday = () => {
    const day = parseInt(newHoliday);
    if (!isNaN(day) && day >= 1 && day <= 31) {
      if (!excludedHolidays.includes(day)) {
        setExcludedHolidays([...excludedHolidays, day]);
        setNewHoliday("");
        toast.success("Jour férié ajouté");
      } else {
        toast.error("Ce jour est déjà ajouté");
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
      toast.error("Aucun stock disponible");
      return;
    }

    if (useCustomInvoiceNumber && startingInvoiceNumber) {
      const startNumber = parseInt(startingInvoiceNumber);
      if (!isNaN(startNumber) && startNumber > 0) {
        initInvoiceNumberSystem(startNumber);
        setInvoiceStartNumber(startNumber);
      } else {
        toast.error("Numéro de début invalide");
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
        let scheduledInvoices = newInvoices;

        if (distributionDays.length > 0) {
          const sortedDays = [...distributionDays].sort((a, b) => a - b);
          const invoicesPerDay = Math.ceil(newInvoices.length / sortedDays.length);

          scheduledInvoices = newInvoices.map((invoice, index) => {
            const dayIndex = Math.min(
              Math.floor(index / invoicesPerDay),
              sortedDays.length - 1
            );
            const day = sortedDays[dayIndex];
            const date = new Date(distributionYear, distributionMonth - 1, day);
            return {
              ...invoice,
              date: date.toISOString().split("T")[0],
            };
          });
        }

        setGeneratedInvoices(scheduledInvoices);
        setRemainingInventory(remaining);
        toast.success(`${newInvoices.length} factures préparées`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmDistribution = () => {
    if (generatedInvoices.length === 0) return;

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

        const lastInvoice = generatedInvoices[generatedInvoices.length - 1];
        const lastDate = lastInvoice ? new Date(lastInvoice.date) : new Date(distributionYear, distributionMonth - 1, distributionDays[distributionDays.length - 1] || 1);

        const randomClient = clients[Math.floor(Math.random() * clients.length)];

        const finalInvoice: Invoice = {
          id: crypto.randomUUID(),
          number: generateInvoiceNumber(),
          date: lastDate.toISOString().split("T")[0],
          client: randomClient,
          items,
          subtotal,
          taxAmount,
          total,
        };
        allInvoices.push(finalInvoice);
      }
    }

    setInvoices([...invoices, ...allInvoices]);

    setInventory(remainingInventory.map(item => ({
      ...item,
      distributedQuantity: item.totalQuantity - item.remainingQuantity,
      remainingQuantity: 0
    })));
    
    setGeneratedInvoices([]);
    setRemainingInventory([]);
    toast.success("Distribution confirmée et factures enregistrées avec succès");
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-brand-teal/10 rounded-2xl">
              <Wand2 className="w-8 h-8 text-brand-teal" />
            </div>
            Distribution Automatique
          </h1>
          <p className="text-gray-500 font-medium">Générez intelligemment des factures basées sur l'inventaire actuel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-gray-100">
            <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Période de Distribution</CardTitle>
                  <CardDescription className="font-medium">Sélectionnez le mois et l'année pour la facturation.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Mois</Label>
                  <Select value={distributionMonth.toString()} onValueChange={(v) => setDistributionMonth(parseInt(v))}>
                    <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:ring-brand-teal focus:border-brand-teal transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100">
                      {months.map(m => (
                        <SelectItem key={m.value} value={m.value.toString()} className="rounded-xl focus:bg-brand-teal focus:text-white">
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Année</Label>
                  <Select value={distributionYear.toString()} onValueChange={(v) => setDistributionYear(parseInt(v))}>
                    <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:ring-brand-teal focus:border-brand-teal transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100">
                      {[2024, 2025, 2026].map(y => (
                        <SelectItem key={y} value={y.toString()} className="rounded-xl focus:bg-brand-teal focus:text-white">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-brand-teal/5 p-5 rounded-2xl border border-brand-teal/10 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Hash className="w-5 h-5 text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-teal">Dernier N° de facture : {currentInvoiceNumber}</p>
                  <p className="text-xs text-brand-teal/70 mt-1 leading-relaxed">Le système incrémentera automatiquement à partir de ce numéro.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-gray-100">
            <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
                  <Settings2 className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Paramètres Avancés</CardTitle>
                  <CardDescription className="font-medium">Contrôlez le processus de génération.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Hash className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Numéro personnalisé</p>
                      <p className="text-xs text-gray-500">Commencer par un numéro spécifique</p>
                    </div>
                  </div>
                  <Switch checked={useCustomInvoiceNumber} onCheckedChange={setUseCustomInvoiceNumber} />
                </div>

                {useCustomInvoiceNumber && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <Input
                      type="number"
                      placeholder="Numéro de début"
                      value={startingInvoiceNumber}
                      onChange={(e) => setStartingInvoiceNumber(e.target.value)}
                      className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-center font-bold"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Masquer le jour</p>
                      <p className="text-xs text-gray-500">Sur les factures</p>
                    </div>
                  </div>
                  <Switch checked={hideDay} onCheckedChange={setHideDay} />
                </div>

                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Boxes className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Inclure le reste</p>
                      <p className="text-xs text-gray-500">Sur la facture finale</p>
                    </div>
                  </div>
                  <Switch checked={includeRemaining} onCheckedChange={setIncludeRemaining} />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 space-y-6">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-4 block">Jours de Distribution</Label>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const isHoliday = excludedHolidays.includes(day);
                        const isDistributionDay = distributionDays.includes(day);
                        const date = new Date(distributionYear, distributionMonth - 1, day);
                        const isSaturday = date.getDay() === 6;
                        const isSunday = date.getDay() === 0;

                        const baseClasses = "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl text-sm font-bold cursor-pointer transition-all";

                        let stateClasses = "bg-gray-100 text-gray-500";
                        if (isHoliday) {
                          stateClasses = "bg-red-100 text-red-700 border border-red-200";
                        } else if (isSunday) {
                          stateClasses = "bg-red-50 text-red-500 border border-red-200/60";
                        } else if (isDistributionDay) {
                          stateClasses = "bg-brand-teal text-white shadow-md shadow-brand-teal/30";
                        } else if (isSaturday) {
                          stateClasses = "bg-amber-50 text-amber-600 border border-amber-200";
                        }

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              if (isHoliday || isSunday) return;
                              const nextDays = isDistributionDay
                                ? distributionDays.filter(d => d !== day)
                                : [...distributionDays, day].sort((a, b) => a - b);
                              setDistributionDays(nextDays);
                              const map = { ...(settings.customDistributionDaysByMonth || {}) };
                              map[monthKey] = nextDays;
                              updateSettings({ customDistributionDaysByMonth: map });
                            }}
                            className={`${baseClasses} ${stateClasses}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="font-bold mr-2">Légende :</span>
                      <div className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-brand-teal" />
                        <span>Jours de distribution</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-amber-100 border border-amber-200" />
                        <span>Samedi (autorisé)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-red-50 border border-red-200" />
                        <span>Dimanche (interdit)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-red-200" />
                        <span>Jours fériés</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-4 block">Ajouter un jour férié</Label>
                  <div className="flex gap-3 mb-4">
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Entrez le jour férié"
                      value={newHoliday}
                      onChange={(e) => setNewHoliday(e.target.value)}
                      className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-center font-bold"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleAddHoliday} 
                      className="h-12 w-12 p-0 rounded-2xl border-gray-200 hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-all"
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {excludedHolidays.map(day => (
                      <Badge 
                        key={day} 
                        variant="secondary" 
                        className="h-10 pl-4 pr-1 gap-2 rounded-xl bg-gray-100 text-gray-700 border-none group hover:bg-red-50 hover:text-red-600 transition-all cursor-default font-bold"
                      >
                        Jour {day}
                        <button 
                          onClick={() => handleRemoveHoliday(day)} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 text-gray-400 group-hover:text-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Badge>
                    ))}
                    {excludedHolidays.length === 0 && (
                      <p className="text-sm text-gray-400 font-medium italic">Aucun jour exclu</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview/Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            {generatedInvoices.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-brand-teal/10 blur-3xl rounded-full animate-pulse-slow"></div>
                  <div className="relative w-24 h-24 bg-brand-teal/10 rounded-[32px] flex items-center justify-center rotate-12 transition-transform hover:rotate-0 duration-500">
                    <Wand2 className="w-12 h-12 text-brand-teal -rotate-12 group-hover:rotate-0 transition-transform" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Prêt à commencer ?</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium leading-relaxed">
                  Cliquez sur le bouton ci-dessous pour lancer l'algorithme de distribution et prévisualiser les factures avant confirmation.
                </p>
                <Button 
                  onClick={handleGenerateInvoices} 
                  disabled={isGenerating}
                  className="bg-brand-teal hover:bg-brand-teal/90 text-white h-14 px-12 rounded-2xl font-bold shadow-xl shadow-brand-teal/20 transition-all gap-3 hover:scale-[1.02] active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Lancer la distribution
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-brand-teal rounded-2xl flex items-center justify-center shadow-lg shadow-brand-teal/20">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-gray-900">{generatedInvoices.length} factures prêtes</p>
                        <p className="text-sm text-gray-500 font-medium">L'inventaire a été examiné et les quotas distribués avec succès.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <Button 
                        variant="outline" 
                        onClick={() => setGeneratedInvoices([])} 
                        className="flex-1 md:flex-none h-12 rounded-2xl border-gray-200 font-bold px-6 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                      >
                        <Trash2 className="w-5 h-5 mr-2" /> Annuler
                      </Button>
                      <Button 
                        onClick={handleConfirmDistribution} 
                        className="flex-1 md:flex-none bg-brand-teal hover:bg-brand-teal/90 text-white h-12 rounded-2xl font-bold px-8 shadow-lg shadow-brand-teal/20 gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <Save className="w-5 h-5" /> Confirmer et tout enregistrer
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <div className="p-8 border-b border-gray-50 bg-brand-teal/5">
                    <h4 className="text-sm font-bold text-brand-teal mb-4 flex items-center gap-2">
                      <Boxes className="w-4 h-4" />
                      Stock restant après distribution
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {remainingInventory.map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-brand-teal/10 shadow-sm">
                          <p className="text-xs text-gray-500 font-bold mb-1">{item.type}</p>
                          <p className="text-lg font-black text-gray-900">{item.remainingQuantity} <span className="text-xs font-medium text-gray-400">unités</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Table>
                    <TableHeader className="bg-white sticky top-0 z-10">
                      <TableRow className="hover:bg-transparent border-b border-gray-100">
                        <TableHead className="w-[140px] font-black text-gray-900 h-14">N° Facture</TableHead>
                        <TableHead className="font-black text-gray-900 h-14">Date</TableHead>
                        <TableHead className="font-black text-gray-900 h-14">Client</TableHead>
                        <TableHead className="font-black text-gray-900 h-14">Contenu</TableHead>
                        <TableHead className="text-right font-black text-gray-900 h-14">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 group">
                          <TableCell className="font-bold text-brand-teal py-5">
                            <span className="bg-brand-teal/10 px-3 py-1 rounded-lg">
                              {invoice.number}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600 font-bold py-5">
                            {formatInvoiceDate(new Date(invoice.date))}
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="font-bold text-gray-900">{invoice.client.name}</div>
                            <div className="text-[10px] text-brand-teal font-black uppercase tracking-wider">{invoice.client.city}</div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex flex-wrap gap-2">
                              {invoice.items.map((item, idx) => (
                                <Badge key={idx} variant="outline" className="text-[11px] h-7 bg-white border-gray-200 text-gray-700 font-bold px-3 rounded-xl shadow-sm">
                                  {item.quantity} × {item.description}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-5">
                          <div className="font-black text-gray-900 text-lg">{invoice.total.toLocaleString()} <span className="text-xs font-bold text-gray-400">MAD</span></div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
