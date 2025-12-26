import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';

// AJOUTE CES 2 IMPORTS :
import { LoginComponent } from './auth/login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

import { ProductsComponent } from './admin/products/products.component';
import { SuppliersComponent } from './admin/suppliers/suppliers.component';
import { ClientsComponent } from './admin/clients/clients.component';
import { RequestsComponent } from './admin/requests/requests.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,

    // AJOUTE CES 2 LIGNES :
    LoginComponent,
    AdminDashboardComponent,

    ProductsComponent,
    SuppliersComponent,
    ClientsComponent,
    RequestsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
