import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment.prod';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ProviderPageService {
    constructor(
    private http: HttpClient
  ) {}

  getProviders(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/proveedores`, { withCredentials: true});
  }
}
