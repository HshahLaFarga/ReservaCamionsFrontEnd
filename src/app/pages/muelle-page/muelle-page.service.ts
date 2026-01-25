import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Muelle } from '../../core/models/muelle.model';

@Injectable({
  providedIn: 'root'
})

export class MuellePageService {
    constructor(
    private http: HttpClient
  ) {}

  getMuelles(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/muelles`);
  }

  deleteMuelles(muelle: Muelle): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/muelles/${muelle.muelle_id}`);
  }
}
