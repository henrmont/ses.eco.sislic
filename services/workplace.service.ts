import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workplace } from '../models/workplace.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkplaceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiSislicUrl}/workplaces`;

  getWorkplaces(): Observable<Workplace[]> {
    return this.http.get<Workplace[]>(this.apiUrl);
  }

  getWorkplace(id: number): Observable<Workplace> {
    return this.http.get<Workplace>(`${this.apiUrl}/${id}`);
  }

  createWorkplace(workplace: Workplace): Observable<Workplace> {
    return this.http.post<Workplace>(this.apiUrl, workplace);
  }

  updateWorkplace(id: number, workplace: Workplace): Observable<Workplace> {
    return this.http.put<Workplace>(`${this.apiUrl}/${id}`, workplace);
  }

  deleteWorkplace(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}