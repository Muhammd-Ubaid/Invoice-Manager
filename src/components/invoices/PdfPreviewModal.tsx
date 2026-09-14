import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Mail, Printer, Palette, Sparkles, Eye, Check } from 'lucide-react';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { createInvoicePDFDoc, generateInvoicePDF, shareInvoiceViaWhatsApp, generateEmailShareLink } from '../../services/pdfService';
import { BusinessProfile } from '../../types';

const COLOR_PRESETS = [
  { name: 'Royal Blue', hex: '#026fc7' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Midnight Slate', hex: '#0f172a' },
  { name: 'Deep Violet', hex: '#7c3aed' },
  { name: 'Amber Gold', hex: '#d97706' },
  { name: 'Crimson', hex: '#dc2626' }
];

export const PdfPreviewModal: React.FC = () => {
  const { isPdfModalOpen, previewInvoice, closePdfModal } = useInvoiceStore();
  const { profile } = useSettingsStore();

  const [primaryColor, setPrimaryColor] = useState('#026fc7');
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');

  useEffect(() => {
    if (profile?.primaryColor) {
      setPrimaryColor(profile.primaryColor);
    }
  }, [profile]);

  useEffect(() => {
    if (!previewInvoice) return;

    let blobUrl = '';
    try {
      const defaultProfile: BusinessProfile = {
        id: 'profile-1',
        companyName: 'Arzo Tailor',
        ownerName: 'Arsalan',
        email: '',
        phone: '',
        address: '',
        defaultCurrency: 'PKR',
        defaultTaxRate: 0,
        invoiceTerms: '',
        primaryColor: '#026fc7'
      };

      const tempProfile: BusinessProfile = {
        ...(profile || defaultProfile),
        primaryColor
      };

      const doc = createInvoicePDFDoc(previewInvoice, tempProfile);
      const pdfBlob = doc.output('blob');
      blobUrl = URL.createObjectURL(pdfBlob);
      setPdfDataUrl(blobUrl);
    } catch (err) {
      console.error('Error generating PDF preview:', err);
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [previewInvoice, profile, primaryColor]);

  if (!isPdfModalOpen || !previewInvoice) return null;

  const currentProfile: BusinessProfile = {
    ...(profile || {
      id: 'profile-1',
      companyName: 'Arzo Tailor',
      ownerName: 'Arsalan',
      email: '',
      phone: '',
      address: '',
      defaultCurrency: 'PKR',
      defaultTaxRate: 0,
      invoiceTerms: '',
      primaryColor: '#026fc7'
    }),
    primaryColor
  };

  const handlePrint = () => {
    try {
      const doc = createInvoicePDFDoc(previewInvoice, currentProfile);
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } catch (err) {
      console.error('Error printing PDF:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full my-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>PDF Document Studio</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold">
                  {previewInvoice.invoiceNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live interactive PDF bill generator & instant exporter
              </p>
            </div>
          </div>

          <button
            onClick={closePdfModal}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-100/60 dark:bg-slate-950/60">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Color Palette Selector */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-brand-500" />
                <span>Primary Accent Theme</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      onClick={() => setPrimaryColor(preset.hex)}
                      className={`p-2 rounded-xl text-left border text-xs font-medium flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 border border-black/10 shadow-xs flex items-center justify-center text-white"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span className="truncate text-[11px] font-semibold">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Invoice Info Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Document Details</span>
                <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">{previewInvoice.invoiceNumber}</span>
              </h3>
              <div className="space-y-1 text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex justify-between">
                  <span>Client:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{previewInvoice.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issue Date:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{previewInvoice.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Grand Total:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {previewInvoice.currency} {previewInvoice.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Live Viewer Box */}
          <div className="lg:col-span-8 flex flex-col bg-slate-800 dark:bg-slate-900 rounded-2xl border border-slate-700 shadow-inner overflow-hidden min-h-[460px]">
            <div className="p-3 bg-slate-900 text-slate-300 text-xs font-semibold flex items-center justify-between border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-brand-400" />
                <span>Live Interactive Preview</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">A4 Portrait (210 × 297 mm)</span>
            </div>

            <div className="flex-1 w-full h-full min-h-[420px] relative bg-slate-950 flex items-center justify-center">
              {pdfDataUrl ? (
                <iframe
                  src={pdfDataUrl}
                  title="PDF Preview"
                  className="w-full h-full min-h-[420px] border-none"
                />
              ) : (
                <div className="text-slate-400 text-xs animate-pulse">Rendering high-res PDF preview...</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={closePdfModal}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close Studio
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Bill</span>
            </button>

            <button
              onClick={() => shareInvoiceViaWhatsApp(previewInvoice, currentProfile)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>

            <a
              href={generateEmailShareLink(previewInvoice)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email Bill</span>
            </a>

            <button
              onClick={() => generateInvoicePDF(previewInvoice, currentProfile)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
