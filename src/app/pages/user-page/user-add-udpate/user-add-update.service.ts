import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Profile } from '../../../core/models/profile.module';

@Injectable({
  providedIn: 'root'
})

export class UserAddUdpateService {
    constructor(
    private http: HttpClient
  ) {}

  storeMuelle(profile: Profile): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/users`,profile);
  }

  updateMuelle(profile: Profile, profile_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/users/${profile_id}`,profile);
  }
}
