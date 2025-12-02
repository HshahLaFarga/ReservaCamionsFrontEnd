import { Rol } from "./rol.model";

export interface Profile {
  id?: string,
  name: string,
  username: string,
  apellidos: string,
  email: string,
  password?: string,
  NIF?: string,
  tel1?:string,
  rol_id?: number,

  // Relaciones
  roles?: Rol[],

  rolesFormated?: string;
}
