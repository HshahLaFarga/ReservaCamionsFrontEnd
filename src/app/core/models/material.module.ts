import { Muelle } from "./muelle.module";
import { Truck } from "./truck.module";

export interface Material {
  camiones_permitidos: string,
  codigo_sap: string,
  estado: number,
  material_id: number,
  max_concurrencia: string,
  muelles_permitidos: string,
  nombre_material: string,
  control_material_muelle: MaterialMuelleControl[]

  //Fiquem això, per poder aprofitar el GeneralListComponent i tenir l'estat formatat de 1 a Activo
  estadoFormated?: string,
  conjuntoCamiones?: any;
  conjuntoMuelles?: any;
}

export interface MaterialMuelleControl {
  control_material_muelle_id: number,
  material_id: number,
  tipo_camion_id: number,
  muelle_id: number,
  tipo_camion?: Truck
  muelle?: Muelle,
}
