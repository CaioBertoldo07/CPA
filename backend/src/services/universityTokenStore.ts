const tokenByEmail = new Map<string, string>();

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function setUniversityToken(email: string, token: string): void {
    tokenByEmail.set(normalizeEmail(email), token);
}

function getUniversityToken(email: string): string | undefined {
    return tokenByEmail.get(normalizeEmail(email));
}

function clearUniversityToken(email: string): void {
    tokenByEmail.delete(normalizeEmail(email));
}

export {
    setUniversityToken,
    getUniversityToken,
    clearUniversityToken,
};
