import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly base = environment.apiBaseUrl;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'user_data';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser: boolean;

  // Usando signals para estado reativo
  protected readonly isAuthenticated = signal<boolean>(false);
  protected readonly currentUser = signal<User | null>(null);
  protected readonly isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('🔧 AuthService inicializado');
    console.log('🌐 isBrowser:', this.isBrowser);
    console.log('🔗 API Base URL:', this.base);
    
    // Verificar autenticação ao inicializar
    this.checkInitialAuth();
  }

  private checkInitialAuth(): void {
    if (!this.isBrowser) {
      console.log('⚠️ SSR detectado - pulando checkInitialAuth');
      return; // Não faz nada durante SSR
    }

    const token = localStorage.getItem(this.tokenKey);
    const userData = localStorage.getItem(this.userKey);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
        console.log('✅ Usuário autenticado automaticamente:', user.email);
      } catch (error) {
        console.error('❌ Erro ao parsear dados do usuário:', error);
        this.logout();
      }
    } else {
      console.log('ℹ️ Nenhum token encontrado no localStorage');
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    this.isLoading.set(true);
    
    const url = `${this.base}/login`;
    console.log('===== 🔐 DEBUG LOGIN =====');
    console.log('Base URL:', this.base);
    console.log('URL Completa:', url);
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('isBrowser:', this.isBrowser);
    console.log('=========================');
    
    return this.http.post<AuthResponse>(url, {
      email,
      password
    }).pipe(
      tap({
        next: (response) => {
          console.log('✅ Login bem sucedido!');
          console.log('Response:', response);
          this.handleLoginSuccess(response);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('===== ❌ ERRO NO LOGIN =====');
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('URL tentada:', error.url);
          console.error('Mensagem:', error.message);
          console.error('Error completo:', error);
          console.error('============================');
          this.isLoading.set(false);
          throw error;
        }
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    this.isLoading.set(true);
    
    const url = `${this.base}/register`;
    console.log('===== 📝 DEBUG REGISTER =====');
    console.log('URL Completa:', url);
    console.log('User Data:', userData);
    console.log('============================');
    
    return this.http.post<AuthResponse>(url, userData).pipe(
      tap({
        next: (response) => {
          console.log('✅ Registro bem sucedido!');
          console.log('Response:', response);
          this.handleLoginSuccess(response);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('===== ❌ ERRO NO REGISTRO =====');
          console.error('Status:', error.status);
          console.error('URL tentada:', error.url);
          console.error('Error completo:', error);
          console.error('================================');
          this.isLoading.set(false);
          throw error;
        }
      })
    );
  }

  private handleLoginSuccess(response: AuthResponse): void {
    if (!this.isBrowser) {
      console.log('⚠️ SSR detectado - pulando handleLoginSuccess');
      return;
    }

    console.log('💾 Salvando dados no localStorage...');
    // Salvar token e dados do usuário
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    
    // Atualizar estado
    this.isAuthenticated.set(true);
    this.currentUser.set(response.user);
    
    console.log('✅ Login realizado com sucesso:', response.user.email);
    console.log('Token salvo:', response.token.substring(0, 20) + '...');
  }

  logout(): void {
    if (!this.isBrowser) {
      console.log('⚠️ SSR detectado - pulando logout');
      return;
    }

    console.log('🚪 Fazendo logout...');
    // Limpar localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    
    // Atualizar estado
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    
    console.log('✅ Usuário deslogado');
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Getters para os signals (para uso em templates)
  getIsAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  getIsLoading() {
    return this.isLoading.asReadonly();
  }

  updateUser(updatedUser: User): void {
    if (!this.isBrowser) {
      console.log('⚠️ SSR detectado - pulando updateUser');
      return;
    }
    console.log('🔄 Atualizando usuário:', updatedUser.email);
    localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
    this.currentUser.set(updatedUser);
    console.log('✅ Usuário atualizado com sucesso');
  }
}