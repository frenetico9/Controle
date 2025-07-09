import React from 'react';
import { useAuth } from './Auth';
import { InstallIcon } from './icons';

/**
 * A button that appears in the header to prompt PWA installation.
 * It automatically hides if the app is already installed.
 */
export const InstallButtonHeader: React.FC = () => {
    const { isInstallable, handleInstallClick } = useAuth();

    if (!isInstallable) {
        return null;
    }

    return (
        <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 font-semibold text-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 px-3 py-1.5 rounded-md transition-colors shadow-sm"
            aria-label="Instalar Aplicativo"
        >
            <InstallIcon className="w-4 h-4" />
            <span>Instalar App</span>
        </button>
    );
};
