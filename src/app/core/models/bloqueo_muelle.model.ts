import { Time } from "@angular/common";
import { Muelle } from "./muelle.model";

export interface BloqueoMuelle {
    bloqueo_muelle_id?: number;
    muelle_id?: number | null;
    asunto: string;
    inicio: string;
    fin: string;
    muelle?: Muelle;
    created_at?: Date;
    updated_at?: Date;
}
