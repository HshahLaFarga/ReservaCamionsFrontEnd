import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardOption } from '../../core/models/dashboard.model';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './dashboard-page.component.html',
})

export class DashboardPageComponent {
  // Simula permisos del usuario
  userPermissions = ['reservas', 'perfil','calendario'];

  // Array amb totes les opcions possibles
  private allOptions: DashboardOption[] = [
    {
      labelKey: 'RESERVAS',
      icon: 'event_available',
      route: '/bookings',
      permission: 'reservas',
      descriptionKey: 'Gestiona tus reservas aquí'
    },
    {
      labelKey: 'CALENDARIO',
      icon: 'calendar_today',
      route: '/calendar',
      permission: 'calendario',
      descriptionKey: 'Consulta el calendario'
    },
    {
      labelKey: 'PERFIL',
      icon: 'person',
      route: '/profile',
      permission: 'perfil',
      descriptionKey: 'Actualiza tu perfil'
    },
  ];

  // Els que es mostraràn a la vista
  optionsToShow: DashboardOption[] = [];

  constructor() {
    this.optionsToShow = this.allOptions.filter(option =>
      this.userPermissions.includes(option.permission)
    );
  }
}
