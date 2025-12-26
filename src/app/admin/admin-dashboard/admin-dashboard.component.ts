import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats = {
    totalProduits: 0,
    totalClients: 0,
    totalFournisseurs: 0,
    demandesEnCours: 0,
    produitsStockFaible: 0,
    clientsActifs: 0,
    fournisseursAgrees: 0,
    commandesCompleted: 0,
  };

  recentActivity: any[] = [];
  alerts: any[] = [];
  lastUpdate: Date = new Date();

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentActivity();
    this.loadAlerts();
    // Écoute des mises à jour de commandes depuis d'autres composants
    window.addEventListener(
      'requestsUpdated',
      this.onRequestsUpdatedBound as EventListener
    );
  }

  // Bound handler pour pouvoir le retirer ensuite
  private onRequestsUpdatedBound = (() => this.onRequestsUpdated()).bind(this);

  ngOnDestroy(): void {
    try {
      window.removeEventListener(
        'requestsUpdated',
        this.onRequestsUpdatedBound as EventListener
      );
    } catch (e) {
      // ignore
    }
  }

  loadDashboardData(): void {
    // Charger les statistiques depuis l'API dashboard
    this.http.get('http://localhost:8080/api/dashboard/stats').subscribe({
      next: (data: any) => {
        console.log('Stats dashboard:', data);
        this.stats = {
          totalProduits: data.totalProduits || 0,
          totalClients: data.totalClients || 0,
          totalFournisseurs: data.totalFournisseurs || 0,
          demandesEnCours: data.commandesPending || 0,
          produitsStockFaible: data.produitsStockFaible || 0,
          clientsActifs: data.totalClients || 0,
          fournisseursAgrees: data.totalFournisseurs || 0,
          commandesCompleted: data.commandesCompleted || 0,
        };
        this.lastUpdate = new Date();
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
        this.loadStatsManually();
      },
    });
  }

  loadStatsManually(): void {
    // Si l'API dashboard ne marche pas, charger séparément
    this.http.get('http://localhost:8080/api/produits/count').subscribe({
      next: (count: any) => (this.stats.totalProduits = count),
    });

    this.http.get('http://localhost:8080/api/clients/count').subscribe({
      next: (count: any) => (this.stats.totalClients = count),
    });

    this.http.get('http://localhost:8080/api/fournisseurs/count').subscribe({
      next: (count: any) => (this.stats.totalFournisseurs = count),
    });

    this.http
      .get('http://localhost:8080/api/commandes/statut/PENDING')
      .subscribe({
        next: (commandes: any) =>
          (this.stats.demandesEnCours = commandes.length),
      });

    this.http.get('http://localhost:8080/api/produits/stock-faible').subscribe({
      next: (produits: any) =>
        (this.stats.produitsStockFaible = produits.length),
    });

    this.http
      .get('http://localhost:8080/api/commandes/statut/COMPLETED')
      .subscribe({
        next: (commandes: any) =>
          (this.stats.commandesCompleted = commandes.length),
      });
  }

  loadRecentActivity(): void {
    // Charger les commandes récentes - API alternative si /recent ne marche pas
    this.http.get('http://localhost:8080/api/commandes').subscribe({
      next: (commandes: any) => {
        console.log('Toutes les commandes:', commandes);

        // Trier par date la plus récente et prendre les 5 premières
        const commandesTriees = commandes
          .sort((a: any, b: any) => {
            const dateA = new Date(a.dateTransaction || a.createdAt);
            const dateB = new Date(b.dateTransaction || b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        this.recentActivity = commandesTriees.map((cmd: any) => ({
          id: cmd.id,
          type: 'Demande',
          description: this.getActivityDescription(cmd),
          productName:
            cmd.produit?.nom || cmd.produit?.name || 'Produit inconnu',
          quantity: cmd.quantite || cmd.quantity || 0,
          date: cmd.dateTransaction || cmd.createdAt || new Date(),
          status: cmd.statut || cmd.status || 'PENDING',
        }));
      },
      error: (error) => {
        console.error('Erreur chargement activité:', error);
        // Données de démonstration
        this.recentActivity = this.getDemoActivities();
      },
    });
  }

  private getActivityDescription(cmd: any): string {
    const produit = cmd.produit?.nom || cmd.produit?.name || 'produit';
    const client = cmd.client?.nom || cmd.client?.name || 'client';
    const quantite = cmd.quantite || cmd.quantity || 0;
    return `Demande de ${produit} (${quantite} unités) par ${client}`;
  }

  private getDemoActivities(): any[] {
    return [
      {
        id: 1,
        type: 'Demande',
        description: "Demande d'Ethanol pur (25 unités) par Laboratoire A",
        productName: 'Ethanol pur',
        quantity: 25,
        date: new Date(),
        status: 'PENDING',
      },
      {
        id: 2,
        type: 'Demande',
        description: "Demande d'Acide chlorhydrique (10 unités) par Dr. Ahmed",
        productName: 'Acide chlorhydrique',
        quantity: 10,
        date: new Date(Date.now() - 86400000),
        status: 'COMPLETED',
      },
    ];
  }

  loadAlerts(): void {
    // Charger les alertes depuis l'API
    this.http.get('http://localhost:8080/api/dashboard/alerts').subscribe({
      next: (data: any) => {
        if (data.produitsStockFaible && data.produitsStockFaible.length > 0) {
          this.alerts = data.produitsStockFaible.map((produit: any) => ({
            icon: '⚠️',
            title: 'Stock faible',
            message: `${produit.nom}: ${produit.quantite} unités (critique: ${produit.stockCritique})`,
            type: 'warning',
          }));
        }
      },
      error: (error) => {
        console.error('Erreur chargement alertes:', error);
        // Alertes par défaut pour la démo
        this.alerts = [
          {
            icon: '⚠️',
            title: 'Stock faible détecté',
            message: 'Vérifiez les produits avec stock critique',
            type: 'warning',
          },
          {
            icon: '📄',
            title: 'Rapport mensuel',
            message: 'Le rapport de sécurité doit être généré',
            type: 'info',
          },
        ];
      },
    });
  }

  private onRequestsUpdated(): void {
    // Recharger les stats et l'activité récente lorsque des commandes changent de statut
    this.loadDashboardData();
    this.loadRecentActivity();
  }

  handleAlertAction(alert: any): void {
    console.log('Traitement alerte:', alert);
    if (alert.title.includes('Stock faible')) {
      this.router.navigate(['/admin/products']);
    }
    this.alerts = this.alerts.filter((a) => a !== alert);
  }

  generateReport(): void {
    alert('Génération du rapport en cours...');
    console.log('Génération rapport');
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    const statusLower = status.toLowerCase();
    return statusLower === 'completed' || statusLower === 'complété'
      ? 'status-completed'
      : 'status-pending';
  }

  getStatusText(status: string): string {
    if (!status) return 'Inconnu';
    const statusLower = status.toLowerCase();
    return statusLower === 'completed' || statusLower === 'complété'
      ? 'Complété'
      : 'En attente';
  }
}
