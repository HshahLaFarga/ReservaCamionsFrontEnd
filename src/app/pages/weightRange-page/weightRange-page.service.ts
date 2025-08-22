import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { WeightRange } from '../../core/models/weightRange.module';

@Injectable({
  providedIn: 'root'
})

export class WeightRangePageService {
    constructor(
    private http: HttpClient
  ) {}

  getWeightRange(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/rango/cantidad`);
  }

  updateWeightRange(weightRange: WeightRange, weightRange_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/rango/cantidad/${weightRange_id}`,weightRange);
  }
}
