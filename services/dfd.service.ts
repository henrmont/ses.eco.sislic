import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of } from 'rxjs';
import * as moment from 'moment';

// Environments & Models
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/models/api-response.model';
import { Dfd } from '../models/dfd.model';
import { DfdItem } from '../models/dfd-item.model';
import { DfdMember } from '../models/dfd-member.model';

@Injectable({
  providedIn: 'root',
})
export class DfdService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiSislicUrl}/dfds`;

  // ==========================================
  // 1. CONSULTAS E LISTAGENS PRINCIPAIS (DFD HEADER)
  // ==========================================

  getDfds(): Observable<Dfd[]> {
    return this.http.get<Dfd[]>(this.apiUrl);
  }

  getArchivedDfds(): Observable<Dfd[]> {
    return this.http.get<Dfd[]>(`${this.apiUrl}/archived`);
  }

  getDfd(dfdId: number): Observable<Dfd> {
    return this.http.get<Dfd>(`${this.apiUrl}/${dfdId}`);
  }

  // ==========================================
  // 2. OPERAÇÕES CRUD DO DFD
  // ==========================================

  createDfd(data: Partial<Dfd>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, data);
  }

  updateDfd(dfdId: number, data: Partial<Dfd>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${dfdId}`, data);
  }

  deleteDfd(dfdId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${dfdId}`);
  }

  // ==========================================
  // 3. TRAMITAÇÕES E AÇÕES DE ESTADO
  // ==========================================

  archiveDfd(dfdId: number): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.apiUrl}/${dfdId}/archive`, {});
  }

  validateDfd(dfdId: number, data?: Record<string, unknown>): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.apiUrl}/${dfdId}/validate`, data ?? {});
  }

  // ==========================================
  // 4. OPERAÇÕES DE ITENS (DFD-ITEMS)
  // ==========================================

  getItems(dfdId: number): Observable<DfdItem[]> {
    return this.http.get<DfdItem[]>(`${this.apiUrl}/${dfdId}/items`);
  }

  createItem(dfdId: number, data: Partial<DfdItem>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/${dfdId}/items`, data);
  }

  updateItem(itemId: number, data: Partial<DfdItem>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/items/${itemId}`, data);
  }

  deleteItem(itemId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/items/${itemId}`);
  }

  // ==========================================
  // 5. OPERAÇÕES DE MEMBROS (DFD-MEMBERS)
  // ==========================================

  getMembers(dfdId: number): Observable<DfdMember[]> {
    return this.http.get<DfdMember[]>(`${this.apiUrl}/${dfdId}/members`);
  }

  createMember(dfdId: number, data: Partial<DfdMember>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/${dfdId}/members`, data);
  }

  updateMember(memberId: number, data: Partial<DfdMember>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/members/${memberId}`, data);
  }

  deleteMember(memberId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/members/${memberId}`);
  }

  // ==========================================
  // 6. MÉTODOS AUXILIARES
  // ==========================================

  private mountFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData();

    if (!data) return formData;

    for (const [key, value] of Object.entries(data)) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value, 'file');
      } else if (moment.isMoment(value)) {
        formData.append(key, value.format('YYYY-MM-DD'));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    }

    return formData;
  }
}