import { Routes } from '@angular/router';
import { MainLayoutComponent } from './features/auth/layouts/main-layout.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { LoginComponent } from './features/auth/login/login.component';
// import { DemoModule } from './pages/calendar-page/calendar-page.module';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    data: {
        layout: 'empty'
    },
    children: [
      { path: 'dashboard', component: DashboardPageComponent },
      // { path: 'calendar', component: DemoModule},
      { path: 'profile', component: ProfilePageComponent },
      { path: 'bookings', loadChildren: () => import('./pages/booking-page/booking-page.routes')},
      { path: 'profile', component: ProfilePageComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    ]
  }
];
