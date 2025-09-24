import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Provider } from '../../core/models/provider.model';

@Injectable({
  providedIn: 'root'
})

export class ProviderPageService {
    constructor(
    private http: HttpClient
  ) {}

  getProviders(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/proveedores`);
  }

  deleteProvider(provider: Provider): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/proveedores/${provider.proveedor_id}`);
  }
}
