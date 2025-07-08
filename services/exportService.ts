import type { Transaction, Currency } from '../types';
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