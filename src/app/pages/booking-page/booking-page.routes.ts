import { Routes } from '@angular/router';
import { BookingPageComponent } from './booking-page.component';
import { BookingAddComponent } from './booking-add-update/booking-add-update.component';

export default [
  {
    path: '',
    component: BookingPageComponent
  },
  {
    path: 'add',
    component: BookingAddComponent
  },
  {
    path: 'edit',
    component: BookingAddComponent
  },
] as Routes;
