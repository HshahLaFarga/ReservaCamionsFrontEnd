import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { TipoProveedor } from '../../../core/models/proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProviderTypeAddUpdateService {

  constructor(
        private http: HttpClient
  ) { }

  addProviderType(providerType: TipoProveedor): Observable<any> {
      return this.http.post(`${environment.apiBaseUrl}/tipoproveedores`,providerType);
  }

  updateProviderType(providerType: TipoProveedor, truck_id: number): Observable<any> {
      return this.http.put(`${environment.apiBaseUrl}/tipoproveedores/${truck_id}`,providerType);
    }
}
