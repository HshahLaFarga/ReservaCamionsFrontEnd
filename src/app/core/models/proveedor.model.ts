import { Entidad } from "./entidad.model";

export interface Provider {
  proveedor_id?: number,
  tipo_proveedor?: TipoProveedor, //Se usa para cuando se obtienen los datos de la API
  tipo_proveedor_id: number, //Esto para hacer el PUT/POST
  entidad: Entidad;
  email_notificaciones: string,
  codigo_sap: string,
}

export interface TipoProveedor {
  tipo_proveedor_id: number,
  nombre: string,
}
