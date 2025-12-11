/**
 * Configuration centralisée de l'application
 */

// URL de base de l'API (depuis les variables d'environnement)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// URL complète de l'API
export const API_URL = `${API_BASE_URL}/api`;

// Configuration des endpoints
export const ENDPOINTS = {
  // Auth
  auth: {
    login: `${API_URL}/auth/login/`,
    logout: `${API_URL}/auth/logout/`,
    register: `${API_URL}/auth/register/`,
    me: `${API_URL}/auth/me/`,
    csrf: `${API_URL}/auth/csrf/`,
  },
  // Offers
  offers: {
    list: `${API_URL}/offers/`,
    detail: (id: number) => `${API_URL}/offers/${id}/`,
    create: `${API_URL}/offers/create/`,
    validate: (id: number) => `${API_URL}/offers/${id}/validate/`,
    candidates: (id: number) => `${API_URL}/offers/${id}/candidates/`,
    myOffers: `${API_URL}/offers/my-offers/`,
  },
  // Candidatures
  candidatures: {
    list: `${API_URL}/candidatures/`,
    create: `${API_URL}/candidatures/create/`,
    updateStatus: (id: number) => `${API_URL}/candidatures/${id}/update_status/`,
  },
  // Profile
  profile: {
    get: `${API_URL}/profile/`,
    update: `${API_URL}/profile/update/`,
  },
  // Statistics
  statistics: {
    get: `${API_URL}/statistics/`,
  },
} as const;

export default {
  API_BASE_URL,
  API_URL,
  ENDPOINTS,
};
