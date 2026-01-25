import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Profile } from '../../core/models/usuario.model';

@Injectable({
  providedIn: 'root'
})

export class UserPageService {
    constructor(
    private http: HttpClient
  ) {}

  getUser(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/users`);
  }

  deleteUser(profile: Profile): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/users/${profile.id}`);
  }
}
