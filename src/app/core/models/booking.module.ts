import { Muelle } from "./muelle.module"

export interface Booking {
  "reserva_id"?: number,
  "tipo_camion_id": number,
  "tipo_material1_id": number,
  "tipo_material2_id": number,
  "proveedor_id": number,
  "transporte_id": number,
  "muelle1_id": number,
  "muelle2_id"?: number,
  "status_id": number,
  "empresa_id": number,
  "cantidad1": string,
  "cantidad2": string,
  "pedido_LF": string,
  "matricula_camion": string,
  "inicio1": string,
  "fin1": string,
  "inicio2"?: string,
  "fin2"?: string,
  "es_aduana": boolean,
  "notas": string,
  "tel1"?: string,
  "duracion1": number,
  "duracion2"?: string,
  "documentos"?: BookingDocument[],
  "muelle1"?: Muelle
}

export interface BookingDocument {
  documento_reserva_id?: number,
  reserva_id?: number,
  url?: string,
  name: string
}
