import React from 'react';
import { useAuth } from './Auth';
import { InstallIcon } from './icons';

export const InstallPWA: React.FC = () => {
    const { canInstall, triggerInstallPrompt } = useAuth();
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        if (canInstall) {
            // Use a timeout to avoid being too intrusive on page load
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [canInstall]);

    const handleInstallClick = () => {
        triggerInstallPrompt();
        setIsVisible(false); // Hide banner after interaction
    };
    
    const handleDismiss = () => {
        setIsVisible(false); // Allow user to dismiss
    }

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-primary-600 text-white p-3 z-50 flex items-center justify-between shadow-lg animate-slide-up">
            <style>
            {`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}
            </style>
            <div className="flex items-center gap-3 sm:gap-4 flex-grow min-w-0">
                <InstallIcon className="w-8 h-8 flex-shrink-0"/>
                <div className="flex-grow min-w-0">
                    <p className="font-bold truncate">Instale o App Controle de Finanças</p>
                    <p className="text-sm opacity-90 hidden sm:block">Acesso rápido e offline na sua tela inicial.</p>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                 <button 
                    onClick={handleDismiss} 
                    className="font-semibold text-sm px-3 py-1.5 rounded-md hover:bg-black/20 transition-colors"
                >
                    Agora não
                </button>
                <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 font-semibold text-sm bg-white text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-md transition-colors shadow"
                    aria-label="Instalar Aplicativo"
                >
                    <InstallIcon className="w-4 h-4" />
                    <span>Instalar</span>
                </button>
            </div>
        </div>
    );
};
