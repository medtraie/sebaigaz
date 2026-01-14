
import { useState, useRef, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Upload, 
  UserPlus, 
  Users, 
  Search, 
  Trash2, 
  FileSpreadsheet, 
  MapPin, 
  Fingerprint,
} from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

export default function ClientsPage() {
  const { clients, setClients } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  interface ExcelClientRow {
    Nom?: string;
    Patente?: string | number;
    ICE?: string | number;
    Adresse?: string;
  }
  const [newClient, setNewClient] = useState({ 
    name: "", 
    code: "", 
    ice: "", 
    address: "" 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.ice && client.ice.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  const handleAddClient = () => {
    if (!newClient.name || !newClient.code) {
      toast.error("Données manquantes", {
        description: "Le nom du client et le code sont obligatoires.",
      });
      return;
    }

    const clientData = {
      id: crypto.randomUUID(),
      name: newClient.name,
      code: newClient.code,
      ...(newClient.ice && { ice: newClient.ice }),
      ...(newClient.address && { address: newClient.address })
    };

    setClients([...clients, clientData]);
    setNewClient({ name: "", code: "", ice: "", address: "" });
    toast.success("Client ajouté", {
      description: `${newClient.name} a été ajouté à la liste.`,
    });
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((client) => client.id !== id));
    toast.success("Client supprimé");
  };

  const handleDeleteAllClients = () => {
    setClients([]);
    toast.success("Tous les clients ont été supprimés");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length > 0) {
          const firstRow = jsonData[0] as ExcelClientRow;
          if (!("Nom" in firstRow) || !("Patente" in firstRow)) {
            toast.error("Format invalide", {
              description: "Le fichier Excel doit contenir les colonnes 'Nom' et 'Patente'.",
            });
            return;
          }

          const importedClients = (jsonData as ExcelClientRow[]).map((row) => ({
            id: crypto.randomUUID(),
            name: row.Nom || "",
            code: String(row.Patente ?? ""),
            ...(row.ICE ? { ice: String(row.ICE) } : {}),
            ...(row.Adresse ? { address: String(row.Adresse) } : {})
          }));

          setClients([...clients, ...importedClients]);
          toast.success("Importation réussie", {
            description: `${importedClients.length} clients importés.`,
          });
        } else {
          toast.error("Fichier vide", {
            description: "Aucune donnée trouvée dans le fichier Excel.",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la lecture du fichier Excel:", error);
        toast.error("Erreur de lecture", {
          description: "Échec de la lecture du fichier Excel.",
        });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-brand-teal/10 rounded-[22px]">
              <Users className="w-9 h-9 text-brand-teal" />
            </div>
            Gestion des Clients
          </h1>
          <p className="text-gray-500 font-medium text-lg pl-1">Gérez la base de données clients et importez vos fichiers Excel.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleImportClick} 
            variant="outline"
            className="h-14 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all gap-3 rounded-[20px] px-6 font-bold shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <span className="hidden sm:inline">Importer d'Excel</span>
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="hidden"
          />
          {clients.length > 0 && (
            <ConfirmDeleteDialog
              title="Supprimer tous les clients"
              description="Êtes-vous sûr de vouloir supprimer tous les clients ? Cette action est irréversible."
              onConfirm={handleDeleteAllClients}
              triggerButtonText="Tout Effacer"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Add Client Form */}
        <div className="lg:col-span-4">
          <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[32px] bg-white sticky top-24 overflow-hidden border border-gray-100">
            <CardHeader className="bg-gray-50/50 pb-8 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center shadow-lg shadow-brand-teal/20">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-gray-900">Nouveau Client</CardTitle>
                  <CardDescription className="font-medium">Ajoutez manuellement un client à votre liste.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Nom Complet *</label>
                <Input
                  placeholder="Ex: Entreprise Gaz"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">N° Patente / Code *</label>
                <Input
                  placeholder="Ex: 12345678"
                  value={newClient.code}
                  onChange={(e) => setNewClient({ ...newClient, code: e.target.value })}
                  className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">ICE (Optionnel)</label>
                <Input
                  placeholder="Ex: 000123456"
                  value={newClient.ice}
                  onChange={(e) => setNewClient({ ...newClient, ice: e.target.value })}
                  className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Adresse (Optionnel)</label>
                <Input
                  placeholder="Ex: Rue 123, Casablanca"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-bold"
                />
              </div>
              <Button 
                onClick={handleAddClient} 
                className="w-full h-14 bg-brand-teal hover:bg-brand-teal/90 text-white text-lg font-black rounded-2xl shadow-xl shadow-brand-teal/20 transition-all transform active:scale-[0.98] mt-4"
              >
                Ajouter le Client
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors w-6 h-6" />
            <Input
              placeholder="Rechercher par nom, code ou ICE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-16 pl-14 pr-6 bg-white border-none shadow-xl shadow-gray-100/50 rounded-3xl focus:ring-4 focus:ring-brand-teal/10 transition-all text-xl font-bold"
            />
          </div>

          <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[32px] bg-white overflow-hidden border border-gray-100">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">Client</TableHead>
                      <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">Détails</TableHead>
                      <TableHead className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-brand-teal/[0.02] transition-colors border-b border-gray-50 last:border-0 group">
                          <TableCell className="px-8 py-6">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-brand-teal/10 rounded-2xl flex items-center justify-center text-brand-teal font-black text-2xl uppercase shadow-sm border border-brand-teal/5">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-lg leading-tight mb-1">{client.name}</p>
                                <p className="text-sm text-gray-500 font-bold flex items-center gap-2">
                                  <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Fingerprint className="w-3 h-3" />
                                  </div>
                                  Code: {client.code}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="space-y-2">
                              {client.ice && (
                                <p className="text-xs font-black text-brand-teal bg-brand-teal/5 inline-flex px-3 py-1 rounded-full border border-brand-teal/10">
                                  ICE: {client.ice}
                                </p>
                              )}
                              {client.address && (
                                <p className="text-sm text-gray-500 font-bold flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-brand-teal" />
                                  {client.address}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-8 py-6 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClient(client.id)}
                              className="h-12 w-12 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group-hover:opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                              <Users className="w-10 h-10 opacity-20" />
                            </div>
                            <div>
                              <p className="text-2xl font-black text-gray-900 mb-1">Aucun client trouvé</p>
                              <p className="text-gray-500 font-medium">Essayez un autre terme de recherche ou ajoutez un nouveau client.</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
