import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { environment } from '../../../core/envoirment/envoirment';
import { Provider } from '../../../core/models/provider.module';

@Injectable({
  providedIn: 'root'
})

export class ProviderAddService {

    constructor(
    private http: HttpClient
  ) {}

  storeProvider(provider: Provider): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/proveedores`,provider);
  }

  updateProvider(provider: Provider, provider_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/proveedores/${provider_id}`,provider);
  }
}
