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
  // auth.service.ts o similar
  // Función para obtener el valor limpio de la cookie XSRF-TOKEN
getCSRFToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  return null;
}

login(email: string, password: string): Observable<any> {
  return this.http.get('http://localhost/sanctum/csrf-cookie').pipe(
    switchMap(() => {
      const token = this.getCSRFToken();

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token ? { 'X-XSRF-TOKEN': token } : {})
      });

      return this.http.post('http://localhost/api/login', { email, password }, {
        headers,
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
