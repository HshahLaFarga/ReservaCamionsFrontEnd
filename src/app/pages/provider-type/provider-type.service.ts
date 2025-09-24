import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { ProviderType } from '../../core/models/provider.model';


@Injectable({
  providedIn: 'root'
})
export class ProviderTypeService {

  constructor(
        private http: HttpClient
  ) { }

  getProviderType(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/tipoproveedores`);
  }

  deleteProviderType(providerType: ProviderType): Observable<any>{
    return this.http.delete(`${environment.apiBaseUrl}/tipoproveedores/${providerType.tipo_proveedor_id}`);
  }
}
