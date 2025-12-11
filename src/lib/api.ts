import { API_URL } from '@/config';

const API_BASE_URL = API_URL;

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'Etudiant' | 'Entreprise' | 'Responsable' | 'Administrateur' | null;
}

export interface StageOffer {
  id: number;
  organisme: string;
  contact_name: string;
  contact_email: string;
  date_depot: string;
  title: string;
  description: string;
  state: 'En attente validation' | 'Validée' | 'Refusée' | 'Clôturée';
  closing_reason: string | null;
  candidature_count: number;
  has_applied: boolean;
  company: number | null;
  company_name: string | null;
  city?: string;
  duration?: string;
  domain?: string;
  remote?: boolean;
}

export interface StudentProfile {
  bio: string;
  cv: string | null;
  phone: string;
}

export interface Candidature {
  id: number;
  offer: StageOffer;
  student: User;
  student_profile: StudentProfile | null;
  date_candidature: string;
  status: 'En attente' | 'Acceptée' | 'Refusée';
}

export interface DashboardStats {
  total_offers: number;
  pending_offers: number;
  validated_offers: number;
  closed_offers: number;
  refused_offers: number;
  total_candidatures: number;
  candidatures_by_month: Array<{ month: string; count: number }>;
}

class ApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.initCsrf();
  }

  private async initCsrf() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/csrf/`, {
        credentials: 'include',
      });
      const data = await response.json();
      this.csrfToken = data.csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add CSRF token for non-GET requests
    if (this.csrfToken && options.method && options.method !== 'GET') {
      headers['X-CSRFToken'] = this.csrfToken;
    }

    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An error occurred' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<User> {
    return this.request<User>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<User> {
    return this.request<User>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout/', { method: 'POST' });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me/');
  }

  // Offers endpoints
  async getOffers(queryString?: string): Promise<StageOffer[]> {
    return this.request<StageOffer[]>(`/offers/${queryString || ''}`);
  }

  async getOffer(id: number): Promise<StageOffer> {
    return this.request<StageOffer>(`/offers/${id}/`);
  }

  async createOffer(data: Partial<StageOffer>): Promise<StageOffer> {
    return this.request<StageOffer>('/offers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOffer(id: number, data: Partial<StageOffer>): Promise<StageOffer> {
    return this.request<StageOffer>(`/offers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteOffer(id: number): Promise<void> {
    return this.request<void>(`/offers/${id}/`, { method: 'DELETE' });
  }

  async exportOfferPDF(offerId: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/offers/${offerId}/export_pdf/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-CSRFToken': this.csrfToken || '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }
    
    return response.blob();
  }

  async applyToOffer(offerId: number): Promise<Candidature> {
    return this.request<Candidature>(`/offers/${offerId}/apply/`, {
      method: 'POST',
    });
  }

  async validateOffer(offerId: number, action: 'validate' | 'refuse'): Promise<StageOffer> {
    return this.request<StageOffer>(`/offers/${offerId}/validate_offer/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async getOfferCandidates(offerId: number): Promise<Candidature[]> {
    return this.request<Candidature[]>(`/offers/${offerId}/candidates/`);
  }

  // Candidatures endpoints
  async getCandidatures(): Promise<Candidature[]> {
    return this.request<Candidature[]>('/candidatures/');
  }

  async withdrawCandidature(id: number): Promise<void> {
    return this.request<void>(`/candidatures/${id}/withdraw/`, {
      method: 'POST',
    });
  }

  async updateCandidatureStatus(
    id: number,
    status: 'Acceptée' | 'Refusée' | 'En attente'
  ): Promise<Candidature> {
    return this.request<Candidature>(`/candidatures/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async exportAllCandidaturesPDF(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/candidatures/export_all_pdf/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-CSRFToken': this.csrfToken || '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }
    
    return response.blob();
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats/');
  }

  // Student profile endpoints
  async getStudentProfile(): Promise<StudentProfile> {
    return this.request<StudentProfile>('/student-profile/');
  }

  async updateStudentProfile(data: FormData): Promise<StudentProfile> {
    return this.request<StudentProfile>('/student-profile/', {
      method: 'PUT',
      body: data,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getFavorites(): Promise<StageOffer[]> {
    return this.request<StageOffer[]>('/favorites/');
  }

  async toggleFavorite(offerId: number): Promise<{ message: string; is_favorite: boolean }> {
    return this.request<{ message: string; is_favorite: boolean }>(`/favorites/${offerId}/toggle/`, {
      method: 'POST',
    });
  }

  async removeFavorite(offerId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/favorites/${offerId}/toggle/`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Exported helper functions
export const getOffers = () => api.getOffers();
export const getOffer = (id: number) => api.getOffer(id);
export const createOffer = (data: any) => api.createOffer(data);
export const validateOffer = (offerId: number) => api.validateOffer(offerId, 'validate');
export const refuseOffer = (offerId: number) => api.validateOffer(offerId, 'refuse');
export const getOfferCandidates = (offerId: number) => api.getOfferCandidates(offerId);
export const getCandidatures = () => api.getCandidatures();
export const updateCandidatureStatus = (id: number, status: 'Acceptée' | 'Refusée' | 'En attente') => 
  api.updateCandidatureStatus(id, status);
export const getStats = () => api.getDashboardStats();
export const getStudentProfile = () => api.getStudentProfile();
export const updateStudentProfile = (data: FormData) => api.updateStudentProfile(data);
export const getFavorites = () => api.getFavorites();
export const toggleFavorite = (offerId: number) => api.toggleFavorite(offerId);
