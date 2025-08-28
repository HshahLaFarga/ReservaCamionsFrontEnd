import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { MaterialLock } from '../../core/models/material-lock.module';

@Injectable({
  providedIn: 'root'
})

export class MaterialLockPageService {
  constructor(
    private http: HttpClient
  ) { }

  getMaterialLocks(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/bloqueo/grupos`);
  }

  storeMaterialLocks(materialLock: MaterialLock): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/bloqueo/grupos`, materialLock);
  }

  deleteMateialLocks(materialLock: MaterialLock): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/bloqueo/grupos/${materialLock.bloqueo_grupo_id}`);
  }

  updateMaterialLocks(materialLock: MaterialLock): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/bloqueo/grupos/${materialLock.bloqueo_grupo_id}`, materialLock);
  }
}
