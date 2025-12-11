import { Profile } from "./usuario.model";
import { Carrier } from "./transportista.model";
import { Provider } from "./proveedor.model";

// 1. Definimos las combinaciones posibles
// Fíjate que 'instance' no es string, es el valor literal exacto.

export interface LoggedProfile {
    instance: 'usuario'; // O el string exacto que devuelva tu backend
    user: Profile;
    logged: boolean;
}

export interface LoggedEntidad {
    instance: 'entidad'; // O 'transportista'
    user: Carrier | Provider;
    logged: boolean;
}

// 2. Unimos todo en un solo tipo
export type LoggedUser = LoggedProfile | LoggedEntidad;