import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarService } from './sidebar.service';
import { SidebarItem } from '../../../core/models/sidebar.model';
import { MatIconModule } from '@angular/material/icon';
import { LoggedUser } from '../../../core/models/logged_user.model';
import { LoginService } from '../../../features/auth/login/login.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  imports: [RouterModule, TranslateModule, CommonModule, MatIconModule],
})
export class SidebarComponent implements OnInit {
  sidebarItems: SidebarItem[] = [];

  openDropdown: string | null = null;
  router: any;

  usuario$ = this._loginService.authState$;

  constructor(
    private _sidebarService: SidebarService,
    private _loginService: LoginService
  ) { }

  ngOnInit(): void {
    this._loginService.authState$.subscribe((user: LoggedUser | null) => {
      this.sidebarItems = this._sidebarService.getSidebarItems(user);
      console.log('user', user);
    });
  }

  toggleDropdown(label: string) {
    if (this.openDropdown === label) {
      this.openDropdown = null;
    } else {
      this.openDropdown = label;
    }
  }

  /**
   * Verifica si el usuario actual es administrador
   * Ajusta la lógica según tu sistema de roles:
   * - Opción 1: Por rol_id (ej: 1 = admin)
   * - Opción 2: Por nombre de rol en el array roles
   */
  isAdmin(): boolean {
    const user = this._loginService.currentUser;

    // Si es una entidad externa, nunca es admin
    if (!user || user.instance === 'entidad') {
      return false;
    }

    // Si es usuario interno, verificamos el rol
    const profile = (user as any).user;

    // Opción 1: Verificar por rol_id (ajusta el ID según tu BD)
    // Asumiendo que rol_id = 1 es Admin
    if (profile.rol_id === 1) {
      return true;
    }

    // Opción 2: Verificar por nombre en el array de roles
    if (profile.roles && Array.isArray(profile.roles)) {
      return profile.roles.some((rol: any) =>
        rol.nombre?.toLowerCase() === 'admin' ||
        rol.nombre?.toLowerCase() === 'administrador'
      );
    }

    // Por defecto, no es admin
    return false;
  }

  logout() {
    this._loginService.logout().subscribe({
      next: () => {
        // Redirigir a login
        this.router.navigate(['/login']);
      },
      error: (err: any) => console.error('Error al cerrar sesión', err),
    });
  }
}
