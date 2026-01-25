import { Rol } from "./rol.model";

export interface Profile {
  id?: string,
  nombre: string,
  apellidos?: string,
  username: string,
  contraseña: string,
  email: string,
  password?: string,
  NIF?: string,
  tel1?:number,
  rol_id?: number,
  idioma?: 'es' | 'en' | 'fr' | 'cat',

  // Relaciones
  roles?: Rol[],

  rolesFormated?: string;
}
