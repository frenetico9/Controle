import type { Currency } from "../types";

const localeMap: Record<Currency, string> = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE'
};

export const getCurrencyFormatter = (currency: Currency = 'BRL') => {
    const locale = localeMap[currency] || 'pt-BR';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    });
};

export const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) {
        return '';
    }
    const [user, domain] = email.split('@');
    if (!user || !domain) return '';

    const mask = (str: string) => {
        if (str.length <= 2) return `${str[0] || ''}*`;
        return `${str[0] || ''}${'*'.repeat(Math.max(0, str.length - 2))}${str[str.length - 1] || ''}`;
    };

    const domainParts = domain.split('.');
    const domainName = domainParts[0];
    const domainTld = domainParts.slice(1).join('.');

    if (!domainName || !domainTld) {
         return `${mask(user)}@${mask(domain)}`;
    }

    return `${mask(user)}@${mask(domainName)}.${domainTld}`;
};
