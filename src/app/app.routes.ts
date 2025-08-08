import { Routes } from '@angular/router';
import { MainLayoutComponent } from './features/auth/layouts/main-layout.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { LoginComponent } from './features/auth/login/login.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { ProviderPageComponent } from './pages/provider-page/provider-page.component';
import { MaterialLockPageComponent } from './pages/materialLock-page/material-lock-page.component';
import { MaterialLockAddComponent } from './pages/materialLock-page/materialLock-add/material-lock-add.component';
import { authGuard } from './core/guards/auth.guard';
import { ProviderAddUpdateComponent } from './pages/provider-page/provider-add-update/provider-add-update.component';
import { CarrierPageComponent } from './pages/carrier-page/carrier-page.component';
import { CarrierAddUpdateComponent } from './pages/carrier-page/carrier-add-update/carrier-add-update.component';
import { MaterialPageComponent } from './pages/material-page/material-page.component';
import { MaterialAddUpdateComponent } from './pages/material-page/material-add-update/material-add-update.component';
import { MuellePageComponent } from './pages/muelle-page/muelle-page.component';
import { MuelleAddUpdateComponent } from './pages/muelle-page/muelle-add-update/muelle-add-update.component';
import { CompanyPageComponent } from './pages/company-page/company-page.component';
import { CompanyAddUpdateComponent } from './pages/company-page/company-add-update/company-add-update.component';
import { UserPageComponent } from './pages/user-page/user-page.component';
import { UserAddUdpateComponent } from './pages/user-page/user-add-udpate/user-add-udpate.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],

    children: [
      { path: 'dashboard', component: DashboardPageComponent },

      { path: 'calendar', component: CalendarPageComponent},

      { path: 'profile', component: ProfilePageComponent },

      { path: 'provider', component: ProviderPageComponent },
      { path: 'provider/add', component: ProviderAddUpdateComponent },
      { path: 'provider/edit', component: ProviderAddUpdateComponent },

      { path: 'carrier', component: CarrierPageComponent },
      { path: 'carrier/add', component: CarrierAddUpdateComponent },
      { path: 'carrier/edit', component: CarrierAddUpdateComponent },

      { path: 'materials', component: MaterialPageComponent },
      { path: 'materials/add', component: MaterialAddUpdateComponent },
      { path: 'materials/edit', component: MaterialAddUpdateComponent },
      { path: 'materials/lock', component: MaterialLockPageComponent },
      { path: 'materials/lock/add', component: MaterialLockAddComponent },

      { path: 'muelles', component: MuellePageComponent},
      { path: 'muelles/add', component: MuelleAddUpdateComponent},
      { path: 'muelles/edit', component: MuelleAddUpdateComponent},

      { path: 'companys', component: CompanyPageComponent},
      { path: 'companys/add', component: CompanyAddUpdateComponent},
      { path: 'companys/edit', component: CompanyAddUpdateComponent},

      { path: 'users', component: UserPageComponent},
      { path: 'users/add', component: UserAddUdpateComponent},
      { path: 'users/edit', component: UserAddUdpateComponent},

      { path: 'bookings', loadChildren: () => import('./pages/booking-page/booking-page.routes')},

      { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    ]
  }
];
