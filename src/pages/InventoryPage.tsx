
import { useState, useEffect, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Package, 
  RotateCcw, 
  Save, 
  TrendingUp, 
  AlertCircle, 
  ArrowRightLeft,
  DollarSign,
  Percent
} from "lucide-react";

const desiredOrder = ['12KG', '6KG', '3KG', 'BNG 12 KG', 'PROPANE 34 KG', 'DETENDEUR CLIC-ON'] as const;

export default function InventoryPage() {
  const { inventory, setInventory, resetInventoryToDefault } = useAppContext();
  
  const sortedInventory = useMemo(() => {
    return [...inventory].sort((a, b) => {
      const indexA = desiredOrder.indexOf(a.type);
      const indexB = desiredOrder.indexOf(b.type);
      return indexA - indexB;
    });
  }, [inventory]);
  
  const [editedInventory, setEditedInventory] = useState(() => 
    sortedInventory.map(item => ({ ...item }))
  );

  useEffect(() => {
    setEditedInventory(sortedInventory.map(item => ({ ...item })));
  }, [sortedInventory]);

  const handleChange = (
    index: number,
    field: 'totalQuantity' | 'unitPrice' | 'taxRate',
    value: string
  ) => {
    const newInventory = [...editedInventory];
    
    // Handle empty string as 0
    const numValue = value === "" ? 0 : Number(value);
    
    if (value !== "" && (isNaN(numValue) || numValue < 0)) return;
    
    newInventory[index] = {
      ...newInventory[index],
      [field]: numValue,
    };
    
    if (field === 'totalQuantity') {
      newInventory[index].remainingQuantity = numValue - newInventory[index].distributedQuantity;
    }
    
    setEditedInventory(newInventory);
  };

  const saveChanges = () => {
    setInventory(editedInventory);
    toast.success("Inventaire mis à jour", {
      description: "Les modifications ont été enregistrées avec succès.",
    });
  };

  const handleResetInventory = () => {
    resetInventoryToDefault();
    toast.info("Inventaire réinitialisé", {
      description: "Les types de bouteilles par défaut ont été restaurés.",
    });
  };

  const totalValueHT = editedInventory.reduce((sum, item) => sum + item.totalQuantity * item.unitPrice, 0);
  const totalTax = editedInventory.reduce((sum, item) => sum + (item.totalQuantity * item.unitPrice * item.taxRate / 100), 0);
  const totalValueTTC = totalValueHT + totalTax;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-brand-teal/10 rounded-[22px]">
              <Package className="w-9 h-9 text-brand-teal" />
            </div>
            Gestion de l'Inventaire
          </h1>
          <p className="text-gray-500 font-medium text-lg pl-1">Gérez le stock, les prix et les taxes de distribution.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleResetInventory} 
            variant="outline"
            className="h-14 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-all gap-3 rounded-[20px] px-6 font-bold shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </Button>
          <Button 
            onClick={saveChanges} 
            className="h-14 bg-brand-teal hover:bg-brand-teal/90 text-white text-lg font-black rounded-[20px] shadow-xl shadow-brand-teal/20 transition-all gap-3 px-8"
          >
            <Save className="w-5 h-5" />
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <Card className="bg-white border-none shadow-xl shadow-gray-200/50 rounded-[32px] overflow-hidden border border-gray-100">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Valeur Totale (HT)</p>
              <p className="text-3xl font-black text-gray-900">{totalValueHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-gray-400">MAD</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-xl shadow-gray-200/50 rounded-[32px] overflow-hidden border border-gray-100">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center shadow-sm">
              <Percent className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Montant des Taxes</p>
              <p className="text-3xl font-black text-gray-900">{totalTax.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-gray-400">MAD</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-brand-teal border-none shadow-2xl shadow-brand-teal/30 rounded-[32px] overflow-hidden">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white/70 uppercase tracking-widest mb-1">Valeur Totale (TTC)</p>
              <p className="text-3xl font-black text-white">{totalValueTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-white/70">MAD</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table Card */}
      <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[32px] overflow-hidden bg-white border border-gray-100">
        <CardHeader className="border-b border-gray-50 px-10 py-8 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center shadow-lg shadow-brand-teal/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-gray-900">Stock et Prix</CardTitle>
              <CardDescription className="font-medium">Mettez à jour les quantités et les prix unitaires par type de bouteille.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">Type de Bouteille</TableHead>
                  <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Quantité Totale</TableHead>
                  <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Distribuée</TableHead>
                  <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Restante</TableHead>
                  <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Prix Unitaire (MAD)</TableHead>
                  <TableHead className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Taxe (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedInventory.map((item, index) => (
                  <TableRow key={item.type} className="hover:bg-brand-teal/[0.02] transition-colors border-b border-gray-50 last:border-0">
                    <TableCell className="px-10 py-6">
                      <div className="font-black text-gray-900 text-lg">{item.type}</div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex justify-center">
                        <Input
                          type="number"
                          min="0"
                          value={item.totalQuantity}
                          onChange={(e) => handleChange(index, 'totalQuantity', e.target.value)}
                          className="w-28 h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal text-center font-black transition-all text-lg"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black bg-blue-50 text-blue-600 border border-blue-100">
                        {item.distributedQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <span className={cn(
                        "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black border",
                        item.remainingQuantity <= 5 ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                      )}>
                        {item.remainingQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex justify-center">
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleChange(index, 'unitPrice', e.target.value)}
                          className="w-32 h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal text-center font-black transition-all text-lg"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-10 py-6">
                      <div className="flex justify-center">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxRate}
                          onChange={(e) => handleChange(index, 'taxRate', e.target.value)}
                          className="w-24 h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal text-center font-black transition-all text-lg"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[32px] overflow-hidden bg-white border border-gray-100">
        <CardHeader className="border-b border-gray-50 px-10 py-8 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-teal" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-gray-900">Résumé Financier</CardTitle>
              <CardDescription className="font-medium">Aperçu de la valeur de votre stock par catégorie.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">Type de Bouteille</TableHead>
                  <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">Valeur (HT)</TableHead>
                  <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">Taxe</TableHead>
                  <TableHead className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">Valeur Totale (TTC)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedInventory.map((item) => {
                  const valueHT = item.totalQuantity * item.unitPrice;
                  const taxAmount = valueHT * (item.taxRate / 100);
                  const valueTTC = valueHT + taxAmount;
                  
                  return (
                    <TableRow key={`summary-${item.type}`} className="hover:bg-brand-teal/[0.02] transition-colors border-b border-gray-50 last:border-0">
                      <TableCell className="px-10 py-6 font-black text-gray-900 text-lg">{item.type}</TableCell>
                      <TableCell className="py-6 text-left font-bold text-gray-600">{valueHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</TableCell>
                      <TableCell className="py-6 text-left font-bold text-gray-600">{taxAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</TableCell>
                      <TableCell className="px-10 py-6 text-left font-black text-brand-teal text-lg">{valueTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tips / Info */}
      <div className="bg-brand-teal/5 border border-brand-teal/10 rounded-[28px] p-8 flex items-start gap-6 shadow-sm">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <AlertCircle className="w-7 h-7 text-brand-teal" />
        </div>
        <div>
          <h4 className="text-brand-teal font-black text-xl mb-2">Note sur l'Inventaire</h4>
          <p className="text-gray-600 text-lg font-medium leading-relaxed">
            Les modifications effectuées ici affecteront le calcul des factures futures et le suivi du stock.
            Assurez-vous de vérifier les prix unitaires avant d'enregistrer.
          </p>
        </div>
      </div>
    </div>
  );
}
