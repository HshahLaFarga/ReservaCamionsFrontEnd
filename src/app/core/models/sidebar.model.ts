// sidebar-item.model.ts
export interface SidebarItem {
  label: string;
  route?: string;
  icon?: string;
  children?: SidebarItem[];
}
