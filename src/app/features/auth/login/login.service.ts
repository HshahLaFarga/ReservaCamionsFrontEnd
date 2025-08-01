import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Referer': environment.refererHeader
    });

    return this.http.get('http://localhost/sanctum/csrf-cookie', { withCredentials: true}).pipe(
      switchMap(() => {
        return this.http.post('http://localhost/api/login', { email, password }, {
          headers,
          withCredentials: true
        }).pipe(
          tap(() => this._isLoggedIn.next(true))
        );
      })
    );
  }



  logout(): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this._isLoggedIn.next(false))
    );
  }

  // Para comprobar si está autenticado, podrías tener un endpoint en backend que confirme el estado
  checkAuth(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/authenticated`, { withCredentials: true }).pipe(
      tap((res: any) => this._isLoggedIn.next(res.authenticated))
    );
  }
}
