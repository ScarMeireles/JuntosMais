import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface NGO {
  id: number;
  name: string;
  type: string;
  description: string;
  location: string;
  website?: string;
  phone?: string;
  email?: string;
  verified: boolean;
  rating: number;
  donationsReceived: number;
  targetAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NgosService {
  private readonly storageKey = 'juntosMais_ongs';

  constructor(private http: HttpClient) {}

  getNGOs(): Observable<NGO[]> {
    // Primeiro tenta carregar do localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return of(parsed);
        } catch (error) {
          console.error('Erro ao parsear ONGs do localStorage:', error);
        }
      }
    }

    // Se não houver no localStorage, carrega do arquivo JSON
    return this.http.get<NGO[]>('assets/data/ongs.json').pipe(
      map(ngos => {
        // Salva no localStorage para futuras consultas
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.storageKey, JSON.stringify(ngos));
        }
        return ngos;
      }),
      catchError(error => {
        console.error('Erro ao carregar ONGs:', error);
        return of([]);
      })
    );
  }

  addNGO(ngo: Omit<NGO, 'id'>): Observable<NGO> {
    return this.getNGOs().pipe(
      map(ngos => {
        // Gera um novo ID baseado no maior ID existente + 1
        const maxId = ngos.length > 0 ? Math.max(...ngos.map(n => n.id)) : 0;
        const newNGO: NGO = {
          ...ngo,
          id: maxId + 1
        };

        // Adiciona a nova ONG à lista
        const updatedNGOs = [...ngos, newNGO];

        // Salva no localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.storageKey, JSON.stringify(updatedNGOs));
        }

        return newNGO;
      })
    );
  }

  // Método para obter os tipos únicos de ONGs (para o dropdown)
  getNGOTypes(): Observable<string[]> {
    return this.getNGOs().pipe(
      map(ngos => {
        const types = ngos.map(ngo => ngo.type);
        return Array.from(new Set(types)).sort();
      })
    );
  }
}

