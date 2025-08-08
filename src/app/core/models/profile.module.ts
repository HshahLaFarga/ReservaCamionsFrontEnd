import { Rol } from "./rol.module";

export interface Profile {
  id?: string,
  name: string,
  username: string,
  apellidos: string,
  email: string,
  password?: string,
  PIN?: string,
  NIF?: string,
  tel1:string,
  rol_id?: Rol,
  estado?: number,

  // Relaciones
  rol?: Rol,

  // Fomated Activo
  estadoFormated?: string,
}
