import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post<{token: string}>('/api/login', credentials,{
      withCredentials: true
    }).pipe(
      tap(()=>this.loggedIn.next(true))
    );
  }

  logout() {
    return this.http.post('/api/logout', {}, { withCredentials: true })
    .pipe(tap(() => this.loggedIn.next(false)));
  }

  isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  /** Consulta al backend si la cookie es válida */
  checkAuthenticated() {
    return this.http.get('/api/authenticated', {
      withCredentials: true
    }).pipe(
      tap((res: any) => {
        this.loggedIn.next(res.logged);
      })
    );
  }
}
