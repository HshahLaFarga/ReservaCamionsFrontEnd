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
  ) {}

  ngOnInit(): void {
    this._loginService.authState$.subscribe((user: LoggedUser | null) => {
      this.sidebarItems = this._sidebarService.getSidebarItems(user);
    });
  }

  toggleDropdown(label: string) {
    if (this.openDropdown === label) {
      this.openDropdown = null;
    } else {
      this.openDropdown = label;
    }
  }

  logout() {
    this._loginService.logout().subscribe({
      next: () => {
        // Redirigir a login
        this.router.navigate(['/login']);
      },
      error: (err: any) => {},
    });
  }
}
