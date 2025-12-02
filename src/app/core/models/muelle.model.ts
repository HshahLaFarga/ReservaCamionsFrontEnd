import { Carrier } from "./transportista.model";
import { HorarioMuelle } from "./horario_muelle";

export interface Muelle {
  muelle_id: number,
  color: string,
  descripcion: string,
  nombre: string,

  // Relacion
  empresa: Carrier,
  empresa_id: number,

  horarios: HorarioMuelle[],

  // Formato visual
  abierto_festivosFormated?: string,
  estadoFormated?: string
}
