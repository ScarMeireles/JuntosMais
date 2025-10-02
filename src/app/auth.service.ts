import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  email: string;
  username: string;
  cpf: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly isAuthenticated = signal<boolean>(false);
  private readonly currentUser = signal<User | null>(null);

  constructor(private router: Router) {
    // Verificar se há dados de autenticação no localStorage apenas no cliente
    if (typeof window !== 'undefined') {
      this.checkStoredAuth();
    }
  }

  readonly getIsAuthenticated = () => this.isAuthenticated();
  readonly getCurrentUser = () => this.currentUser();

  login(email: string, password: string): boolean {
    // Simular autenticação - em produção, isso seria uma chamada para API
    if (email && password) {
      const user: User = {
        email: email,
        username: email.split('@')[0], // Simular nome de usuário baseado no email
        cpf: '000.000.000-00' // Simular CPF
      };

      this.isAuthenticated.set(true);
      this.currentUser.set(user);
      
      // Salvar no localStorage para persistir entre sessões (apenas no cliente)
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', 'fake-jwt-token');
        localStorage.setItem('userData', JSON.stringify(user));
      }
      
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    
    // Limpar dados do localStorage (apenas no cliente)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
    
    // Redirecionar para login
    this.router.navigate(['/']);
  }

  register(email: string, username: string, cpf: string, password: string): boolean {
    // Simular registro - em produção, isso seria uma chamada para API
    if (email && username && cpf && password) {
      // Simular sucesso no registro
      return true;
    }
    return false;
  }

  private checkStoredAuth(): void {
    // Verificar se estamos no cliente antes de acessar localStorage
    if (typeof window === 'undefined') {
      return;
    }
    
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
      } catch (error) {
        // Se houver erro ao parsear, limpar dados inválidos
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }
}
