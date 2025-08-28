import { Time } from "@angular/common";

export interface TimingMuelle {
  horarios_muelle_id: number,
  muelle_id: number,
  dia: string,
  num_dia: string,
  inicio: Time,
  fin: Time
}
