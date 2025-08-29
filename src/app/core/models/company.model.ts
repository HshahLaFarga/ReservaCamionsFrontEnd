import { Booking } from "./booking.model";
import { Muelle } from "./muelle.model";

export interface Company {
  empresa_id?: number,
  nombre: string,
  descripcion: string,
  estado: number,

  // Relaciones
  muelles?: Muelle,
  reservas?: Booking

  // Texto Formateado
  estadoFormated: string
}
