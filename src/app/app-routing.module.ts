import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { ProductsComponent } from './admin/products/products.component';
import { SuppliersComponent } from './admin/suppliers/suppliers.component';
import { ClientsComponent } from './admin/clients/clients.component';
import { RequestsComponent } from './admin/requests/requests.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/products',
    component: ProductsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/suppliers',
    component: SuppliersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/clients',
    component: ClientsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/requests',
    component: RequestsComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
