
import { MaterialLockDetail } from "./material-lock-detail.module"
import { Provider } from "./provider.module"

export interface MaterialLock {
  bloqueo_material_id: number,
  tipo_proveedor: number,
  cantidad_total: number,
  cantidad_disponible: number,
  fecha_desde: string,
  fecha_hasta: string,
  usuario_id: number,
  activo: boolean,
  detalles: MaterialLockDetail[],
  proveedor: Provider
}
