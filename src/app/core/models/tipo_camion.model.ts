export interface TipoCamion {
  tipo_camion_id: number,
  nombre: string,
  descripcion: string,
  tiempo_descarga_1: number,
  bloqueo_muelles: boolean,

  bloqueo_muellesFormated?: string
}
