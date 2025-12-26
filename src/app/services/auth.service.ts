import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Vérifier si un utilisateur est déjà connecté (localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Promise<User> {
    // Simulation d'une API de connexion
    return new Promise((resolve, reject) => {
      // Pour la démo, on simule une connexion
      if (email === 'admin@cnstn.com' && password === 'admin123') {
        const user: User = {
          id: 1,
          email: email,
          nom: 'Admin',
          prenom: 'CNSTN',
          role: 'admin',
        };
        console.log('User logged in:', user); // Log the user information
        this.setCurrentUser(user);
        resolve(user);
      } else if (email === 'user@cnstn.com' && password === 'user123') {
        const user: User = {
          id: 2,
          email: email,
          nom: 'Utilisateur',
          prenom: 'Test',
          role: 'user',
        };
        this.setCurrentUser(user);
        resolve(user);
      } else {
        reject(new Error('Email ou mot de passe incorrect'));
      }
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isUser(): boolean {
    return this.currentUserSubject.value?.role === 'user';
  }

  getDashboardRoute(): string {
    const user = this.getCurrentUser();
    if (!user) return '/login';

    return user.role === 'admin' ? '/admin/dashboard' : '/home';
  }
}
