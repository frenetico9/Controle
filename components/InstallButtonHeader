import React from 'react';
import { useAuth } from './Auth';
import { GridPlusIcon } from './icons';

/**
 * A button that appears in the header to prompt PWA installation.
 * It automatically hides if the app is not installable via a prompt.
 */
export const InstallButtonHeader: React.FC = () => {
    const { isInstallable, canPromptInstall, handleInstallClick } = useAuth();

    // Only show the button if it can trigger a direct installation prompt.
    if (!isInstallable || !canPromptInstall) {
        return null;
    }

    return (
        <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 font-semibold text-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 px-3 py-1.5 rounded-md transition-colors shadow-sm"
            aria-label="Instalar Aplicativo"
        >
            <GridPlusIcon className="w-5 h-5" />
            <span>Instalar</span>
        </button>
    );
};
