import { useState, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Search, 
  Calendar as CalendarIcon, 
  FileText, 
  FilterX, 
  ChevronRight,
  Trash2,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Package
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { PDFViewer } from "@/components/PDFViewer";
import { jsPDF } from "jspdf";
import { InvoicePDF } from "@/components/InvoicePDF";
import { Invoice } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export default function InvoicesPage() {
  const { 
    invoices, 
    setInvoices,
    selectedInvoices, 
    toggleInvoiceSelection, 
    selectAllInvoices, 
    deselectAllInvoices 
  } = useAppContext();
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  const [filterInvoiceNumber, setFilterInvoiceNumber] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesInvoiceNumber = filterInvoiceNumber === "" || 
        invoice.number.toLowerCase().includes(filterInvoiceNumber.toLowerCase());
      
      const matchesClient = filterClient === "" || 
        invoice.client.name.toLowerCase().includes(filterClient.toLowerCase());
      
      const matchesDate = !filterDate || invoice.date === format(filterDate, 'dd/MM/yyyy');
      
      return matchesInvoiceNumber && matchesClient && matchesDate;
    });
  }, [invoices, filterInvoiceNumber, filterClient, filterDate]);

  const stats = useMemo(() => {
    const totalTTC = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalHT = filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalTax = filteredInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    return { totalTTC, totalHT, totalTax };
  }, [filteredInvoices]);

  const handlePrintInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
  };

  const handleCloseViewer = () => {
    setViewingInvoice(null);
  };

  const handleDeleteAllInvoices = () => {
    setInvoices([]);
    deselectAllInvoices();
    toast.success("Toutes les factures ont été supprimées avec succès");
  };

  const clearFilters = () => {
    setFilterInvoiceNumber("");
    setFilterClient("");
    setFilterDate(undefined);
  };

  const getTargetInvoices = (): Invoice[] => {
    const selected = invoices.filter(inv => selectedInvoices.includes(inv.id));
    if (selected.length > 0) return selected;
    return invoices;
  };

  const handleExportToExcel = () => {
    if (invoices.length === 0) {
      toast.error("Aucune facture à exporter");
      return;
    }

    const invoiceData = invoices.map(invoice => {
      const itemsMap: Record<string, number> = {};
      invoice.items.forEach(item => {
        itemsMap[item.description] = item.quantity;
      });

      return {
        'Date': invoice.date,
        'N° Facture': invoice.number,
        'Client': invoice.client.name,
        '3 KG': itemsMap['3KG'] || 0,
        '6 KG': itemsMap['6KG'] || 0,
        '12 KG': itemsMap['12KG'] || 0,
        'Détendeur': itemsMap['DETENDEUR CLIC-ON'] || 0,
        'Propane 34 KG': itemsMap['PROPANE 34 KG'] || 0,
        'BNG 12 KG': itemsMap['BNG 12 KG'] || 0,
        'Sous-total': invoice.subtotal.toFixed(2),
        'TVA': invoice.taxAmount.toFixed(2),
        'Total TTC': invoice.total.toFixed(2)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(invoiceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Factures");
    XLSX.writeFile(workbook, `Invoices_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    toast.success("Fichier Excel exporté avec succès");
  };

  const handleDownloadCombinedPDF = async () => {
    const target = getTargetInvoices();
    if (target.length === 0) {
      toast.error("Aucune facture à inclure dans le PDF");
      return;
    }
    const doc = new jsPDF();
    for (let i = 0; i < target.length; i++) {
      const inv = target[i];
      if (i > 0) doc.addPage();
      await InvoicePDF.generateInPDF(inv, doc);
    }
    doc.save(`Factures_Combinées_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    toast.success("PDF combiné téléchargé");
  };

  const handleDownloadZip = async () => {
    const target = getTargetInvoices();
    if (target.length === 0) {
      toast.error("Aucune facture à inclure dans le ZIP");
      return;
    }
    const zip = new JSZip();
    for (const inv of target) {
      const doc = await InvoicePDF.generate(inv);
      const blob = doc.output('blob');
      const safeName = inv.number.replace(/[\\/:*?"<>|]/g, "_");
      zip.file(`${safeName}.pdf`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `Factures_${format(new Date(), 'dd-MM-yyyy')}.zip`);
    toast.success("Archive ZIP téléchargée");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-brand-teal/10 rounded-[22px]">
              <Receipt className="w-9 h-9 text-brand-teal" />
            </div>
            Gestion des Factures
          </h1>
          <p className="text-gray-500 font-medium text-lg pl-1">Consultez, filtrez et exportez les factures générées.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleExportToExcel} 
            variant="outline"
            className="h-14 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all gap-3 rounded-[20px] px-6 font-bold shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <span className="hidden sm:inline">Exporter vers Excel</span>
          </Button>
          <Button 
            onClick={handleDownloadCombinedPDF} 
            variant="outline"
            className="h-14 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all gap-3 rounded-[20px] px-6 font-bold shadow-sm"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="hidden sm:inline">Télécharger PDF Combiné</span>
          </Button>
          <Button 
            onClick={handleDownloadZip} 
            variant="outline"
            className="h-14 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-all gap-3 rounded-[20px] px-6 font-bold shadow-sm"
          >
            <Download className="w-5 h-5 text-purple-600" />
            <span className="hidden sm:inline">Télécharger en ZIP</span>
          </Button>
          {invoices.length > 0 && (
            <ConfirmDeleteDialog
              title="Supprimer toutes les factures"
              description="Êtes-vous sûr de vouloir supprimer toutes les factures ? Cette action est irréversible."
              onConfirm={handleDeleteAllInvoices}
              triggerButtonText="Tout effacer"
            />
          )}
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
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Total Hors Taxe (HT)</p>
              <p className="text-3xl font-black text-gray-900">{stats.totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-gray-400">MAD</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-xl shadow-gray-200/50 rounded-[32px] overflow-hidden border border-gray-100">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-brand-teal" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Total Toutes Taxes (TTC)</p>
              <p className="text-3xl font-black text-gray-900">{stats.totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-gray-400">MAD</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-xl shadow-gray-200/50 rounded-[32px] overflow-hidden border border-gray-100">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center shadow-sm">
              <Package className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Nombre de Factures</p>
              <p className="text-3xl font-black text-gray-900">{filteredInvoices.length} <span className="text-sm font-bold text-gray-400">Facture{filteredInvoices.length > 1 ? 's' : ''}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[32px] bg-white border border-gray-100">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal transition-colors" />
              <Input
                placeholder="N° de Facture..."
                value={filterInvoiceNumber}
                onChange={(e) => setFilterInvoiceNumber(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-medium text-lg"
              />
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-teal transition-colors" />
              <Input
                placeholder="Nom du Client..."
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all font-medium text-lg"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-14 justify-start text-left font-bold rounded-2xl bg-gray-50 border-gray-100 hover:bg-gray-100 transition-all text-lg",
                    !filterDate && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                  {filterDate ? format(filterDate, "dd/MM/yyyy") : "Filtrer par date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-none" align="start">
                <Calendar
                  mode="single"
                  selected={filterDate}
                  onSelect={setFilterDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="h-14 rounded-2xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all gap-3 font-black text-lg"
            >
              <FilterX className="w-5 h-5" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[32px] overflow-hidden bg-white border border-gray-100">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="w-[80px] px-10 py-6">
                    <Checkbox 
                      checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) selectAllInvoices();
                        else deselectAllInvoices();
                      }}
                      className="w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-brand-teal data-[state=checked]:border-brand-teal"
                    />
                  </TableHead>
                  <TableHead className="px-6 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">N° Facture</TableHead>
                  <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">Client</TableHead>
                  <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">Date</TableHead>
                  <TableHead className="py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-right">Montant Total</TableHead>
                  <TableHead className="px-10 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-brand-teal/[0.02] transition-colors border-b border-gray-50 last:border-0 group">
                      <TableCell className="px-10 py-6">
                        <Checkbox 
                          checked={selectedInvoices.includes(invoice.id)}
                          onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                          className="w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-brand-teal data-[state=checked]:border-brand-teal"
                        />
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <span className="font-black text-gray-900 bg-gray-100 px-4 py-1.5 rounded-full text-sm">
                          {invoice.number}
                        </span>
                      </TableCell>
                      <TableCell className="py-6 font-bold text-gray-700 text-lg">{invoice.client.name}</TableCell>
                      <TableCell className="py-6 text-gray-500 font-medium">{invoice.date}</TableCell>
                      <TableCell className="py-6 text-right font-black text-brand-teal text-lg">
                        {invoice.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-brand-teal/60">MAD</span>
                      </TableCell>
                      <TableCell className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrintInvoice(invoice)}
                            className="h-12 w-12 text-gray-400 hover:text-brand-teal hover:bg-brand-teal/5 rounded-2xl transition-all"
                          >
                            <Printer className="w-6 h-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setInvoices(invoices.filter(inv => inv.id !== invoice.id));
                              toast.success("Facture supprimée");
                            }}
                            className="h-12 w-12 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-6 h-6" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mb-6">
                          <FileText className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="text-2xl font-black text-gray-400 mb-2">Aucune facture trouvée</p>
                        <p className="text-lg font-medium">Ajustez les filtres ou créez de nouvelles factures.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {viewingInvoice && (
        <PDFViewer 
          invoice={viewingInvoice} 
          onClose={handleCloseViewer} 
        />
      )}
    </div>
  );
}
