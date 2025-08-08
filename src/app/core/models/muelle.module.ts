import { Carrier } from "./carrier.module";

export interface Muelle {
  abierto_festivos: number,
  cantidat_acceptada: number,
  color: string,
  descripcion: string,
  empresa_id: number,
  estado: number,
  muelle_id: number,
  nombre_muelle: string,
  numero: number,
  zona: string,

  // Relacion
  empresa: Carrier,

  // Formato visual
  abierto_festivosFormated: string,
  estadoFormated: string
}
