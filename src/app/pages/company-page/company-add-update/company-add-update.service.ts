import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Company } from '../../../core/models/company.model';

@Injectable({
  providedIn: 'root'
})

export class CompanyAddUpdateService {

  constructor(
    private http: HttpClient
  ) {}

  storeCompany(company: Company): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/empresas_lfycs`,company);
  }

  updateCompany(company: Company, Company_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/empresas_lfycs/${Company_id}`,company);
  }
}
