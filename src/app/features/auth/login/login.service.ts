import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import {  LoggedUser } from '../../../core/models/logged_user.model';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private _authState = new BehaviorSubject<LoggedUser | null>(null);
  authState$ = this._authState.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuth().subscribe();
  }

  login(login: string, password: string): Observable<LoggedUser> {
    return this.http.get(`${environment.apiBaseUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
      switchMap(() =>
        this.http.post<LoggedUser>(`${environment.apiBaseUrl}/login`,
          { login, password },
          { withCredentials: true }
        )
      ),
      tap(user => this._authState.next(user))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this._authState.next(null)));
  }

  checkAuth(): Observable<LoggedUser | null> {
    return this.http.get<LoggedUser>(`${environment.apiBaseUrl}/authenticated`, { withCredentials: true })
      .pipe(
        tap(user => this._authState.next(user)),
        catchError(() => {
          this._authState.next(null);
          return of(null);
        })
      );
  }

  get currentUser(): LoggedUser | null {
    return this._authState.value;
  }

  get isReadOnly(): boolean {
    const user = this.currentUser;
    if (user && user.instance === 'usuario') {
      return user.user.rol_id === 2; // La Farga - View
    }
    return false;
  }
}
