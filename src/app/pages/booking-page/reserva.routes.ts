import { Routes } from '@angular/router';
import { ReservaComponent } from './reserva.component';
import { ReservaAddUpdateComponent } from './reserva-add-update/reserva-add-update.component';

export default [
  {
    path: '',
    component: ReservaComponent
  },
  {
    path: 'add',
    component: ReservaAddUpdateComponent
  },
  {
    path: 'edit',
    component: ReservaAddUpdateComponent
  },
] as Routes;
