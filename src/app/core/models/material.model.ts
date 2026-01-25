import { Muelle } from "./muelle.model";
import { TipoCamion } from "./tipo_camion.model";

export interface Material {
  material_id: number,
  codigo_sap: string,
  nombre: string,

  // Relacion
  tipo_camiones?: TipoCamion[],
  muelles?: Muelle[],

  //Solo se utiliza para user el componente genérico del listado y esto tendrá 
  // un valor con todos los nombres de los elementos seprados por una ','
  conjuntoCamiones?: any; 
  conjuntoMuelles?: any;  
}

