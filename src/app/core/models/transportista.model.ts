import { Entidad } from "./entidad.model"

export interface Carrier {
  transportista_id?: number
  puede_gestionar: boolean,
  entidad: Entidad
}
