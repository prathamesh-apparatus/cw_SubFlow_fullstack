import { api } from '@/lib/api';
import type { Admin } from '@/types';
export const authService = { login: (email: string, password: string) => api.post<Admin>('/auth/login', { email, password }), logout: () => api.post('/auth/logout'), me: () => api.get<Admin>('/auth/me') };
