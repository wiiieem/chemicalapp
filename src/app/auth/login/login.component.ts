import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = 'admin@cnstn.com'; // Pré-rempli pour test
  password: string = 'admin123'; // Pré-rempli pour test
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;

    this.authService
      .login(this.email, this.password)
      .then((user) => {
        console.log('Connexion réussie:', user);
        this.isLoading = false;

        // Utiliser la méthode du service pour obtenir la route
        const dashboardRoute = this.authService.getDashboardRoute();
        this.router.navigate([dashboardRoute]);
      })
      .catch((error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Erreur de connexion';
        console.error('Erreur de connexion:', error);
      });
  }
}
