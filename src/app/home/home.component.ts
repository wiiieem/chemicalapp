import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  particles: { style: { left: string; animationDuration: string; width: string; height: string } }[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Générer 8 particules avec des styles aléatoires
    this.particles = Array(8).fill(0).map(() => ({
      style: {
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 6 + 4}s`,
        width: `${Math.random() * 6 + 3}px`,
        height: `${Math.random() * 6 + 3}px`
      }
    }));
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}