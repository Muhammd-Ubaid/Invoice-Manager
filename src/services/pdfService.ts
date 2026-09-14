import jsPDF from 'jspdf';
import { Invoice, BusinessProfile } from '../types';
import { formatCurrency } from '../utils/calculations';

export const createInvoicePDFDoc = (invoice: Invoice, profile?: BusinessProfile): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryHex = profile?.primaryColor || '#026fc7';
  
  const hexToRgb = (hex: string): [number, number, number] => {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  };

  const [pR, pG, pB] = hexToRgb(primaryHex);

  // 1. Top Decorative Brand Bar
  doc.setFillColor(pR, pG, pB);
  doc.rect(0, 0, 210, 5, 'F');

  // 2. Main Header
  // Left: Brand Monogram Box [ AT ] + Company Name & Subtitle
  doc.setFillColor(pR, pG, pB);
  doc.roundedRect(15, 11, 13, 13, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('AT', 21.5, 19.5, { align: 'center' });

  // Company Brand Name
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const companyName = profile?.companyName || 'Arzo Tailor';
  doc.text(companyName, 32, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Professional Tailoring & Fashion Studio', 32, 23.5);

  // Divider Line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(15, 36, 195, 36);

  // 3. Metadata Bar (4 Cards Grid)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(15, 40, 180, 16, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 40, 180, 16, 3, 3, 'S');

  const colW = 45;
  const metaY = 46;

  // Invoice Number
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('INVOICE NO.', 15 + 6, metaY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pR, pG, pB);
  doc.text(invoice.invoiceNumber, 15 + 6, metaY + 5);

  // Issue Date
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('ISSUE DATE', 15 + colW + 4, metaY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.issueDate, 15 + colW + 4, metaY + 5);

  // Due Date
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('DUE DATE', 15 + colW * 2 + 2, metaY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.dueDate, 15 + colW * 2 + 2, metaY + 5);

  // Balance Due
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('BALANCE DUE', 15 + colW * 3, metaY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pR, pG, pB);
  doc.text(formatCurrency(invoice.balanceDue, invoice.currency), 15 + colW * 3, metaY + 5);

  // 4. Billed From & Billed To Section
  const billY = 63;

  // Billed From (Left Box)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('BILLED FROM', 15, billY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  let bFromY = billY + 6;
  doc.text(profile?.companyName || 'Arzo Tailor', 15, bFromY); bFromY += 4.5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  if (profile?.ownerName) { doc.text(`Attn: ${profile.ownerName}`, 15, bFromY); bFromY += 4; }
  if (profile?.phone) { doc.text(`Phone: ${profile.phone}`, 15, bFromY); bFromY += 4; }
  if (profile?.email) { doc.text(`Email: ${profile.email}`, 15, bFromY); bFromY += 4; }
  if (profile?.address) { doc.text(profile.address, 15, bFromY, { maxWidth: 82 }); bFromY += 6; }

  // Billed To (Right Box)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('BILLED TO', 110, billY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  let bToY = billY + 6;
  doc.text(invoice.clientName, 110, bToY); bToY += 4.5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  if (invoice.clientEmail) { doc.text(`Email: ${invoice.clientEmail}`, 110, bToY); bToY += 4; }
  if (invoice.clientAddress) { doc.text(invoice.clientAddress, 110, bToY, { maxWidth: 82 }); bToY += 6; }

  // 4.5 Tailoring Measurements Card (If measurements exist for order)
  let mY = Math.max(bFromY, bToY) + 3;

  if (invoice.measurements) {
    const { qameez, shalwar, suits, shalwarPant, unit, specialInstructions } = invoice.measurements;
    const unitLbl = unit === 'inch' ? 'in' : 'cm';

    const sData = suits || {
      shoulder: qameez?.shoulder || '',
      sleeves: qameez?.sleeveLength || '',
      length: qameez?.qameezLength || '',
      chest: qameez?.chest || '',
      waist: qameez?.waist || '',
      hips: qameez?.hip || '',
      collar: qameez?.neck || '',
      waistCoat: '',
      crossBack: '',
      bicep: ''
    };

    const spData = shalwarPant || {
      length: shalwar?.shalwarLength || '',
      waist: shalwar?.waist || '',
      hips: shalwar?.hip || '',
      insideLength: '',
      tight: '',
      bottom: shalwar?.bottomPaicha || '',
      frontFly: '',
      backFly: '',
      knee: ''
    };

    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(15, mY, 180, 26, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(15, mY, 180, 26, 2, 2, 'S');

    doc.setFillColor(6, 78, 59); // dark emerald accent strip
    doc.rect(15, mY, 2.5, 26, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(6, 78, 59);
    doc.text(`TAILORING MEASUREMENTS PROFILE (${unit === 'inch' ? 'INCHES' : 'CM'})`, 20, mY + 4);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    const fmtDual = (v1?: string, v2?: string) => {
      if (v1 && v2) return `${v1}/${v2}`;
      return v1 || v2 || '-';
    };

    // Suits line
    const suitsLine = `SUITS/SHIRTS: Shld:${sData.shoulder || '-'}${unitLbl} | Slv:${sData.sleeves || '-'}${unitLbl} | Lgth:${sData.length || '-'}${unitLbl} | Chst:${fmtDual(sData.chest, sData.chest2)}${unitLbl} | Wst:${fmtDual(sData.waist, sData.waist2)}${unitLbl} | Hips:${fmtDual(sData.hips, sData.hips2)}${unitLbl} | Colr:${sData.collar || '-'}${unitLbl} | W/C:${sData.waistCoat || '-'}${unitLbl} | CB:${sData.crossBack || '-'}${unitLbl} | Bcp:${fmtDual(sData.bicep, sData.bicep2)}${unitLbl}`;
    doc.text(suitsLine, 20, mY + 8.5);

    // Shalwar / Pant line
    const spLine = `SHALWAR/PANT: Lgth:${spData.length || '-'}${unitLbl} | Wst:${fmtDual(spData.waist, spData.waist2)}${unitLbl} | Hips:${fmtDual(spData.hips, spData.hips2)}${unitLbl} | InsL:${spData.insideLength || '-'}${unitLbl} | Tght:${spData.tight || '-'}${unitLbl} | Btm:${spData.bottom || '-'}${unitLbl} | FFly:${spData.frontFly || '-'}${unitLbl} | BFly:${spData.backFly || '-'}${unitLbl} | Knee:${spData.knee || '-'}${unitLbl}`;
    doc.text(spLine, 20, mY + 13);

    if (specialInstructions) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`Stitching Notes: ${specialInstructions}`, 20, mY + 17.5, { maxWidth: 170 });
    }

    mY += 29;
  }

  // 5. Line Items Table Section
  const tableStart = mY + 3;

  // Header Banner
  doc.setFillColor(15, 23, 42); // sleek dark slate
  doc.roundedRect(15, tableStart, 180, 8, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION / ITEM', 19, tableStart + 5.5);
  doc.text('QTY', 125, tableStart + 5.5, { align: 'center' });
  doc.text('PRICE', 155, tableStart + 5.5, { align: 'right' });
  doc.text('TOTAL', 191, tableStart + 5.5, { align: 'right' });

  // Rows
  let itemY = tableStart + 13;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  invoice.lineItems.forEach((item, index) => {
    // Alternating zebra fill
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, itemY - 5, 180, 8.5, 'F');
    }

    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFont('helvetica', 'medium');
    doc.text(item.description, 19, itemY, { maxWidth: 95 });

    doc.setFont('helvetica', 'normal');
    doc.text(String(item.quantity), 125, itemY, { align: 'center' });
    doc.text(formatCurrency(item.unitPrice, invoice.currency), 155, itemY, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.amount, invoice.currency), 191, itemY, { align: 'right' });

    // Subtle divider
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(15, itemY + 3.5, 195, itemY + 3.5);

    itemY += 9;
  });

  // 6. Summary & Totals Box
  let totalsY = itemY + 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', 140, totalsY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), 191, totalsY, { align: 'right' });
  totalsY += 5.5;

  if (invoice.discountTotal > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`Discount (${invoice.discountRate}%):`, 140, totalsY);
    doc.setFont('helvetica', 'bold');
    doc.text(`-${formatCurrency(invoice.discountTotal, invoice.currency)}`, 191, totalsY, { align: 'right' });
    totalsY += 5.5;
  }

  // Grand Total Highlight Banner
  doc.setFillColor(pR, pG, pB);
  doc.roundedRect(125, totalsY, 70, 10, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('GRAND TOTAL:', 129, totalsY + 6.5);
  doc.text(formatCurrency(invoice.grandTotal, invoice.currency), 191, totalsY + 6.5, { align: 'right' });

  totalsY += 15;

  if (invoice.amountPaid > 0 || invoice.balanceDue !== invoice.grandTotal) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Amount Paid:', 140, totalsY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text(formatCurrency(invoice.amountPaid, invoice.currency), 191, totalsY, { align: 'right' });
    totalsY += 5;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Balance Due:', 140, totalsY);
    doc.text(formatCurrency(invoice.balanceDue, invoice.currency), 191, totalsY, { align: 'right' });
    totalsY += 10;
  }

  // 7. Payment & Bank Details Card (with left accent strip)
  if (profile?.bankName || profile?.iban) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, totalsY, 180, 22, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, totalsY, 180, 22, 2, 2, 'S');

    // Accent line on left of card
    doc.setFillColor(pR, pG, pB);
    doc.rect(15, totalsY, 2.5, 22, 'F');

    let bankY = totalsY + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('PAYMENT & BANK DETAILS', 21, bankY);
    bankY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    const b1 = profile.bankName ? `Bank: ${profile.bankName}` : '';
    const b2 = profile.accountName ? `Account Name: ${profile.accountName}` : '';
    const b3 = profile.accountNumber ? `Account #: ${profile.accountNumber}` : '';
    const b4 = profile.iban ? `IBAN: ${profile.iban}` : '';

    doc.text(`${b1}  •  ${b2}`, 21, bankY);
    bankY += 4;
    doc.text(`${b3}  •  ${b4}`, 21, bankY);

    totalsY += 27;
  }

  // 8. Notes & Terms
  if (invoice.notes || profile?.invoiceTerms) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('TERMS & NOTES', 15, totalsY);
    totalsY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const termsText = invoice.notes || profile?.invoiceTerms || '';
    doc.text(termsText, 15, totalsY, { maxWidth: 180 });
  }

  // 9. Footer Sign-off
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Thank you for your business! • ${companyName}`, 105, 285, { align: 'center' });

  return doc;
};

export const generateInvoicePDF = (invoice: Invoice, profile?: BusinessProfile): void => {
  const doc = createInvoicePDFDoc(invoice, profile);
  const filename = `${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};

