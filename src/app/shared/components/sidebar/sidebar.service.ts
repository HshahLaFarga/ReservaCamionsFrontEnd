import { Injectable } from "@angular/core";
import { SidebarItem } from "../../../core/models/sidebar.model";
import { LoggedUser } from "../../../core/models/logged_user.model";

@Injectable({ providedIn: 'root' })
export class SidebarService {
  // Futura implementació, d'alguna manera recuperar la info de l'usuari ja sigui després del LOGIN o bé consultant a la BDD i a través del getter gestionar qui ho pot veure i qui no (Estil FargaNet)
  private items: SidebarItem[] = [
    {
      label: 'BOOKING_PAGE.TITLE',
      route: '/bookings',
      icon: 'event_available',
    },
    { label: 'CALENDARIO', route: '/calendar', icon: 'calendar_month', },
    { label: 'Proveedores', route: '/provider', icon: 'business' },
    { label: 'Transportistas', route: '/transportista', icon: 'local_shipping' },
    { label: 'Informes', route: '/report', icon: 'bar_chart' },
    { label: 'Materiales', route: '/materials', icon: 'inventory' },
    {
      label: 'Muelles',
      children: [
        { label: 'Muelles', route: '/muelles', icon: 'integration_instructions' },
        { label: 'Horario Muelles', route: '/muelles/timing', icon: 'schedule' },
      ],
      icon: 'warehouse'
    },
    { label: 'Restricciones', route: '/restrictions', icon: 'block' },

    //------------------------------------------
    //ADMIN
    //------------------------------------------

    { label: 'Empresas', route: '/companys', icon: 'apartment', admin: true },
    { label: 'Usuarios', route: '/users', icon: 'people', admin: true },
    { label: 'Rango KG', route: '/weight/range', icon: 'fitness_center', admin: true },
    { label: 'Estados', route: '/estados', icon: 'info', admin: true },
    {
      label: 'Bloqueos',
      admin: true,
      children: [
        { label: 'Bloqueo Materiales', route: '/materials/lock', icon: 'lock' },
        { label: 'Bloqueo Muelles', route: '/lock/muelles', icon: 'lock' },
      ],
      icon: 'lock',
    },
    {
      label: 'Tipos',
      admin: true,
      children: [
        { label: 'Tipo Camion', route: '/trucks/type', icon: 'local_shipping' },
        { label: 'Tipo Proveedor', route: '/provider/type', icon: 'add_business' },
      ],
      icon: 'category',
    },
  ];

  private EntidadItems: SidebarItem[] = [
    {
      label: 'BOOKING_PAGE.TITLE',
      route: '/bookings',
      icon: 'event_available',
    },
    { label: 'CALENDARIO', route: '/calendar', icon: 'calendar_month', },
  ];


  // 🔹 Método principal
  getSidebarItems(user: LoggedUser | null): SidebarItem[] {
    if (!user) return []; // no hay usuario logueado

    // Si es entidad, retornamos sus ítems específicos
    if (user.instance === 'entidad') {
      return this.EntidadItems;
    }

    // Si es usuario
    if (user.instance === 'usuario') {
      const userProfile = user.user;

      const roleId = userProfile.rol_id;
      // Roles: 2 = View, 3 = Edit
      const isViewRole = roleId === 2;
      const isEditRole = roleId === 1;

      if (isViewRole || isEditRole) {
        // Base allowed items (for View role)
        const allowedRoutes = ['/bookings', '/calendar', '/provider'];
        const allowedLabels = ['Bloqueos'];

        // Additional items for Edit role
        if (isEditRole) {
          allowedRoutes.push('/transportista', '/report');
        }

        return this.items.filter(item => {
          if (item.route && allowedRoutes.includes(item.route)) {
            return true;
          }
          if (allowedLabels.includes(item.label)) {
            return true;
          }
          return false;
        });
      }
    }

    // Retorno por defecto para otros roles de usuario
    return this.items;
  }
}