import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, TranslateModule], 
  templateUrl: 'main-layout.component.html',
  styles: []
})
export class MainLayoutComponent {
  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'es', 'fr']);
    const browserLang = translate.getBrowserLang() || 'en';
    translate.use(translate.getLangs().includes(browserLang) ? browserLang : 'en');
  }
}
