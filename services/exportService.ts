import type { Transaction, Currency, Investment, Asset, Debt, BudgetEnvelope, Goal, RecurringBill } from '../types';
import { getCurrencyFormatter } from '../utils/formatters';


declare var jspdf: any;
declare var XLSX: any;

const autoSizeColumns = (worksheet: any, data: any[]): void => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const colWidths = headers.map(key => ({
        wch: Math.max(
            key.length, 
            ...data.map(row => (row[key as keyof typeof row] ?? '').toString().length)
        ) + 2
    }));
    worksheet['!cols'] = colWidths;
};

export const exportTransactionsToExcel = (data: Transaction[], fileName: string): void => {
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

    autoSizeColumns(worksheet, worksheetData);

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};


export const exportTransactionsToPDF = (data: Transaction[], currency: Currency): void => {
    if (!data || data.length === 0) {
        console.warn("No data to export for PDF.");
        return;
    }
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

    // Add Summary Footer
    const finalY = (doc as any).lastAutoTable.finalY;
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netResult = totalIncome - totalExpense;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo do Período:', 14, finalY + 10);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Receitas: ${currencyFormatter.format(totalIncome)}`, 14, finalY + 16);
    doc.text(`Total de Despesas: ${currencyFormatter.format(totalExpense)}`, 14, finalY + 21);

    doc.setFont('helvetica', 'bold');
    doc.text(`Resultado Líquido: ${currencyFormatter.format(netResult)}`, 14, finalY + 26);


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

    if (liabilitiesBody.length === 0) {
        liabilitiesBody.push(['Nenhuma dívida registrada', currencyFormatter.format(0)]);
    }

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
    
    doc.save(`patrimonio_liquido_${userName.replace(/ /g, '_')}.pdf`);
}


// --- Full Excel Report ---

interface FullReportData {
  balance: number;
  investments: Investment[];
  assets: Asset[];
  debts: Debt[];
  envelopes: BudgetEnvelope[];
  bills: RecurringBill[];
  transactions: Transaction[];
  goals: Goal[];
}

