import { Time } from "@angular/common";

export interface HorarioMuelle {
  horarios_muelle_id: number,
  muelle_id: number,
  dia_semana: number,
  inicio: Time,
  fin: Time
}
