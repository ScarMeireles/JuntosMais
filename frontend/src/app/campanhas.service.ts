import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';

export interface Campanha {
  id?: number;
  name: string;
  type: string;
  description: string;
  location: string;
  website?: string;
  phone?: string;
  email?: string;
  verified?: boolean;
  rating?: number;
  donationsReceived: number;
  targetAmount: number;
  data_fim?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class CampanhasService {
  private readonly base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Adicionar nova campanha
  addCampanha(campanha: Omit<Campanha, 'id'>): Observable<Campanha> {
    // Mapear campos do frontend para o formato do backend
    const payload = {
      nome: campanha.name,
      tipo_categoria: campanha.type,
      descricao: campanha.description,
      localizacao: campanha.location,
      website: campanha.website || null,
      telefone: campanha.phone || null,
      email: campanha.email || null,
      meta_valor: campanha.targetAmount,
      data_fim: campanha.data_fim || null
    };

    return this.http.post<any>(`${this.base}/campanhas`, payload).pipe(
      map(res => ({
        id: res.id,
        name: res.nome,
        type: res.tipo_categoria,
        description: res.descricao,
        location: res.localizacao,
        website: res.website,
        phone: res.telefone,
        email: res.email,
        targetAmount: res.meta_valor,
        verified: res.ativa,
        rating: res.rating || 0,
        donationsReceived: res.valor_arrecadado || 0,
        data_fim: res.data_fim
      }))
    );
  }

  // Obter todas as campanhas
  getCampanhas(): Observable<Campanha[]> {
    return this.http.get<any[]>(`${this.base}/campanhas`).pipe(
      map(campanhas => campanhas.map(c => ({
        id: c.id,
        name: c.nome,
        type: c.tipo_categoria,
        description: c.descricao,
        location: c.localizacao,
        website: c.website,
        phone: c.telefone,
        email: c.email,
        targetAmount: c.meta_valor,
        verified: c.ativa,
        rating: c.rating || 0,
        donationsReceived: c.valor_arrecadado || 0,
        data_fim: c.data_fim
      })))
    );
  }

  // Obter campanha por ID
  getCampanha(id: number): Observable<Campanha> {
    return this.http.get<any>(`${this.base}/campanhas/${id}`).pipe(
      map(c => ({
        id: c.id,
        name: c.nome,
        type: c.tipo_categoria,
        description: c.descricao,
        location: c.localizacao,
        website: c.website,
        phone: c.telefone,
        email: c.email,
        targetAmount: c.meta_valor,
        verified: c.ativa,
        rating: c.rating || 0,
        donationsReceived: c.valor_arrecadado || 0,
        data_fim: c.data_fim
      }))
    );
  }

  // Atualizar campanha
  updateCampanha(id: number, campanha: Partial<Campanha>): Observable<Campanha> {
    const payload: any = {};
    if (campanha.name) payload.nome = campanha.name;
    if (campanha.type) payload.tipo_categoria = campanha.type;
    if (campanha.description) payload.descricao = campanha.description;
    if (campanha.location) payload.localizacao = campanha.location;
    if (campanha.website !== undefined) payload.website = campanha.website;
    if (campanha.phone !== undefined) payload.telefone = campanha.phone;
    if (campanha.email !== undefined) payload.email = campanha.email;
    if (campanha.targetAmount) payload.meta_valor = campanha.targetAmount;
    if (campanha.data_fim !== undefined) payload.data_fim = campanha.data_fim;

    return this.http.put<any>(`${this.base}/campanhas/${id}`, payload).pipe(
      map(c => ({
        id: c.id,
        name: c.nome,
        type: c.tipo_categoria,
        description: c.descricao,
        location: c.localizacao,
        website: c.website,
        phone: c.telefone,
        email: c.email,
        targetAmount: c.meta_valor,
        verified: c.ativa,
        rating: c.rating || 0,
        donationsReceived: c.valor_arrecadado || 0,
        data_fim: c.data_fim
      }))
    );
  }

  // Deletar campanha
  deleteCampanha(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/campanhas/${id}`);
  }
}