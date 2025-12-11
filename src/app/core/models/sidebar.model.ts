// sidebar-item.model.ts
export interface SidebarItem {
  label: string;
  route?: string;
  icon?: string;
  children?: SidebarItem[];
  admin?: boolean; // Indica si el ítem es solo para administradores
  instancia?: string[]; // Indica los roles que pueden ver el ítem
}
