import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [RouterModule, CommonModule, TranslateModule],
  styles: []
})
export class NavbarComponent {
  dropdownOpen = false;
  currentLang: string;
  // Idiomes actuals
  langs: string[] = ['ca','es','en','fr'];

  constructor(private translate: TranslateService, private elRef: ElementRef) {
    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
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
  }
}
