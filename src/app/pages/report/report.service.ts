import { Time } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../core/envoirment/envoirment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private http: HttpClient
  ) {   }

  getReport(from: Date, to: Date): Observable<any>{
    return this.http.post(`${environment.apiBaseUrl}/report`, {from, to}, { responseType: 'blob' });
  }
}
