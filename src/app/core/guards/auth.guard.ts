import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { LoginService } from '../../features/auth/login/login.service';

export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);
// return true;
  return loginService.isLoggedIn$.pipe(
    tap(isLoggedIn => {
      if (!isLoggedIn) {
        router.navigate(['/login']);
      }
    }),
    map(isLoggedIn => isLoggedIn)

  );
};