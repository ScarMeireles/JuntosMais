// doacoes.service.ts
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Doacao {
  campanha_id: number;
  valor: number;
  doador_nome: string;
  doador_email: string;
  doador_cpf: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoacoesService {
  private readonly base = environment.apiBaseUrl;
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  criarDoacao(doacao: Doacao): Observable<any> {
    console.log('📤 Enviando doação para API:', doacao);
    console.log('URL:', `${this.base}/doacoes/`);
    
    const headers = this.getAuthHeaders();
    
    return this.http.post(`${this.base}/doacoes/`, doacao, { headers }).pipe(
      tap((response: any) => console.log('✅ Resposta da API:', response)),
      catchError((error: any) => {
        console.error('❌ Erro na API:', error);
        console.error('Status:', error.status);
        console.error('Mensagem:', error.message);
        return throwError(() => error);
      })
    );
  }

  obterDoacao(doacaoId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.base}/doacoes/${doacaoId}`, { headers });
  }

  confirmarDoacao(doacaoId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.base}/doacoes/${doacaoId}/confirmar`, {}, { headers });
  }

  cancelarDoacao(doacaoId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.base}/doacoes/${doacaoId}/cancelar`, {}, { headers });
  }

  listarDoacoesCampanha(campanhaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/doacoes/campanha/${campanhaId}`);
  }

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }
}