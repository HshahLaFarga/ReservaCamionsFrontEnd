import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Profile } from '../../../core/models/usuario.model';

@Injectable({
  providedIn: 'root'
})

export class UserAddUdpateService {
    constructor(
    private http: HttpClient
  ) {}

  storeUser(profile: Profile): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/users`,profile);
  }

  updateUser(profile: Profile, profile_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/users/${profile_id}`,profile);
  }
}
