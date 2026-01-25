import { Material } from "./material.model"

export interface MaterialLockDetail {
    bloqueo_grupo_detalle_id?: number,
    bloqueo_grupo_id: number,
    material_id: number,
    material: Material
}
