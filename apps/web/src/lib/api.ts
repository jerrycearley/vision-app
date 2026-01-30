import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; displayName: string; dateOfBirth?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getInterests: () => api.get('/users/interests'),
};

// Goals API
export const goalsApi = {
  list: (status?: string) => api.get('/goals', { params: { status } }),
  get: (id: string) => api.get(`/goals/${id}`),
  create: (data: any) => api.post('/goals', data),
  update: (id: string, data: any) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

// Roadmaps API
export const roadmapsApi = {
  list: () => api.get('/roadmaps'),
  get: (id: string) => api.get(`/roadmaps/${id}`),
  generate: (goalId: string, preferences?: any) =>
    api.post('/roadmaps/generate', { goalId, preferences }),
  completeMilestone: (roadmapId: string, milestoneId: string) =>
    api.post(`/roadmaps/${roadmapId}/milestones/${milestoneId}/complete`),
};

// Recommendations API
export const recommendationsApi = {
  list: (params?: any) => api.get('/recommendations', { params }),
  generate: (category?: string, count?: number) =>
    api.post('/recommendations/generate', { category, count }),
  get: (id: string) => api.get(`/recommendations/${id}`),
  favorite: (id: string, data?: any) =>
    api.post(`/recommendations/${id}/favorite`, data),
  getFavorites: () => api.get('/recommendations/favorites'),
};

// AI API
export const aiApi = {
  generateRoadmap: (goal: string, preferences?: any) =>
    api.post('/ai/roadmap', { goal, preferences }),
  generateRecommendations: (category?: string, count?: number) =>
    api.post('/ai/recommendations', { category, count }),
  chat: (message: string, history?: any[]) =>
    api.post('/ai/chat', { message, history }),
  inferInterests: () => api.get('/ai/infer-interests'),
};

// Connectors API
export const connectorsApi = {
  getAvailable: () => api.get('/connectors/available'),
  getConnected: () => api.get('/connectors'),
  initiateOAuth: (connectorType: string, scopes: string[]) =>
    api.post('/connectors/oauth/initiate', { connectorType, scopes }),
  upload: (data: { fileType: string; fileName: string; content: string; dataCategory: string }) =>
    api.post('/connectors/upload', data),
  getSignals: () => api.get('/connectors/signals/all'),
  getAggregatedInterests: () => api.get('/connectors/signals/aggregated'),
};

// Tokens API
export const tokensApi = {
  getBalance: () => api.get('/tokens/balance'),
  getHistory: (limit?: number, offset?: number) =>
    api.get('/tokens/history', { params: { limit, offset } }),
  transfer: (recipientId: string, amount: number, notes?: string) =>
    api.post('/tokens/transfer', { recipientId, amount, notes }),
};

// Sponsorship API
export const sponsorshipApi = {
  getSponsor: () => api.get('/sponsorship/sponsor'),
  contribute: (amount: number, currency?: string, beneficiaryId?: string) =>
    api.post('/sponsorship/contribute', { amount, currency, beneficiaryId }),
  getMySponsorships: () => api.get('/sponsorship/my-sponsorships'),
  getReceived: () => api.get('/sponsorship/received'),
  getLedger: () => api.get('/sponsorship/ledger'),
};

// Guardians API
export const guardiansApi = {
  inviteGuardian: (email: string, relationship?: string) =>
    api.post('/guardians/invite', { guardianEmail: email, relationship }),
  getMyGuardians: () => api.get('/guardians/my-guardians'),
  getMyMinors: () => api.get('/guardians/my-minors'),
  grantConsent: (data: any) => api.post('/guardians/consent', data),
};
