import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../core/envoirment/envoirment';
@Injectable({
  providedIn: 'root'
})

export class MaterialLockAddService {
  constructor(
    private http: HttpClient
  ) { }

  getTypeProviders(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/tipoproveedores`);
  }

  getMaterials(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/materiales`);
  }

  storeMaterial(materialLock: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/bloqueo/grupos`, materialLock);
  }

  updateMaterial(id: number, materialLock: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/bloqueo/grupos/${id}`, materialLock);
  }
}
