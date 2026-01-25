import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { TipoProveedor } from '../../core/models/proveedor.model';


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

  deleteProviderType(providerType: TipoProveedor): Observable<any>{
    return this.http.delete(`${environment.apiBaseUrl}/tipoproveedores/${providerType.tipo_proveedor_id}`);
  }
}
