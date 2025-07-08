import React from 'react';
import type { FinancialAnalysis } from '../types';
import { InfoIcon } from './icons';

interface FinancialHealthProps {
    financialData: {
        monthlyIncome: number;
        monthlyExpenses: number;
        totalDebt: number;
        totalAssets: number;
    }
}

const calculateFinancialHealthAnalysis = (data: FinancialHealthProps['financialData']): FinancialAnalysis => {
    const { monthlyIncome, monthlyExpenses, totalDebt, totalAssets } = data;

    // Handle case where user needs to add data
    if (monthlyIncome === 0 && monthlyExpenses === 0 && (totalDebt > 0 || totalAssets > 0)) {
       return {
            score: 10,
            summary: "Adicione suas receitas e despesas para uma análise completa.",
            tips: [
                { title: "Registre Suas Transações", description: "Comece adicionando suas receitas e despesas do mês para uma análise precisa." },
                { title: "Crie Envelopes de Orçamento", description: "Defina limites de gastos para categorias como alimentação e lazer." },
                { title: "Defina uma Meta Financeira", description: "Ter um objetivo claro, como uma viagem, pode motivar a economizar." },
            ]
        };
    }
    
    if (monthlyIncome === 0 && monthlyExpenses === 0 && totalDebt === 0 && totalAssets === 0) {
       return {
            score: 0,
            summary: "Adicione transações para receber sua análise.",
            tips: [
                { title: "Registre uma Receita", description: "Comece adicionando suas fontes de renda para uma análise completa." },
                { title: "Cadastre suas Despesas", description: "Registre seus gastos para entender para onde seu dinheiro está indo." },
                { title: "Defina uma Meta", description: "Criar uma meta pode te dar um ótimo ponto de partida para o planejamento." },
            ]
        };
    }

    // --- METRIC CALCULATIONS ---
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : -Infinity;
    const debtToAssetRatio = totalAssets > 0 ? totalDebt / totalAssets : (totalDebt > 0 ? Infinity : 0);
    const emergencyFundMonths = monthlyExpenses > 0 ? totalAssets / monthlyExpenses : Infinity;

    // --- SCORE CALCULATIONS (out of 100) ---
    // 1. Savings Rate (50 points) - score is maximized at a 20% savings rate
    let savingsScore = 0;
    if (savingsRate >= 0.20) savingsScore = 50;
    else if (savingsRate >= 0.10) savingsScore = 40;
    else if (savingsRate >= 0.05) savingsScore = 30;
    else if (savingsRate > 0) savingsScore = 20;
    else savingsScore = 5;

    // 2. Debt to Asset Ratio (30 points) - lower is better
    let debtScore = 0;
    if (debtToAssetRatio < 0.3) debtScore = 30;
    else if (debtToAssetRatio < 0.5) debtScore = 20;
    else if (debtToAssetRatio < 0.8) debtScore = 10;
    else debtScore = 5;

    // 3. Emergency Fund (20 points) - based on months of expenses covered by assets
    let emergencyScore = 0;
    if (emergencyFundMonths >= 6) emergencyScore = 20;
    else if (emergencyFundMonths >= 3) emergencyScore = 15;
    else if (emergencyFundMonths >= 1) emergencyScore = 10;
    else emergencyScore = 5;
    
    const totalScore = Math.max(5, Math.min(100, Math.round(savingsScore + debtScore + emergencyScore)));


    // --- SUMMARY & TIPS ---
    let summary = "";
    if (totalScore >= 80) summary = "Sua saúde financeira está excelente! Continue com o ótimo trabalho.";
    else if (totalScore >= 60) summary = "Você está no caminho certo. Continue focado nos seus objetivos.";
    else if (totalScore >= 40) summary = "Sua situação financeira tem espaço para melhorias. Foco e disciplina trarão resultados.";
    else summary = "Sua situação financeira requer atenção. Vamos traçar um plano de ação.";

    const tips: {title: string, description: string}[] = [];
    // Prioritize tips based on the weakest points
    if (savingsRate < 0.1) {
        tips.push({ title: "Crie um Orçamento Detalhado", description: "Use os envelopes de orçamento para planejar e controlar seus gastos por categoria." });
    }
    if (debtToAssetRatio > 0.5 && totalDebt > 0) {
        tips.push({ title: "Acelere o Pagamento de Dívidas", description: "Considere usar a estratégia Avalanche ou Bola de Neve para quitar dívidas mais rápido." });
    }
    if (emergencyFundMonths < 3) {
        tips.push({ title: "Construa sua Reserva de Emergência", description: "Guarde o equivalente a 3-6 meses de suas despesas essenciais em um local seguro e de fácil acesso." });
    }
    
    // Fill up to 3 tips with general advice if specific problems aren't critical
    if (tips.length < 3 && savingsRate >= 0.1) {
         tips.push({ title: "Automatize seus Investimentos", description: "Configure transferências automáticas para sua conta de investimentos todo mês." });
    }
     if (tips.length < 3 && debtToAssetRatio <= 0.5) {
        tips.push({ title: "Revise Suas Metas", description: "Garanta que suas metas financeiras continuam alinhadas com seus objetivos de vida." });
    }
    if (tips.length < 3) {
        tips.push({ title: "Aumente sua Renda", description: "Explore novas fontes de renda, como trabalhos freelancer ou investimentos." });
    }

    return {
        score: totalScore,
        summary,
        tips: tips.slice(0, 3) // Ensure only 3 tips
    };
};


const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const clampedScore = Math.max(0, Math.min(100, score));
    const circumference = 2 * Math.PI * 45; // 2 * pi * r
    const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

    let colorClass = 'text-green-500';
    if (clampedScore < 40) colorClass = 'text-red-500';
    else if (clampedScore < 70) colorClass = 'text-yellow-500';
    
    return (
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                {/* Progress circle */}
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center font-bold ${colorClass}`}>
                <span className="text-3xl sm:text-4xl">{Math.round(clampedScore)}</span>
                <span className="text-xs sm:text-sm">/ 100</span>
            </div>
        </div>
    );
};

export const FinancialHealth: React.FC<FinancialHealthProps> = ({ financialData }) => {
    const analysis = calculateFinancialHealthAnalysis(financialData);
    
    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
                <ScoreGauge score={analysis.score} />
            </div>
            <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sua Saúde Financeira</h3>
                <p className="text-slate-500 dark:text-slate-400 italic mt-1 mb-4">"{analysis.summary}"</p>
                <div className="space-y-3">
                    {analysis.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <InfoIcon className="w-5 h-5 mt-0.5 text-primary-500 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-slate-700 dark:text-slate-200">{tip.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{tip.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
