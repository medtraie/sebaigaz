
import { useEffect, useState, useRef } from "react";
import { Invoice } from "@/types";
import { InvoicePDF } from "./InvoicePDF";
import { Button } from "@/components/ui/button";
import { X, Printer, Eye, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  invoice: Invoice;
  onClose: () => void;
}

export function PDFViewer({ invoice, onClose }: PDFViewerProps) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const formatInvoiceNumberForDisplay = (invoice: Invoice): string => {
    return invoice.number;
  };

  useEffect(() => {
    const generatePDF = async () => {
      try {
        setIsLoading(true);
        const pdfDoc = await InvoicePDF.generate(invoice);
        const dataUrl = pdfDoc.output("datauristring");
        setPdfDataUrl(dataUrl);
        setIsLoading(false);
      } catch (error) {
        console.error("Error generating PDF:", error);
        setIsLoading(false);
      }
    };

    generatePDF();
  }, [invoice]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = async () => {
    const pdfDoc = await InvoicePDF.generate(invoice);
    pdfDoc.save(`invoice-${invoice.number}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden border border-white/20">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-brand-teal" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Aperçu de la Facture
              </h2>
              <p className="text-sm font-bold text-brand-teal flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-brand-teal/10 rounded-lg">{formatInvoiceNumberForDisplay(invoice)}</span>
                <span className="text-gray-400 font-medium">|</span>
                <span className="text-gray-500 font-medium">{invoice.client.name}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              onClick={handleDownload} 
              variant="outline"
              className="flex-1 md:flex-none h-12 rounded-2xl border-gray-200 font-bold px-6 hover:bg-gray-50 transition-all gap-2"
            >
              <Download className="w-5 h-5" />
              Télécharger PDF
            </Button>
            <Button 
              onClick={handlePrint} 
              className="flex-1 md:flex-none bg-brand-teal hover:bg-brand-teal/90 text-white h-12 rounded-2xl font-bold px-8 shadow-lg shadow-brand-teal/20 transition-all gap-2"
            >
              <Printer className="w-5 h-5" />
              Imprimer
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-12 h-12 p-0 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100/50 p-4 md:p-8 overflow-hidden relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm z-10">
              <div className="w-12 h-12 border-4 border-brand-teal/20 border-t-brand-teal rounded-full animate-spin" />
              <p className="text-lg font-black text-gray-900 animate-pulse">Préparation de la facture...</p>
            </div>
          ) : (
            <div className="h-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-white relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <div className="bg-brand-teal/10 backdrop-blur-md px-4 py-2 rounded-xl border border-brand-teal/20 flex items-center gap-2 text-brand-teal font-bold text-sm">
                  <Eye className="w-4 h-4" />
                  Mode Aperçu
                </div>
              </div>
              <iframe
                ref={iframeRef}
                src={pdfDataUrl}
                className="w-full h-full border-none"
                title="Invoice Preview"
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Gaz Flow - Système de Gestion et Distribution
          </p>
        </div>
      </div>
    </div>
  );
}
