import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Profile } from '../../core/models/profile.module';

@Injectable({
  providedIn: 'root'
})
export class ProfilePageService {
  constructor(
    private http: HttpClient
  ) {}

  updateProfile(user: Profile): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/users/${user.id}`,user);
  }
}
