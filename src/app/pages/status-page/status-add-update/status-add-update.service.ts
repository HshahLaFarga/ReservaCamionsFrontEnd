import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { Status } from '../../../core/models/estado.model';

@Injectable({
  providedIn: 'root'
})

export class StatusAddUpdateService {

  constructor(
    private http: HttpClient
  ) { }

  addStatus(status: Status) {
    return this.http.post(`${environment.apiBaseUrl}/status`, status);
  }

  updateStatus(status: Status, estado_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/status/${estado_id}`,status);
  }
}
