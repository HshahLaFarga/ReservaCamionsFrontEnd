import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../core/envoirment/envoirment';
import { Material } from '../../../core/models/material.model';

@Injectable({
  providedIn: 'root'
})

export class MaterialAddUpdateService {
    constructor(
    private http: HttpClient
  ) {}

  getTrucks(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/tipocamiones`);
  }

  getMuelles(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/muelles`);
  }

  storeMaterial(material: Material): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/materiales`,material);
  }

  updateMaterial(material: Material, material_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/materiales/${material_id}`,material)
  }
}
