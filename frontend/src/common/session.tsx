const storeInSession = (key: string, value: string): void => {
    sessionStorage.setItem(key, value); // ✅ Corrected from sessionStorage.set to sessionStorage.setItem
};

const lookInSession = (key: string): string | null => {
    return sessionStorage.getItem(key); // ✅ This is correct
};

const removeFromSession = (key: string): void => {
    sessionStorage.removeItem(key); // ✅ This is correct
};

const logOutUser = (): void => {
    sessionStorage.clear(); // ✅ This is correct (clears all session storage items)
};

export { storeInSession, lookInSession, removeFromSession, logOutUser };
