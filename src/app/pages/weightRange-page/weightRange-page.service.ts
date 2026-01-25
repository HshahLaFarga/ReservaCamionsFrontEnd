import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Parametro } from '../../core/models/parametro';

@Injectable({
  providedIn: 'root'
})

export class WeightRangePageService {
    constructor(
    private http: HttpClient
  ) {}

  getWeightRange(): Observable<any> {

    const params = new HttpParams()
    .append('keys[]', 'min_kg')
    .append('keys[]', 'max_kg');
  
    return this.http.get(`${environment.apiBaseUrl}/config/claves`, { params });
  }

  updateWeightRange(claves: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/config/claves`,claves);
  }
}
