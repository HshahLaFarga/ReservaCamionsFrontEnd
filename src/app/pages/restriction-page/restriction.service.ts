import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Restriction } from '../../core/models/restriction.model';

@Injectable({
  providedIn: 'root'
})
export class RestrictionService {

  constructor(
    private http: HttpClient
  ) { }

  getRestricciones(): Observable<any>{
      return this.http.get(`${environment.apiBaseUrl}/restricciones`);
  }

  getMuelles(): Observable<any>{
      return this.http.get(`${environment.apiBaseUrl}/muelles`);
  }

  addRestriccion(restricciones: { muelle_id: number, muelle_restringido_id: number }[]): Observable<any>{
      return this.http.post(`${environment.apiBaseUrl}/restricciones`, restricciones);
  }

  deleteRestriccion(restricciones: { muelle_id: number, muelle_restringido_id: number }[]): Observable<any>{
      return this.http.delete(`${environment.apiBaseUrl}/restricciones/bulk-delete`, { body: restricciones });
  }
}
