import { Routes } from '@angular/router';
import { Catalog } from './pages/catalog';
import { Login } from './pages/login';
import { MyRentals } from './pages/my-rentals';
import { Admin } from './pages/admin';
import { MediaManagement } from './pages/media-management';
import { CustomerManagement } from './pages/customer-management';
import { RentalManagement } from './pages/rental-management';
import { Summary } from './pages/summary';
import { adminGuard, customerGuard } from './core/security';
export const routes: Routes = [
  { path: '', component: Catalog },
  { path: 'login', component: Login },
  { path: 'register', component: Login },
  { path: 'my-rentals', component: MyRentals, canActivate: [customerGuard] },
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard],
    children: [
      { path: '', component: Summary },
      { path: 'media', component: MediaManagement },
      { path: 'customers', component: CustomerManagement },
      { path: 'rentals', component: RentalManagement },
    ],
  },
  { path: '**', redirectTo: '' },
];
