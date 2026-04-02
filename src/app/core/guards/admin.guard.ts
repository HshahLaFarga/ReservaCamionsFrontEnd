import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../features/auth/login/login.service';
import { firstValueFrom } from 'rxjs';

/**
 * Guard que protege las rutas de administración.
 * Solo los usuarios internos (instance === 'usuario') pueden acceder.
 * Los proveedores/transportistas (instance === 'entidad') son redirigidos al calendario.
 */
export const adminGuard: CanActivateFn = async () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  // 1️⃣ Comprobar usuario en memoria primero
  let currentUser = loginService.currentUser;

  // 2️⃣ Si no hay usuario en memoria, hacer check al backend
  if (!currentUser) {
    try {
      currentUser = await firstValueFrom(loginService.checkAuth());
    } catch {
      router.navigate(['/login']);
      return false;
    }
  }

  // 3️⃣ Si no está autenticado, redirigir al login
  if (!currentUser?.logged) {
    router.navigate(['/login']);
    return false;
  }

  // 4️⃣ Solo los usuarios internos pueden acceder a rutas de administración
  if (currentUser.instance === 'usuario') {
    return true;
  }

  // 5️⃣ Las entidades externas (proveedores/transportistas) van al calendario
  router.navigate(['/calendar']);
  return false;
};
