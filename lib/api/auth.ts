import apiClient from './client';
import { AuthResponse, LoginFormData, RegisterFormData, User } from '@/types';

export async function login(data: LoginFormData): Promise<AuthResponse> {
  const response = await apiClient.post('/api/auth/local', {
    identifier: data.identifier,
    password: data.password
  });
  return response.data;
}

export async function register(data: RegisterFormData): Promise<AuthResponse> {
  const response = await apiClient.post('/api/auth/local/register', {
    username: data.username,
    email: data.email,
    password: data.password
  });
  return response.data;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get('/api/users/me');
    return response.data;
  } catch (error) {
    return null;
  }
}

export function storeToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt', token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt');
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
} 