import { Routes } from '@angular/router';
import { MainLayoutComponent } from './features/auth/layouts/main-layout.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { LoginComponent } from './features/auth/login/login.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { ProviderPageComponent } from './pages/provider-page/provider-page.component';
import { MaterialLockPageComponent } from './pages/materialLock-page/material-lock-page.component';
import { MaterialLockAddComponent } from './pages/materialLock-page/materialLock-add/material-lock-add.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
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

      // ✅ Rutas accesibles por todos los usuarios autenticados (internos + externos)
      { path: 'calendar', component: CalendarPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'bookings', loadChildren: () => import('./pages/booking-page/reserva.routes') },
      { path: '', redirectTo: 'calendar', pathMatch: 'full' },

      // 🔒 Rutas solo para usuarios internos (adminGuard bloquea a entidades externas)
      { path: 'report', component: ReportComponent, canActivate: [adminGuard] },

      { path: 'provider', component: ProviderPageComponent, canActivate: [adminGuard] },
      { path: 'provider/add', component: ProviderAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'provider/edit', component: ProviderAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'provider/type', component: ProviderTypeComponent, canActivate: [adminGuard] },
      { path: 'provider/type/add', component: ProviderTypeAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'provider/type/edit', component: ProviderTypeAddUpdateComponent, canActivate: [adminGuard] },

      { path: 'transportista', component: CarrierPageComponent, canActivate: [adminGuard] },
      { path: 'transportista/add', component: CarrierAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'transportista/edit', component: CarrierAddUpdateComponent, canActivate: [adminGuard] },

      { path: 'materials', component: MaterialPageComponent, canActivate: [adminGuard] },
      { path: 'materials/add', component: MaterialAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'materials/edit', component: MaterialAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'materials/lock', component: MaterialLockPageComponent, canActivate: [adminGuard] },
      { path: 'materials/lock/add', component: MaterialLockAddComponent, canActivate: [adminGuard] },

      { path: 'muelles', component: MuellePageComponent, canActivate: [adminGuard] },
      { path: 'muelles/add', component: MuelleAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'muelles/edit', component: MuelleAddUpdateComponent, canActivate: [adminGuard] },

      { path: 'muelles/timing', component: TimingMuellePageComponent, canActivate: [adminGuard] },
      { path: 'muelles/timing/add', component: TimingMuelleAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'muelles/timing/edit', component: TimingMuelleAddUpdateComponent, canActivate: [adminGuard] },

      { path: 'companys', component: CompanyPageComponent, canActivate: [adminGuard] },
      { path: 'companys/add', component: CompanyAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'companys/edit', component: CompanyAddUpdateComponent, canActivate: [adminGuard] },

      { path: 'users', component: UserPageComponent, canActivate: [adminGuard] },
      { path: 'users/add', component: UserAddUdpateComponent, canActivate: [adminGuard] },
      { path: 'users/edit', component: UserAddUdpateComponent, canActivate: [adminGuard] },
      { path: 'users/type', component: UserAddUdpateComponent, canActivate: [adminGuard] },
      { path: 'users/role', component: UserAddUdpateComponent, canActivate: [adminGuard] },

      { path: 'trucks/type', component: TruckTypePageComponent, canActivate: [adminGuard] },
      { path: 'trucks/type/add', component: TruckTypeAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'trucks/type/edit', component: TruckTypeAddUpdateComponent, canActivate: [adminGuard] },

      { path: 'estados', component: StatusPageComponent, canActivate: [adminGuard] },
      { path: 'estado/add', component: StatusAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'estado/edit', component: StatusAddUpdateComponent, canActivate: [adminGuard] },

      { path: 'weight/range', component: WeightRangePageComponent, canActivate: [adminGuard] },

      { path: 'lock/muelles', component: LockMuellePageComponent, canActivate: [adminGuard] },
      { path: 'lock/muelles/add', component: LockMuelleAddUpdateComponent, canActivate: [adminGuard] },
      { path: 'lock/muelles/edit', component: LockMuelleAddUpdateComponent, canActivate: [adminGuard] },

      { path: 'restrictions', component: RestrictionPageComponent, canActivate: [adminGuard] },
    ]
  },
  { path: '**', redirectTo: '' }
];

