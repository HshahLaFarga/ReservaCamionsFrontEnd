import { Component, inject } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';
import { LoginService } from './features/auth/login/login.service';
import { environment } from './core/envoirment/envoirment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private loginService = inject(LoginService);

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'es', 'ca', 'fr']);
    this.translate.setDefaultLang('es');
    this.translate.use('es');

    this.loginService.checkAuth().subscribe();
  }
}
