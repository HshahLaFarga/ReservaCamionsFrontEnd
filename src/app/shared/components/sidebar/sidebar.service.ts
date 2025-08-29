import { Injectable } from "@angular/core";
import { SidebarItem } from "../../../core/models/sidebar.model";

@Injectable({ providedIn: 'root' })
export class SidebarService {
  // Futura implementació, d'alguna manera recuperar la info de l'usuari ja sigui després del LOGIN o bé consultant a la BDD i a través del getter gestionar qui ho pot veure i qui no (Estil FargaNet)
  private items: SidebarItem[] = [
    { label: 'DASHBOARD', route: '/dashboard' },
    { label: 'BOOKING_PAGE.TITLE', route: '/bookings' },
    { label: 'CALENDARIO', route: '/calendar' },
    { label: 'Proveedores', route: '/provider' },
    { label: 'Transportista', route: '/carrier' },
    { label: 'Materiales', route: '/materials' },
    { label: 'Muelles', children: [{ label: 'Muelles', route: '/muelles' }, { label: 'Horario Muelles', route: '/muelles/timing'}]},
    { label: 'Restricciones', route: '/restrictions' },
    { label: 'Empresas', route: '/companys' },
    { label: 'Usuarios', route: '/users' },
    { label: 'Rango KG', route: '/weight/range' },
    { label: 'Status', route: '/status' },
    { label: 'Bloqueos', children: [{ label: 'Bloqueo Materiales', route: '/materials/lock' },{ label: 'Bloqueo Muelles', route: '/lock/muelles' }] },
    { label: 'Tipos', children: [
      { label: 'Tipo Camion', route: '/trucks/type' },
      { label: 'Tipo Proveedor', route: '/provider/type' },
    ]},
  ];

  getSidebarItems(): SidebarItem[] {
    return this.items;
  }
}
