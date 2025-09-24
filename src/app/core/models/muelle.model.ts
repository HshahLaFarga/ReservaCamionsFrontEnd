import { Carrier } from "./carrier.model";
import { TimingMuelle } from "./timingMuelle.model";

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
  horarios: TimingMuelle[],

  // Formato visual
  abierto_festivosFormated: string,
  estadoFormated: string
}
