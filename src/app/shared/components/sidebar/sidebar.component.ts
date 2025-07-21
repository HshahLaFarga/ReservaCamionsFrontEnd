import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  imports: [RouterModule,TranslateModule],
  styles: []
})
export class SidebarComponent {
logout() {
throw new Error('Method not implemented.');
}
}
