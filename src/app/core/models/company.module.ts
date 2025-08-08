import { Booking } from "./booking.module";
import { Muelle } from "./muelle.module";

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
