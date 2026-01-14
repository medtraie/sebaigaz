
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { generateDistributionDays, getCurrentInvoiceNumber } from "@/lib/utils";
import ManualInvoiceForm from "@/components/ManualInvoiceForm";
import { 
  Calendar, 
  Settings2, 
  Hash, 
  EyeOff, 
  Plus, 
  X,
  ClipboardList,
  Info,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ManualDistributionPage() {
  const { 
    clients, inventory, settings, setInvoices, setInventory, invoices,
    setInvoiceStartNumber 
  } = useAppContext();
  
  const [distributionDay, setDistributionDay] = useState(new Date().getDate());
  const [distributionMonth, setDistributionMonth] = useState(new Date().getMonth() + 1);
  const [distributionYear, setDistributionYear] = useState(new Date().getFullYear());
  const [distributionDays, setDistributionDays] = useState<number[]>([]);
  const [excludedHolidays, setExcludedHolidays] = useState<number[]>([]);
  const [newHoliday, setNewHoliday] = useState<string>("");
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

  const updateDistributionDays = () => {
    const customDays = settings.customDistributionDaysByMonth?.[monthKey] || [];
    const days = generateDistributionDays(distributionYear, distributionMonth, excludedHolidays, customDays);
    setDistributionDays(days);
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

  const handleDayChange = (value: string) => {
    setDistributionDay(parseInt(value));
  };

  const handleMonthChange = (value: string) => {
    setDistributionMonth(parseInt(value));
    updateDistributionDays();
  };

  const handleYearChange = (value: string) => {
    setDistributionYear(parseInt(value));
    updateDistributionDays();
  };

  const daysArr = Array.from({ length: 31 }, (_, i) => i + 1);

  const months = [
    { value: 1, label: "Janvier" },
    { value: 2, label: "Février" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Avril" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" },
    { value: 8, label: "Août" },
    { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Décembre" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() + i
  );

  const currentInvoiceNumber = getCurrentInvoiceNumber();
  const nextInvoiceNumber = currentInvoiceNumber + 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-brand-teal/10 rounded-2xl">
              <ClipboardList className="w-8 h-8 text-brand-teal" />
            </div>
            Distribution Manuelle
          </h1>
          <p className="text-gray-500 font-medium">Créez des factures manuellement pour une date spécifique.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Settings */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-gray-100">
            <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Date de Distribution</CardTitle>
                  <CardDescription className="font-medium">Sélectionnez la date souhaitée pour la facturation.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Jour</Label>
                  <Select value={distributionDay.toString()} onValueChange={handleDayChange}>
                    <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:ring-brand-teal focus:border-brand-teal transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100">
                      {daysArr.map((day) => (
                        <SelectItem key={day} value={day.toString()} className="rounded-xl focus:bg-brand-teal focus:text-white">{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Mois</Label>
                  <Select value={distributionMonth.toString()} onValueChange={handleMonthChange}>
                    <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:ring-brand-teal focus:border-brand-teal transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100">
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()} className="rounded-xl focus:bg-brand-teal focus:text-white">{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Année</Label>
                  <Select value={distributionYear.toString()} onValueChange={handleYearChange}>
                    <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:ring-brand-teal focus:border-brand-teal transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()} className="rounded-xl focus:bg-brand-teal focus:text-white">{year}</SelectItem>
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
                  <p className="text-sm font-bold text-brand-teal">Dernier N° : FAC/{new Date().getFullYear()}/{currentInvoiceNumber}</p>
                  <p className="text-xs text-brand-teal/70 mt-1 leading-relaxed">Prochain N° : FAC/{new Date().getFullYear()}/{nextInvoiceNumber}</p>
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
                  <CardTitle className="text-xl font-bold">Options Avancées</CardTitle>
                  <CardDescription className="font-medium">Paramètres supplémentaires pour la facturation.</CardDescription>
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
                      <p className="text-sm font-bold text-gray-900">Numérotation personnalisée</p>
                      <p className="text-xs text-gray-500">Définir manuellement le numéro.</p>
                    </div>
                  </div>
                  <Switch checked={useCustomInvoiceNumber} onCheckedChange={setUseCustomInvoiceNumber} />
                </div>

                {useCustomInvoiceNumber && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <Input
                      type="number"
                      placeholder="Ex: 20240001"
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
                      <p className="text-xs text-gray-500">Masquer le jour lors de l'impression.</p>
                    </div>
                  </div>
                  <Switch checked={hideDay} onCheckedChange={setHideDay} />
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
                              if (isHoliday) {
                                handleRemoveHoliday(day);
                              } else {
                                const inputValue = String(day);
                                setNewHoliday(inputValue);
                                setExcludedHolidays([...excludedHolidays, day]);
                              }
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
                    {excludedHolidays.map((day) => (
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
                      <div className="flex flex-col items-center justify-center py-8 w-full text-gray-400 bg-gray-50/50 rounded-[24px] border border-dashed border-gray-200">
                        <CalendarDays className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-xs font-medium italic">Aucun jour férié ajouté.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Invoice Form */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-gray-100 h-full flex flex-col">
            <CardHeader className="bg-brand-teal p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black">Créer une Facture</CardTitle>
                  <CardDescription className="text-white/90 text-lg mt-1 font-medium">
                    Détails de la facture pour le {distributionDay} {months.find(m => m.value === distributionMonth)?.label} {distributionYear}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
              <ManualInvoiceForm 
                selectedDay={distributionDay}
                selectedMonth={distributionMonth}
                selectedYear={distributionYear}
                startingInvoiceNumber={useCustomInvoiceNumber ? startingInvoiceNumber : undefined}
                hideDay={hideDay}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
