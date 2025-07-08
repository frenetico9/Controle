import type { Transaction, Currency, Investment, Asset, Debt } from '../types';
import { getCurrencyFormatter } from '../utils/formatters';


declare var jspdf: any;
declare var XLSX: any;

export const exportToExcel = (data: Transaction[], fileName: string): void => {
    if (!data || data.length === 0) {
        console.warn("No data to export for Excel.");
        return;
    }
    const worksheetData = data.map(t => ({
        'Data': new Date(t.date).toLocaleDateString('pt-BR'),
        'Descrição': t.description,
        'Categoria': t.category,
        'Tipo': t.type === 'income' ? 'Receita' : 'Despesa',
        'Valor': t.amount,
        'Método de Pagamento': t.paymentMethod,
        'Recorrência': t.recurrence,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');

    const headers = Object.keys(worksheetData[0]);
    const colWidths = headers.map(key => ({
        wch: Math.max(
            key.length, 
            ...worksheetData.map(row => (row[key as keyof typeof row] ?? '').toString().length)
        ) + 2
    }));

    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};


export const exportToPDF = (data: Transaction[], currency: Currency): void => {
    if (!data || data.length === 0) {
        console.warn("No data to export for PDF.");
        return;
    }
    // Use the correct global object `jspdf` and class `jsPDF`
    const doc = new jspdf.jsPDF();
    const currencyFormatter = getCurrencyFormatter(currency);

    doc.setFontSize(18);
    doc.text('Relatório de Transações', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);

    const tableColumn = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];
    const tableRows: any[] = [];

    data.forEach(t => {
        const transactionData = [
            new Date(t.date).toLocaleDateString('pt-BR'),
            t.description,
            t.category,
            t.type === 'income' ? 'Receita' : 'Despesa',
            currencyFormatter.format(t.amount),
        ];
        tableRows.push(transactionData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        headStyles: { fillColor: [37, 99, 235] }, // primary-600
        theme: 'striped',
        styles: {
            font: 'Inter',
            fontSize: 10,
        }
    });

    doc.save('transacoes.pdf');
};

interface NetWorthData {
  balance: number;
  investments: Investment[];
  assets: Asset[];
  debts: Debt[];
}

export const exportNetWorthPDF = (data: NetWorthData, currency: Currency, userName: string): void => {
    const doc = new jspdf.jsPDF();
    const currencyFormatter = getCurrencyFormatter(currency);
    const today = new Date().toLocaleDateString('pt-BR');

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Demonstrativo de Patrimônio Líquido', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado para: ${userName}`, 105, 28, { align: 'center' });
    doc.text(`Data: ${today}`, 105, 34, { align: 'center' });

    let yPos = 50;

    // --- ASSETS ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Ativos', 14, yPos);
    yPos += 8;

    const assetsBody = [];
    let totalAssets = 0;

    // Cash
    assetsBody.push(['Contas (Saldo Líquido)', currencyFormatter.format(data.balance)]);
    totalAssets += data.balance;

    // Investments
    const totalInvestments = data.investments.reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0);
    assetsBody.push(['Investimentos', currencyFormatter.format(totalInvestments)]);
    totalAssets += totalInvestments;

    // Physical Assets
    const totalPhysicalAssets = data.assets.reduce((sum, a) => sum + a.currentValue, 0);
    assetsBody.push(['Bens Físicos', currencyFormatter.format(totalPhysicalAssets)]);
    totalAssets += totalPhysicalAssets;
    
    (doc as any).autoTable({
        head: [['Ativo', 'Valor']],
        body: assetsBody,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] }, // green-500
    });
    yPos = (doc as any).lastAutoTable.finalY + 2;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total de Ativos:', 14, yPos);
    doc.text(currencyFormatter.format(totalAssets), 200, yPos, { align: 'right'});
    yPos += 15;


    // --- LIABILITIES ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Passivos (Dívidas)', 14, yPos);
    yPos += 8;

    const liabilitiesBody = data.debts.map(d => [d.name, currencyFormatter.format(d.totalAmount)]);
    const totalLiabilities = data.debts.reduce((sum, d) => sum + d.totalAmount, 0);

    (doc as any).autoTable({
        head: [['Passivo', 'Valor']],
        body: liabilitiesBody,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] }, // red-500
    });

    yPos = (doc as any).lastAutoTable.finalY + 2;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total de Passivos:', 14, yPos);
    doc.text(currencyFormatter.format(totalLiabilities), 200, yPos, { align: 'right'});
    yPos += 15;

    // --- NET WORTH ---
    const netWorth = totalAssets - totalLiabilities;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Patrimônio Líquido Total:', 14, yPos);
    doc.text(currencyFormatter.format(netWorth), 200, yPos, { align: 'right'});
    
    doc.save(`patrimonio_liquido_${userName.replace(' ','_')}.pdf`);
}