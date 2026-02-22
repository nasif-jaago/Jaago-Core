import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFLine {
    product: string;
    description: string;
    qty: string;
    unit: string;
    price: string;
    total: string;
}

interface ApprovalStep {
    name: string;
    status: string;
    date: string;
}

interface RequisitionData {
    prNumber?: string;
    company: string;
    requestOwner: string;
    department: string;
    subject: string;
    date: string;
    totalAmount: string;
    currency: string;
    reasonForPurchase: string;
    deliveryInstructions: string;
    productLines: PDFLine[];
    approvalHistory: ApprovalStep[];
}

export const generateRequisitionPDF = (data: RequisitionData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor = [245, 197, 24]; // #F5C518
    const darkColor = [20, 20, 20];
    const grayColor = [100, 100, 100];
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo Text (JAAGO)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('JAAGO', 15, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CORE ECOSYSTEM | AUDIT REPORT', 15, 28);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(data.prNumber || 'REQUISITION', pageWidth - 15, 22, { align: 'right' });

    // --- Main Info Section ---
    let y = 50;

    const drawField = (label: string, value: string, x: number, y: number, width: number) => {
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(label.toUpperCase(), x, y);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '--', x, y + 5);
    };

    // Row 1
    drawField('Company Name', data.company, 15, y, 90);
    drawField('Date', data.date, pageWidth / 2 + 5, y, 90);
    y += 15;

    // Row 2
    drawField('Request Owner', data.requestOwner, 15, y, 90);
    drawField('Department', data.department, pageWidth / 2 + 5, y, 90);
    y += 15;

    // Row 3
    drawField('Subject', data.subject, 15, y, 90);
    drawField('Est. Total Amount', `${data.currency} ${data.totalAmount}`, pageWidth / 2 + 5, y, 90);
    y += 20;

    // --- Supplementary Info ---
    const drawTextBox = (label: string, text: string, x: number, currY: number) => {
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(label.toUpperCase(), x, currY);

        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');

        const splitText = doc.splitTextToSize(text || '--', pageWidth - 30);
        doc.text(splitText, x, currY + 5);
        return splitText.length * 5 + 10;
    };

    y += drawTextBox('Reason for Purchase', data.reasonForPurchase, 15, y);
    y += drawTextBox('Delivery Instructions', data.deliveryInstructions, 15, y);

    y += 5;

    // --- Service & Products Table ---
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE & PRODUCTS', 15, y);
    y += 5;

    autoTable(doc, {
        startY: y,
        head: [['Product', 'Description', 'Qty', 'Unit', 'Price', 'Total']],
        body: data.productLines.map(l => [l.product, l.description, l.qty, l.unit, l.price, l.total]),
        headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
            2: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
            y = data.cursor?.y || y;
        }
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // --- Approval Chain Table ---
    if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 20;
    }

    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('APPROVAL CHAIN (AUDIT TRAIL)', 15, y);
    y += 5;

    autoTable(doc, {
        startY: y,
        head: [['Approver', 'Status', 'Decision Date']],
        body: data.approvalHistory.map(h => [
            h.name,
            h.status.toUpperCase(),
            h.date
        ]),
        headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
            y = data.cursor?.y || y;
        }
    });

    y = (doc as any).lastAutoTable.finalY + 20;

    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, doc.internal.pageSize.getHeight() - 10);
    doc.text('JAAGO FOUNDATION - ERP SYSTEM', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    doc.text('Page 1 of 1', pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });

    // Download
    const fileName = `Requisition_${data.prNumber || 'Report'}.pdf`;
    doc.save(fileName);
};
