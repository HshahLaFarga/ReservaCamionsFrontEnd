import { EmailValidator } from "@angular/forms";

export interface Entidad {
    entidad_id?: number,
    nombre: string,
    nif: string,
    abreviatura?: string,
    pin: string,
    nombre_contacto?: string,
    email: string,
    telefono1: string,
    telefono2?: string,
    alerta: boolean,
    idioma: `es` | `en` | `fr` | `ca`,
}
