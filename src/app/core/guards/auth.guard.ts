import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../features/auth/login/login.service';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';


export const authGuard: CanActivateFn = async () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  // 1️⃣ Si ya tenemos usuario en memoria
  if (loginService.currentUser) return true;

  // 2️⃣ Si no, consultar backend
  try {
    const res = await loginService.checkAuth().toPromise();

    // Revisar la respuesta del backend
    if (res?.logged && res?.user) {
      return true;
    }

    // No autenticado → redirigir al login
    router.navigate(['/login']);
    return false;

  } catch (error) {
    // Error de red o backend → bloquear navegación
    router.navigate(['/login']);
    return false;
  }
};
