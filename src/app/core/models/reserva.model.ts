import { Material } from "./material.model"
import { Muelle } from "./muelle.model"
import { TipoCamion } from "./tipo_camion.model"
import { Provider } from "./proveedor.model"
import { Carrier } from "./transportista.model"
import { Status } from "./estado.model"
import { Company } from "./company.model"

export interface Booking {
  reserva_id: number;

  empresa_lfycs?: Company;
  empresa_lfycs_id: number;

  tipo_camion_id: number;
  tipo_camion?: TipoCamion;

  material1_id: number;
  material1?: Material

  material2_id?: number | null;
  material2?: Material | null;

  proveedor_id: number;
  proveedor?: Provider

  transportista_id: number;
  transportista?: Carrier

  muelle_id: number;
  muelle?: Muelle

  estado_id: number;
  estado?: Status;

  cantidad1: number;
  cantidad2?: number;
  pedido1: string;
  pedido2?: string | null;
  matricula_camion: string;

  inicio: string;  // ISO datetime (ej: "2025-11-07T08:00:00Z")
  fin: string;
  duracion: number;

  telefono?: string | null;
  aduana: boolean;
  notas?: string | null;

  documentos?: BookingDocument[];

  created_at?: string;
  updated_at?: string;
}


export interface BookingDocument {
  documento_reserva_id?: number,
  reserva_id?: number,
  url?: string,
  name: string
}
