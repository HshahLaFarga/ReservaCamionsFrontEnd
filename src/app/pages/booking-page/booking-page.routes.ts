import { Routes } from '@angular/router';
import { BookingPageComponent } from './booking-page.component';
import { BookingAddComponent } from './booking-add/booking-add.component';

export default [
  {
    path: '',
    component: BookingPageComponent
  },
    {
    path: 'add',
    component: BookingAddComponent
  },
] as Routes;
