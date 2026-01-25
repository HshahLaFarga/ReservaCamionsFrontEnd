import { Booking } from "./reserva.model";
import { Muelle } from "./muelle.model";

export interface Company {
  empresa_lfycs_id?: number,
  nombre: string,
  descripcion?: string,

  // Relaciones
  muelles?: Muelle[],
  reservas?: Booking[]

  // Texto Formateado
  estadoFormated?: string
  conjuntoMuelles?: String
}
