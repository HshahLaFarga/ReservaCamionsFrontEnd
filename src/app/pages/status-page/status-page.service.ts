import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';

@Injectable({
  providedIn: 'root'
})

export class StatusPageService {

  constructor(
    private http: HttpClient
  ) { }

  getStatus(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/status`);
  }

  deleteStatus(estado_id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/status/${estado_id}`);
  }
}
