import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Profile } from './profile-page.types';

@Injectable({
  providedIn: 'root'
})
export class ProfilePageService {
  constructor(
    private http: HttpClient
  ) {}

  updateProfile(user: Profile): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/users/${'4'}`,user, { withCredentials: true});
  }
}
