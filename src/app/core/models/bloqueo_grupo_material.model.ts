
import { MaterialLockDetail } from "./bloqueo_grupo_material_detalle.model"
import { TipoProveedor } from "./proveedor.model"

export interface MaterialLock {
  bloqueo_grupo_id?: number,
  tipoproveedor: TipoProveedor
  cantidad_total: number,
  cantidad_disponible: number,
  inicio: string,
  fin: string,
  detalles: MaterialLockDetail[],
}


