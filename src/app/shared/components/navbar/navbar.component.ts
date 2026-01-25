import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SidebarItem } from '../../../core/models/sidebar.model';
import { SidebarService } from '../sidebar/sidebar.service';
import { LoggedUser } from '../../../core/models/logged_user.model';
import { LoginService } from '../../../features/auth/login/login.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [RouterModule, CommonModule, TranslateModule],
  styles: [],
})
export class NavbarComponent implements OnInit {
  dropdownOpen = false;
  currentLang: string;

  // Idiomes actuals
  langs: string[] = ['ca', 'es', 'en', 'fr'];

  sidebarItems: SidebarItem[] = [];

  constructor(
    private translate: TranslateService,
    private elRef: ElementRef,
    private _sidebarService: SidebarService,
    private _loginService: LoginService
  ) {
    this.currentLang =
      this.translate.currentLang || this.translate.getDefaultLang() || 'en';
  }
  ngOnInit(): void {
    this._loginService.authState$.subscribe((user: LoggedUser | null) => {
      this.sidebarItems = this._sidebarService.getSidebarItems(user);
      console.log('Navbar - sidebarItems:', this.sidebarItems);
    });
  }

  // #### CONFIGURACIÓ IDIOMES ####
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Si fas click a fora es tanqui el desplegable dels idiomes
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
    this.dropdownOpen = false;
  }
  // ##############################

  // #### Responsive sidebar ####
  mobileSidebarOpen = false;
  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }
  // ############################
  logout() {
    console.log('Logout clicked');
    this._loginService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        document.location.reload();
      },
      error: (err) => {
        console.error('Error during logout:', err);
      },
    });
  }
}
