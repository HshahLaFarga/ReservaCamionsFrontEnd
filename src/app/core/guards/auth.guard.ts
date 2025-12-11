import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap, take } from 'rxjs/operators';
import { LoginService } from '../../features/auth/login/login.service';

export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  return loginService.authState$.pipe(
    take(1), // solo necesitamos el valor actual
    map(user => !!user),
    tap(isLoggedIn => {
      if (!isLoggedIn) {
        router.navigate(['/login']);
      }
    })
  );
};
