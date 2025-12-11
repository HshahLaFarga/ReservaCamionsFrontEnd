import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { LoggedUser } from '../../../core/models/logged_user.model';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private _authState = new BehaviorSubject<LoggedUser | null>(null);
  authState$ = this._authState.asObservable();

  // Helper para saber el tipo de instancia actual fácilmente
  currentInstanceType$ = this.authState$.pipe(
      map(state => state?.instance || null)
  );

  constructor(private http: HttpClient) {
    this.checkAuth().subscribe();
  }

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

  login(login: string, password: string): Observable<LoggedUser> {
    return this.http.get(`${environment.apiBaseUrl}/sanctum/csrf-cookie`).pipe(
      switchMap(() => {
        const CSRFtoken = this.getCSRFToken();
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          ...(CSRFtoken ? { 'X-XSRF-TOKEN': CSRFtoken } : {}),
        });

        return this.http.post<LoggedUser>(`${environment.apiBaseUrl}/login`, { login, password }, { headers })
          .pipe(tap((res) => {
            this._authState.next(res);
            console.log('Logged in user:', res);
          }));
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this._authState.next(null))
    );
  }

  checkAuth(): Observable<LoggedUser | null> {
  return this.http.get<LoggedUser>(`${environment.apiBaseUrl}/authenticated`, { withCredentials: true })
    .pipe(
      tap(res => this._authState.next(res)),
      catchError(() => {
        this._authState.next(null);
        return of(null);
      })
    );
}


  get currentUser(): LoggedUser | null {
      return this._authState.value;
  }
}
