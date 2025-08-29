import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Material } from '../../core/models/material.model';

@Injectable({
  providedIn: 'root'
})

export class MaterialPageService {
    constructor(
    private http: HttpClient
  ) {}

  getMaterials(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/materiales`);
  }

  deleteProvider(material: Material): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/materiales/${material.material_id}`);
  }
}
