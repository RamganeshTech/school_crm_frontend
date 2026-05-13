// src/lib/tokenManager.ts

// This variable lives entirely in memory. 
// It is immune to XSS attacks scraping localStorage.
let inMemoryToken: string | null = null;

export const setToken = (token: string) => {
  inMemoryToken = token;
};

export const getToken = (): string | null => {
  return inMemoryToken;
};

export const clearToken = () => {
  inMemoryToken = null;
};