export const exportFullReportToExcel = (data: FullReportData, currency: Currency, userName: string): void => {
    const workbook = XLSX.utils.book_new();

    // --- 1. Summary Sheet ---
    const totalInvestments = data.investments.reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0);
    const totalPhysicalAssets = data.assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalDebts = data.debts.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalAssetsSum = data.balance + totalInvestments + totalPhysicalAssets;
    const netWorth = totalAssetsSum - totalDebts;

    const summarySheetData = [
        { "Item": "Patrimônio Líquido", "Valor": netWorth },
        {},
        { "Item": "ATIVOS" },
        { "Item": "  Caixa e Contas", "Valor": data.balance },
        { "Item": "  Investimentos", "Valor": totalInvestments },
        { "Item": "  Bens Físicos", "Valor": totalPhysicalAssets },
        { "Item": "TOTAL ATIVOS", "Valor": totalAssetsSum },
        {},
        { "Item": "PASSIVOS" },
        { "Item": "  Dívidas", "Valor": totalDebts },
        { "Item": "TOTAL PASSIVOS", "Valor": totalDebts },
    ];
    const summaryWorksheet = XLSX.utils.json_to_sheet(summarySheetData, {skipHeader: true});
    summaryWorksheet['!cols'] = [{wch: 25}, {wch: 20}];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo Patrimonial');
    

    // --- 2. Transactions Sheet ---
    if (data.transactions.length > 0) {
        const transactionsSheetData = data.transactions.map(t => ({
            'Data': new Date(t.date).toLocaleDateString('pt-BR'),
            'Descrição': t.description,
            'Categoria': t.category,
            'Tipo': t.type === 'income' ? 'Receita' : 'Despesa',
            'Valor': t.amount,
            'Método de Pagamento': t.paymentMethod,
            'Recorrência': t.recurrence,
            'Envelope': data.envelopes.find(e => e.id === t.envelopeId)?.name || ''
        }));
        const transactionsWorksheet = XLSX.utils.json_to_sheet(transactionsSheetData);
        autoSizeColumns(transactionsWorksheet, transactionsSheetData);
        XLSX.utils.book_append_sheet(workbook, transactionsWorksheet, 'Transações');
    }

    // --- 3. Budget Sheet ---
    if (data.envelopes.length > 0) {
        const budgetSheetData = data.envelopes.map(e => ({
            'Envelope': e.name,
            'Orçado': e.budgetedAmount,
            'Gasto': e.spentAmount,
            'Restante': e.budgetedAmount - e.spentAmount,
        }));
        const budgetWorksheet = XLSX.utils.json_to_sheet(budgetSheetData);
        autoSizeColumns(budgetWorksheet, budgetSheetData);
        XLSX.utils.book_append_sheet(workbook, budgetWorksheet, 'Orçamento');
    }
    
    // --- 4. Goals Sheet ---
    if (data.goals.length > 0) {
        const goalsSheetData = data.goals.map(g => ({
            'Meta': g.name,
            'Valor Alvo': g.targetAmount,
            'Valor Atual': g.currentAmount,
            'Progresso (%)': g.targetAmount > 0 ? parseFloat(((g.currentAmount / g.targetAmount) * 100).toFixed(2)) : 0,
            'Data Alvo': new Date(g.targetDate).toLocaleDateString('pt-BR'),
        }));
        const goalsWorksheet = XLSX.utils.json_to_sheet(goalsSheetData);
        autoSizeColumns(goalsWorksheet, goalsSheetData);
        XLSX.utils.book_append_sheet(workbook, goalsWorksheet, 'Metas');
    }

    // --- 5. Debts Sheet ---
    if (data.debts.length > 0) {
        const debtsSheetData = data.debts.map(d => ({
            'Dívida': d.name,
            'Valor Total': d.totalAmount,
            'Taxa de Juros (% a.m.)': d.interestRate,
            'Pagamento Mínimo': d.minimumPayment,
        }));
        const debtsWorksheet = XLSX.utils.json_to_sheet(debtsSheetData);
        autoSizeColumns(debtsWorksheet, debtsSheetData);
        XLSX.utils.book_append_sheet(workbook, debtsWorksheet, 'Dívidas');
    }
    
    // --- 6. Investments Sheet ---
    if (data.investments.length > 0) {
        const investmentsSheetData = data.investments.map(i => {
            const currentValue = i.quantity * i.currentPrice;
            const cost = i.quantity * i.purchasePrice;
            const gainLoss = currentValue - cost;
            const performance = cost > 0 ? (gainLoss / cost) * 100 : 0;
            return {
                'Ativo': i.name,
                'Tipo': i.type,
                'Quantidade': i.quantity,
                'Preço Médio Compra': i.purchasePrice,
                'Preço Atual': i.currentPrice,
                'Valor de Mercado': currentValue,
                'Resultado (R$)': gainLoss,
                'Resultado (%)': parseFloat(performance.toFixed(2)),
            };
        });
        const investmentsWorksheet = XLSX.utils.json_to_sheet(investmentsSheetData);
        autoSizeColumns(investmentsWorksheet, investmentsSheetData);
        XLSX.utils.book_append_sheet(workbook, investmentsWorksheet, 'Investimentos');
    }

    // --- 7. Assets Sheet ---
    if (data.assets.length > 0) {
        const assetsSheetData = data.assets.map(a => ({
            'Bem': a.name,
            'Tipo': a.type,
            'Valor de Compra': a.purchasePrice,
            'Valor Atual': a.currentValue,
        }));
        const assetsWorksheet = XLSX.utils.json_to_sheet(assetsSheetData);
        autoSizeColumns(assetsWorksheet, assetsSheetData);
        XLSX.utils.book_append_sheet(workbook, assetsWorksheet, 'Bens');
    }

    // --- 8. Bills Sheet ---
    if (data.bills.length > 0) {
        const billsSheetData = data.bills.map(b => ({
            'Conta': b.name,
            'Valor': b.amount,
            'Dia do Vencimento': b.dueDay,
        }));
        const billsWorksheet = XLSX.utils.json_to_sheet(billsSheetData);
        autoSizeColumns(billsWorksheet, billsSheetData);
        XLSX.utils.book_append_sheet(workbook, billsWorksheet, 'Contas Recorrentes');
    }

    XLSX.writeFile(workbook, `Relatorio_Financeiro_${userName.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
};