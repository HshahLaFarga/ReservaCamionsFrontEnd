import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../core/envoirment/envoirment.prod';
@Injectable({
  providedIn: 'root'
})

export class MaterialLockAddService {
  constructor(
    private http: HttpClient
  ) { }

  getTypeProviders(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/tipo_proveedores`, { withCredentials: true });
  }

  getMaterials(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/materiales`, { withCredentials: true });
  }

  storeMaterial(materialLock: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/bloqueo_grupos`, materialLock , { withCredentials: true });
  }
}
