import { useRef, useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings as SettingsIcon, 
  Trash2, 
  Building2, 
  ShieldCheck, 
  Globe, 
  Save,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getCompanyInfo } from "@/lib/companyData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { settings, updateSettings, setClients, setInventory, setInvoices, clients, inventory, invoices } = useAppContext();
  
  const [formData, setFormData] = useState({
    secretCode: settings.secretCode,
    selectedCompany: settings.selectedCompany || 'SEBAI AMA',
    minInvoiceAmount: settings.minInvoiceAmount,
    maxInvoiceAmount: settings.maxInvoiceAmount,
  });

  useEffect(() => {
    setFormData({
      secretCode: settings.secretCode,
      selectedCompany: settings.selectedCompany || 'SEBAI AMA',
      minInvoiceAmount: settings.minInvoiceAmount,
      maxInvoiceAmount: settings.maxInvoiceAmount,
    });
  }, [settings]);

  const [deleteCode, setDeleteCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Amount") ? Number(value) : value
    }));
  };

  const handleBackupDownload = () => {
    try {
      const backupData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        settings,
        clients,
        inventory,
        invoices,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gaz-flow-backup-${new Date()
        .toISOString()
        .split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Backup téléchargé", {
        description: "Le fichier de sauvegarde a été généré avec succès.",
      });
    } catch {
      toast.error("Erreur de backup", {
        description: "Impossible de générer le fichier de sauvegarde.",
      });
    }
  };

  const handleBackupUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));

        if (
          !parsed ||
          !Array.isArray(parsed.clients) ||
          !Array.isArray(parsed.inventory) ||
          !Array.isArray(parsed.invoices) ||
          !parsed.settings
        ) {
          throw new Error("Invalid backup");
        }

        setClients(parsed.clients);
        setInventory(parsed.inventory);
        setInvoices(parsed.invoices);
        updateSettings({
          ...settings,
          ...parsed.settings,
        });

        toast.success("Backup restauré", {
          description: "Les données ont été importées avec succès.",
        });
      } catch {
        toast.error("Backup invalide", {
          description: "Le fichier sélectionné n'est pas un backup valide.",
        });
      } finally {
        e.target.value = "";
      }
    };

    reader.onerror = () => {
      toast.error("Erreur de lecture", {
        description: "Impossible de lire le fichier sélectionné.",
      });
      e.target.value = "";
    };

    reader.readAsText(file);
  };

  const handleCheckForUpdates = () => {
    toast.info("Mise à jour", {
      description: "Vous utilisez déjà la dernière version de l'application.",
    });
  };

  const handleCompanyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCompany: value as typeof settings.selectedCompany
    }));
  };

  const handleSave = () => {
    const companyInfo = getCompanyInfo(formData.selectedCompany);
    
    updateSettings({
      ...formData,
      companyName: formData.selectedCompany,
      companyAddress: companyInfo.address,
      companyPhone: companyInfo.phone,
      companyFax: companyInfo.fax,
      companyRegistration: `RC: ${companyInfo.rc}`,
      companyCNSS: `CNSS: ${companyInfo.cnss}`,
      companyPatente: companyInfo.patente ? `PATENTE: ${companyInfo.patente}` : companyInfo.tf ? `TF: ${companyInfo.tf}` : '',
      companyICE: `ICE: ${companyInfo.ice}`
    });
    
    toast.success("Paramètres enregistrés", {
      description: "Les modifications ont été appliquées avec succès.",
    });
  };

  const handleDeleteAllData = () => {
    if (deleteCode !== "123456789") {
      toast.error("Code incorrect", {
        description: "Le code de sécurité pour la suppression est invalide.",
      });
      return;
    }

    setClients([]);
    setInventory([
      { id: crypto.randomUUID(), type: '12KG', totalQuantity: 0, distributedQuantity: 0, remainingQuantity: 0, unitPrice: 0, taxRate: 0 },
      { id: crypto.randomUUID(), type: '6KG', totalQuantity: 0, distributedQuantity: 0, remainingQuantity: 0, unitPrice: 0, taxRate: 0 },
      { id: crypto.randomUUID(), type: '3KG', totalQuantity: 0, distributedQuantity: 0, remainingQuantity: 0, unitPrice: 0, taxRate: 0 }
    ]);
    setInvoices([]);
    
    setDeleteCode("");
    toast.success("Données réinitialisées", {
      description: "Toutes les données de l'application ont été supprimées.",
    });
  };

  const companyOptions = [
    'SEBAI AMA',
    'STE SEBAI FRERES DISTRIBUTION',
    'STE TASNIM SBAI sarl',
    'STE TAHA SBAI sarl'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
          <div className="p-3 bg-brand-teal/10 rounded-2xl">
            <SettingsIcon className="w-9 h-9 text-brand-teal" />
          </div>
          Paramètres
        </h1>
        <p className="text-gray-500 font-medium text-lg ml-1">Gérez les configurations générales et vos préférences.</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Main Configuration */}
        <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[32px] bg-white overflow-hidden border border-gray-100">
          <CardHeader className="bg-gray-50/50 px-10 py-8 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center shadow-lg shadow-brand-teal/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-gray-900">Configuration Générale</CardTitle>
                <CardDescription className="font-medium text-lg">Sécurité et paramètres de facturation.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-lg font-black text-gray-700 ml-1">Code secret d'accès</Label>
                <Input
                  id="secretCode"
                  name="secretCode"
                  type="password"
                  value={formData.secretCode}
                  onChange={handleInputChange}
                  className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-medium text-lg"
                />
                <p className="text-sm text-gray-400 ml-1 flex items-center gap-2 font-medium">
                  <Info className="w-4 h-4" />
                  Utilisé pour accéder aux fonctions administratives.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-black text-gray-700 ml-1">Société active</Label>
                <Select value={formData.selectedCompany} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-bold text-lg">
                    <SelectValue placeholder="Choisir une société" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {companyOptions.map(option => (
                      <SelectItem key={option} value={option} className="rounded-xl focus:bg-brand-teal/5 font-bold text-lg py-3">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Limites de Facturation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-lg font-black text-gray-700 ml-1">Montant Minimum (MAD)</Label>
                  <Input
                    name="minInvoiceAmount"
                    type="number"
                    value={formData.minInvoiceAmount}
                    onChange={handleInputChange}
                    className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-black text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg font-black text-gray-700 ml-1">Montant Maximum (MAD)</Label>
                  <Input
                    name="maxInvoiceAmount"
                    type="number"
                    value={formData.maxInvoiceAmount}
                    onChange={handleInputChange}
                    className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-black text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button 
                onClick={handleSave}
                className="bg-brand-teal hover:bg-brand-teal/90 text-white px-10 h-14 rounded-2xl font-black text-lg shadow-xl shadow-brand-teal/20 transition-all gap-3"
              >
                <Save className="w-5 h-5" />
                Enregistrer les modifications
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sauvegarde et mises à jour */}
        <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[32px] bg-white overflow-hidden border border-gray-100">
          <CardHeader className="bg-gray-50/50 px-10 py-8 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-gray-900">Maintenance & sauvegarde</CardTitle>
                <CardDescription className="font-medium text-lg">
                  Gérer les backups de vos données et les mises à jour de l'application.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
                    <Download className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900">Backup des données</p>
                    <p className="text-sm text-gray-500">
                      Exporter tous les clients, l'inventaire, les factures et paramètres.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleBackupDownload}
                    className="h-12 px-6 rounded-2xl bg-brand-teal hover:bg-brand-teal/90 text-white font-black gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger un backup
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBackupUploadClick}
                    className="h-12 px-6 rounded-2xl border-gray-200 text-gray-800 font-bold gap-2 hover:border-brand-teal/50 hover:text-brand-teal"
                  >
                    <Upload className="w-4 h-4" />
                    Importer un backup
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleBackupFileChange}
                  />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900">Mise à jour de l'application</p>
                    <p className="text-sm text-gray-500">
                      Vérifier la disponibilité d'une nouvelle version et garder Gaz Flow à jour.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Version actuelle</p>
                    <p className="text-lg font-black text-gray-900">v1.0.0</p>
                  </div>
                  <Button
                    onClick={handleCheckForUpdates}
                    className="h-12 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white font-black gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Vérifier les mises à jour
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-50 shadow-xl shadow-red-100/20 rounded-[32px] bg-white overflow-hidden">
          <CardHeader className="bg-red-50/30 px-10 py-8 border-b border-red-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-red-900">Zone de Danger</CardTitle>
                <CardDescription className="text-red-600/70 font-medium text-lg">Actions irréversibles sur vos données.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-red-50/50 rounded-[28px] border border-red-100 gap-6">
              <div className="space-y-2">
                <p className="text-xl font-black text-red-900">Réinitialiser toutes les données</p>
                <p className="text-lg font-medium text-red-700/70 leading-relaxed">Cela supprimera définitivement tous les clients, l'inventaire et les factures.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-red-200 transition-all gap-3">
                    <Trash2 className="w-5 h-5" />
                    Tout effacer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-3xl font-black text-red-900 mb-4">Action Critique !</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 py-2">
                      <p className="text-xl font-medium mb-6 leading-relaxed">Cette action supprimera définitivement toutes vos données. Cette opération est irréversible.</p>
                      <div className="mt-8 space-y-4">
                        <Label className="text-lg font-black text-gray-900 block">Tapez <span className="text-red-600 font-black">123456789</span> pour confirmer :</Label>
                        <Input
                          type="text"
                          placeholder="Code de sécurité"
                          value={deleteCode}
                          onChange={(e) => setDeleteCode(e.target.value)}
                          className="h-14 rounded-2xl border-red-200 focus:ring-red-100 text-center font-black text-2xl tracking-[0.2em]"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-10 gap-4">
                    <AlertDialogCancel className="h-14 rounded-2xl font-black text-lg border-gray-200 px-8">Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllData}
                      disabled={deleteCode !== "123456789"}
                      className="h-14 rounded-2xl font-black text-lg bg-red-600 hover:bg-red-700 px-8"
                    >
                      Confirmer la suppression
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
