import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // AJOUTEZ CET IMPORT

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
})
export class ClientsComponent implements OnInit {
  clientForm: FormGroup;
  clients: any[] = [];
  isEditMode = false;
  selectedClient: any = null;
  showOrderHistory = false;
  selectedClientOrders: any[] = [];
  allRequests: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient // AJOUTEZ DANS LE CONSTRUCTEUR
  ) {
    this.clientForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      category: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadClients(); // APPELER L'API
  }

  loadClients(): void {
    // CHARGER LES CLIENTS DEPUIS L'API
    this.http.get('http://localhost:8080/api/clients').subscribe({
      next: (data: any) => {
        console.log('Clients chargés depuis API:', data);
        // Convertir français → anglais pour l'interface
        this.clients = data.map((c: any) => ({
          id: c.id,
          name: c.nom, // "nom" → "name"
          email: c.email,
          phone: c.telephone, // "telephone" → "phone"
          address: c.adresse, // "adresse" → "address"
          category: c.category,
        }));
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
        // Pour la démo, gardez les données locales si l'API échoue
      },
    });
  }

  viewOrderHistory(client: any): void {
    this.selectedClient = client;
    // Charger les commandes du client depuis l'API
    this.http
      .get(`http://localhost:8080/api/commandes/client/${client.id}`)
      .subscribe({
        next: (orders: any) => {
          this.selectedClientOrders = orders;
          this.showOrderHistory = true;
        },
        error: (error) => console.error('Erreur chargement commandes:', error),
      });
  }

  closeOrderHistory(): void {
    this.showOrderHistory = false;
    this.selectedClient = null;
    this.selectedClientOrders = [];
  }

  viewScannedPhoto(url: string): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Aucune photo scannée disponible');
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      const formData = this.clientForm.value;

      // Convertir anglais → français pour l'API
      const clientPourAPI = {
        nom: formData.name,
        email: formData.email,
        telephone: formData.phone,
        adresse: formData.address,
        category: formData.category,
      };

      if (this.isEditMode && formData.id) {
        // MODIFICATION via API
        this.http
          .put(
            `http://localhost:8080/api/clients/${formData.id}`,
            clientPourAPI
          )
          .subscribe({
            next: () => {
              alert('Client modifié avec succès!');
              this.loadClients(); // Recharger la liste
              this.resetForm();
            },
            error: (error) => alert('Erreur modification: ' + error.message),
          });
      } else {
        // CRÉATION via API
        this.http
          .post('http://localhost:8080/api/clients', clientPourAPI)
          .subscribe({
            next: () => {
              alert('Client ajouté avec succès!');
              this.loadClients(); // Recharger la liste
              this.resetForm();
            },
            error: (error) => alert('Erreur création: ' + error.message),
          });
      }
    } else {
      alert('Veuillez remplir tous les champs obligatoires');
    }
  }

  editClient(client: any): void {
    this.isEditMode = true;
    this.selectedClient = client;
    this.clientForm.patchValue(client);
  }

  deleteClient(client: any): void {
    if (confirm(`Supprimer le client "${client.name}" ?`)) {
      // SUPPRESSION via API
      this.http
        .delete(`http://localhost:8080/api/clients/${client.id}`)
        .subscribe({
          next: () => {
            alert('Client supprimé avec succès!');
            this.loadClients(); // Recharger la liste
          },
          error: (error) => alert('Erreur suppression: ' + error.message),
        });
    }
  }

  resetForm(): void {
    this.clientForm.reset();
    this.isEditMode = false;
    this.selectedClient = null;
  }

  private generateClientId(): number {
    if (this.clients.length === 0) return 1;
    return Math.max(...this.clients.map((c) => c.id)) + 1;
  }
}