export const shareInvoiceViaWhatsApp = async (invoice: Invoice, profile?: BusinessProfile): Promise<void> => {
  const doc = createInvoicePDFDoc(invoice, profile);
  const pdfBlob = doc.output('blob');
  const filename = `${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`;
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });

  const messageText = `Hello ${invoice.clientName},\n\nHere is your invoice *${invoice.invoiceNumber}* from ${profile?.companyName || 'Arzo Tailor'} for ${formatCurrency(invoice.grandTotal, invoice.currency)}.\nDue Date: ${invoice.dueDate}\nStatus: ${invoice.status.toUpperCase()}`;

  // If browser supports Web Share API with PDF file attachment (e.g. mobile devices)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Invoice ${invoice.invoiceNumber}`,
        text: messageText,
      });
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
    }
  }

  // Fallback for browsers without direct file WebShare support (e.g. desktop web):
  // 1. Download the generated PDF bill to user's device
  doc.save(filename);

  // 2. Open WhatsApp web with bill message & note about the downloaded PDF file
  const waText = encodeURIComponent(
    `${messageText}\n\n` +
    `📎 (The PDF bill file *${filename}* has been generated and downloaded to your device. You can attach it directly to this chat.)`
  );
  window.open(`https://wa.me/?text=${waText}`, '_blank');
};

export const generateEmailShareLink = (invoice: Invoice): string => {
  const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from Arzo Tailor`);
  const body = encodeURIComponent(
    `Dear ${invoice.clientName},\n\n` +
    `Please find attached your invoice ${invoice.invoiceNumber} for the amount of ${formatCurrency(invoice.grandTotal, invoice.currency)}.\n\n` +
    `Due Date: ${invoice.dueDate}\n` +
    `Balance Due: ${formatCurrency(invoice.balanceDue, invoice.currency)}\n\n` +
    `Thank you for your business!\n\nBest regards,\nArzo Tailor`
  );

  return `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`;
};

