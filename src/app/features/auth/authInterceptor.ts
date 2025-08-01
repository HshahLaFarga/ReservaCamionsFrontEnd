// src/app/features/auth/authInterceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
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

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.getCSRFToken();

    if (token) {
      const cloned = req.clone({
        withCredentials: true,
        setHeaders: {
          'X-XSRF-TOKEN': token
        }
      });
      return next.handle(cloned);
    }

    // Si no hay token, igualmente se puede enviar la request
    return next.handle(req.clone({ withCredentials: true }));
  }
}
