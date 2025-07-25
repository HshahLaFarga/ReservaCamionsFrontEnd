export interface Material {
  camiones_permitidos: string,
  codigo_sap: string,
  estado: number,
  material_id: number,
  max_concurrencia: string,
  muelles_permitidos: string,
  nombre_material: string,
}

export interface Trucks {
  bloqueo_muelles: number,
  descripcion: string,
  estado: number,
  materiales: string,
  materiales_permitidos:string,
  nombre: string,
  timpo_descarga_a: number,
  timpo_descarga_b: number,
  tipo_camion_id: number
}

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
}

export interface Status {
  status_id: number,
  nombre: string,
  descripcion: string,
  estado: number
}

export interface Provider {
  averbiatura: string,
  alerta: string,
  codigo_sap: string,
  email: string,
  estado: string,
  nombre: string,
  nombre_contacto: string,
  notificaciones_email: string,
  proveedor_id: number,
  tel1: string,
  tel2: string,
  tipo_proveedor_id: number,
}

export interface Carrier {
  abreviatura: string,
  alert: number,
  email: string,
  estado: number,
  nombre: string,
  nombre_contacto: string,
  proveedor_id: number,
  puede_gestionar: number,
  tel1: string,
  tel2: string,
  transporte_id: number
}
