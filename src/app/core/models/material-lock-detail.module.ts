import { Material } from "./material.module"

export interface MaterialLockDetail {
    bloqueo_grupo_detalle_id: number,
    bloqueo_grupo_id: number,
    material_id: number,
    activo: boolean
    material: Material
}
