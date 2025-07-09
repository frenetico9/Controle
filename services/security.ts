
/**
 * Hashes a string using the SHA-256 algorithm.
 * @param data The string to hash.
 * @returns A promise that resolves to the hex-encoded hash string.
 */
export async function hashData(data: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
        console.warn('Web Crypto API not available. Skipping hashing. THIS IS INSECURE.');
        return data; // Fallback for environments without crypto
    }
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
