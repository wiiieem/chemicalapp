import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getWelcomeMessage(): string {
    if (!this.currentUser) return '';
    return `Bonjour, ${this.currentUser.prenom} ${this.currentUser.nom}`;
  }

  getUserRole(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur';
  }
}