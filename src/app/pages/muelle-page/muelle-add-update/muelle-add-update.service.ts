import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Muelle } from '../../../core/models/muelle.model';

@Injectable({
  providedIn: 'root'
})

export class MuelleAddUpdateService {
    constructor(
    private http: HttpClient
  ) {}

  storeMuelle(muelle: Muelle): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/muelles`,muelle);
  }

  updateMuelle(muelle: Muelle, muelle_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/muelles/${muelle_id}`,muelle);
  }
}
