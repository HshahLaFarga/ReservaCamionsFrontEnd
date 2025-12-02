import { Routes } from '@angular/router';
import { MainLayoutComponent } from './features/auth/layouts/main-layout.component';
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
import { TruckTypePageComponent } from './pages/truckType-page/truckType-page.component';
import { TruckTypeAddUpdateComponent } from './pages/truckType-page/truckType-add-update/truckType-add-update.component';
import { WeightRangePageComponent } from './pages/weightRange-page/weightRange-page.component';
import { StatusPageComponent } from './pages/status-page/status-page.component';
import { StatusAddUpdateComponent } from './pages/status-page/status-add-update/status-add-update.component';
import { LockMuellePageComponent } from './pages/muelleLock-page/lockMuelle-page.component';
import { LockMuelleAddUpdateComponent } from './pages/muelleLock-page/muelleLock-add-update/lockMuelle-add-update.component';
import { TimingMuellePageComponent } from './pages/timingMuelle-page/timingMuelle-page.component';
import { TimingMuelleAddUpdateComponent } from './pages/timingMuelle-page/timingMuelle-add-update/timingMuelle-add-update.component';
import { ProviderTypeComponent } from './pages/provider-type/provider-type.component';
import { ProviderTypeAddUpdateComponent } from './pages/provider-type/provider-type-add-update/provider-type-add-update.component';
import { RestrictionPageComponent } from './pages/restriction-page/restriction-page.component';
import { ReportComponent } from './pages/report/report.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],

    children: [

      { path: 'calendar', component: CalendarPageComponent},

      { path: 'profile', component: ProfilePageComponent },

      { path: 'report', component: ReportComponent },

      { path: 'provider', component: ProviderPageComponent },
      { path: 'provider/add', component: ProviderAddUpdateComponent },
      { path: 'provider/edit', component: ProviderAddUpdateComponent },
      { path: 'provider/type', component: ProviderTypeComponent },
      { path: 'provider/type/add', component: ProviderTypeAddUpdateComponent },
      { path: 'provider/type/edit', component: ProviderTypeAddUpdateComponent },

      { path: 'transportista', component: CarrierPageComponent },
      { path: 'transportista/add', component: CarrierAddUpdateComponent },
      { path: 'transportista/edit', component: CarrierAddUpdateComponent },

      { path: 'materials', component: MaterialPageComponent },
      { path: 'materials/add', component: MaterialAddUpdateComponent },
      { path: 'materials/edit', component: MaterialAddUpdateComponent },
      { path: 'materials/lock', component: MaterialLockPageComponent },
      { path: 'materials/lock/add', component: MaterialLockAddComponent },

      { path: 'muelles', component: MuellePageComponent},
      { path: 'muelles/add', component: MuelleAddUpdateComponent},
      { path: 'muelles/edit', component: MuelleAddUpdateComponent},

      { path: 'muelles/timing', component: TimingMuellePageComponent},
      { path: 'muelles/timing/add', component: TimingMuelleAddUpdateComponent},
      { path: 'muelles/timing/edit', component: TimingMuelleAddUpdateComponent},

      { path: 'companys', component: CompanyPageComponent},
      { path: 'companys/add', component: CompanyAddUpdateComponent},
      { path: 'companys/edit', component: CompanyAddUpdateComponent},

      { path: 'users', component: UserPageComponent},
      { path: 'users/add', component: UserAddUdpateComponent},
      { path: 'users/edit', component: UserAddUdpateComponent},
      { path: 'users/type', component: UserAddUdpateComponent},
      { path: 'users/role', component: UserAddUdpateComponent},

      { path: 'trucks/type', component: TruckTypePageComponent},
      { path: 'trucks/type/add', component: TruckTypeAddUpdateComponent},
      { path: 'trucks/type/edit', component: TruckTypeAddUpdateComponent},

      { path: 'estados', component: StatusPageComponent},
      { path: 'estado/add', component: StatusAddUpdateComponent},
      { path: 'estado/edit', component: StatusAddUpdateComponent},

      { path: 'weight/range', component: WeightRangePageComponent},

      { path: 'lock/muelles', component: LockMuellePageComponent},
      { path: 'lock/muelles/add', component: LockMuelleAddUpdateComponent},
      { path: 'lock/muelles/edit', component: LockMuelleAddUpdateComponent},

      { path: 'restrictions', component: RestrictionPageComponent},

      { path: 'bookings', loadChildren: () => import('./pages/booking-page/reserva.routes')},

      { path: '', redirectTo: 'calendar', pathMatch: 'full'},
    ]
  }
];
