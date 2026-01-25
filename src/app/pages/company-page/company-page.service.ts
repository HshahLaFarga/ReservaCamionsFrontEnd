import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Company } from '../../core/models/company.model';

@Injectable({
  providedIn: 'root'
})

export class CompanyPageService {
    constructor(
    private http: HttpClient
  ) {}

  getCompanys(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/empresas_lfycs`);
  }

  deleteCompany(company: Company): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/empresas_lfycs/${company.empresa_lfycs_id}`);
  }
}
