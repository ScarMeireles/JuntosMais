// ...existing code...
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  register(payload: any): Observable<any> {
    return this.http.post(`${this.base}/register`, payload);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.base}/login`, credentials);
  }
}