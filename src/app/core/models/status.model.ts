export interface Status {
  status_id: number,
  nombre: string,
  descripcion: string,
  estado: number

  // Estado formatado de 1 Activo | 0 False
  estadoFormated: string,
}
