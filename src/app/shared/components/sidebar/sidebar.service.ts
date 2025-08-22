import { Injectable } from "@angular/core";
import { SidebarItem } from "../../../core/models/sidebar.module";

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private items: SidebarItem[] = [
    { label: 'DASHBOARD', route: '/dashboard' },
    { label: 'BOOKING_PAGE.TITLE', route: '/bookings' },
    { label: 'CALENDARIO', route: '/calendar' },
    { label: 'Proveedores', route: '/provider' },
    { label: 'Transportista', route: '/carrier' },
    { label: 'Materiales', route: '/materials' },
    { label: 'Muelles', route: '/muelles' },
    { label: 'Empresas', route: '/companys' },
    { label: 'Usuarios', route: '/users' },
    { label: 'Rango KG', route: '/weight/range' },
    { label: 'Status', route: '/status' },
    { label: 'Bloqueos', children: [{ label: 'Bloqueo Materiales', route: '/materials/lock' },{ label: 'Bloqueo Muelles', route: '/lock/muelles' }] },
    { label: 'Tipos', children: [{ label: 'Tipo Camion', route: '/trucks/type' }]},
  ];

  getSidebarItems(): SidebarItem[] {
    return this.items;
  }
}
