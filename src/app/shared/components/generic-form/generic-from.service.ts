import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../core/envoirment/envoirment.prod';

@Injectable({
  providedIn: 'root'
})

export class GenericFormService {
    constructor(
    private http: HttpClient
  ) {}

  getGenericItems(table:string): Observable<any> {
    console.log(table);
    return this.http.get(`${environment.apiBaseUrl}/columns/${table}`, { withCredentials: true});
  }
  
  getComboboxItems(apiRoute: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/${apiRoute}`, { withCredentials: true});
  }
}
