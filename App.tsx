import React from 'react';
import { DesktopComputerIcon, DevicePhoneMobileIcon, ArrowUpOnSquareIcon } from 'components/icons';

interface InstallHelpModalProps {
    onClose: () => void;
}

const InstructionStep: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
        <div className="flex-shrink-0 text-primary-500">{icon}</div>
        <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">{title}</h4>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1 mt-1">{children}</div>
        </div>
    </div>
);

export const InstallHelpModal: React.FC<InstallHelpModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white">Como Instalar o Aplicativo</h2>
                    <p className="text-center text-slate-500 dark:text-slate-400 mt-2">Tenha acesso rápido e offline em qualquer dispositivo seguindo os passos abaixo.</p>
                </div>

                <div className="px-6 pb-6 space-y-4">
                    <InstructionStep icon={<DesktopComputerIcon className="w-8 h-8" />} title="Computador (Chrome, Edge)">
                        <p>1. Na barra de endereço, procure pelo ícone de instalação <img src="https://lh3.googleusercontent.com/4gN52Lp_3a3b_x-QvTP2I01t2l_yszy9v6a12-vIqio5o35bU9oXG4D_2c87i9hD-3h2nbm_6WqY2e-n60I2-gGv3_hF13-QyI8=s0" alt="Ícone de instalação" className="inline h-5 w-5 mx-1" />.</p>
                        <p>2. Clique nele e depois em <strong>"Instalar"</strong>.</p>
                        <p className="text-xs text-slate-400">(Se o ícone não aparecer, clique nos três pontos no canto superior direito e selecione "Instalar [Nome do App]").</p>
                    </InstructionStep>

                    <InstructionStep icon={<DevicePhoneMobileIcon className="w-8 h-8" />} title="Android (Chrome)">
                        <p>1. Toque no botão de menu (três pontos) no canto superior direito.</p>
                        <p>2. No menu que aparecer, selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</p>
                    </InstructionStep>

                    <InstructionStep icon={<ArrowUpOnSquareIcon className="w-8 h-8" />} title="iPhone / iPad (Safari)">
                        <p>1. Toque no botão de <strong>Compartilhamento</strong> na barra inferior do Safari.</p>
                        <p>2. Role a lista de opções e toque em <strong>"Adicionar à Tela de Início"</strong>.</p>
                        <p>3. Confirme o nome do aplicativo e toque em <strong>"Adicionar"</strong>.</p>
                    </InstructionStep>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-right rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};
