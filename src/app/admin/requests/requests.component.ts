import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // AJOUTEZ CET IMPORT

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css'],
})
export class RequestsComponent implements OnInit {
  historyForm: FormGroup;
  history: any[] = [];
  products: any[] = [];
  clients: any[] = [];
  isEditMode = false;
  selectedHistory: any = null;
  searchTerm: string = '';
  filteredHistory: any[] = [];
  selectedFilter: string = 'all';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient // AJOUTEZ DANS LE CONSTRUCTEUR
  ) {
    this.historyForm = this.fb.group({
      id: [''],
      productId: ['', Validators.required],
      clientId: ['', Validators.required],
      quantity: [
        '',
        [Validators.required, Validators.min(1), Validators.max(1000)],
      ],
      transactionDate: ['', Validators.required],
      notes: ['', Validators.maxLength(500)],
      isPaperRequest: [false],
      scannedPhotoUrl: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts(); // CHARGER LES PRODUITS
    this.loadClients(); // CHARGER LES CLIENTS
    this.loadCommandes(); // CHARGER LES COMMANDES EXISTANTES
  }

  loadProducts(): void {
    this.http.get('http://localhost:8080/api/produits').subscribe({
      next: (data: any) => {
        console.log('Produits chargés:', data);
        this.products = data.map((p: any) => ({
          id: p.id,
          name: p.nom || p.name, // Support français/anglais
          quantity: p.quantite || p.stock,
          prix: p.prix || p.price,
          categorie: p.categorie || p.category,
        }));
      },
      error: (error) => console.error('Erreur chargement produits:', error),
    });
  }

  loadClients(): void {
    this.http.get('http://localhost:8080/api/clients').subscribe({
      next: (data: any) => {
        console.log('Clients chargés:', data);
        this.clients = data.map((c: any) => ({
          id: c.id,
          name: c.nom || c.name,
          email: c.email,
          phone: c.telephone || c.phone,
          address: c.adresse || c.address,
          category: c.category,
        }));
      },
      error: (error) => console.error('Erreur chargement clients:', error),
    });
  }

  loadCommandes(): void {
    this.http.get('http://localhost:8080/api/commandes').subscribe({
      next: (data: any) => {
        console.log('Commandes chargées:', data);
        this.history = data.map((cmd: any) => ({
          id: cmd.id,
          productId: cmd.produit?.id,
          productName: cmd.produit?.nom || 'Produit inconnu',
          clientId: cmd.client?.id,
          clientName: cmd.client?.nom || 'Client inconnu',
          quantity: cmd.quantite,
          transactionDate: cmd.dateTransaction,
          notes: cmd.notes,
          isPaperRequest: cmd.isPaperRequest || false,
          scannedPhotoUrl: cmd.scannedPhotoUrl,
          status: cmd.statut?.toLowerCase() || 'pending',
        }));
        this.filterHistory();
      },
      error: (error) => console.error('Erreur chargement commandes:', error),
    });
  }

  onSubmit(): void {
    if (this.historyForm.valid) {
      const formData = this.historyForm.value;

      // Trouver le produit et client sélectionnés
      const selectedProduct = this.products.find(
        (p) => p.id == formData.productId
      );
      const selectedClient = this.clients.find(
        (c) => c.id == formData.clientId
      );

      // Préparer la commande pour l'API
      const commandePourAPI = {
        produit: { id: formData.productId },
        client: { id: formData.clientId },
        quantite: formData.quantity,
        dateTransaction: formData.transactionDate,
        notes: formData.notes,
        isPaperRequest: formData.isPaperRequest || false,
        scannedPhotoUrl: formData.scannedPhotoUrl || '',
        statut: 'PENDING', // Majuscule pour Spring Boot enum
      };

      console.log('Commande à envoyer:', commandePourAPI);

      if (this.isEditMode && formData.id) {
        // MODIFICATION
        this.http
          .put(
            `http://localhost:8080/api/commandes/${formData.id}`,
            commandePourAPI
          )
          .subscribe({
            next: () => {
              alert('Demande modifiée avec succès!');
              this.loadCommandes(); // Recharger
              this.resetForm();
            },
            error: (error) => {
              console.error('Erreur modification:', error);
              alert('Erreur modification: ' + error.message);
            },
          });
      } else {
        // CRÉATION
        this.http
          .post('http://localhost:8080/api/commandes', commandePourAPI)
          .subscribe({
            next: () => {
              alert('Demande ajoutée avec succès!');
              this.loadCommandes(); // Recharger
              this.resetForm();
            },
            error: (error) => {
              console.error('Erreur création:', error);
              alert('Erreur création: ' + error.message);
            },
          });
      }
    } else {
      alert('Veuillez remplir tous les champs obligatoires');
    }
  }

  // Les autres méthodes restent inchangées...
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileName = `scanned_${Date.now()}_${file.name}`;
      const fileUrl = `assets/uploads/${fileName}`;
      this.historyForm.patchValue({ scannedPhotoUrl: fileUrl });
      alert(`Fichier "${file.name}" prêt à être uploadé!`);
    }
  }

  viewScannedPhoto(url: string): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Aucune photo scannée disponible');
    }
  }

  getRequestTypeText(isPaperRequest: boolean): string {
    return isPaperRequest ? 'Papier' : 'Numérique';
  }

  getRequestTypeClass(isPaperRequest: boolean): string {
    return isPaperRequest ? 'request-type-paper' : 'request-type-digital';
  }

  getFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  editHistory(historyItem: any): void {
    this.isEditMode = true;
    this.selectedHistory = historyItem;
    this.historyForm.patchValue({
      id: historyItem.id,
      productId: historyItem.productId,
      clientId: historyItem.clientId,
      quantity: historyItem.quantity,
      transactionDate: historyItem.transactionDate,
      notes: historyItem.notes,
      isPaperRequest: historyItem.isPaperRequest,
      scannedPhotoUrl: historyItem.scannedPhotoUrl,
    });
  }

  deleteHistory(historyItem: any): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande?')) {
      this.http
        .delete(`http://localhost:8080/api/commandes/${historyItem.id}`)
        .subscribe({
          next: () => {
            alert('Demande supprimée avec succès!');
            this.loadCommandes(); // Recharger
          },
          error: (error) => alert('Erreur suppression: ' + error.message),
        });
    }
  }

  changeStatus(historyItem: any, newStatus: string): void {
    if (!historyItem || !historyItem.id) return;
    const payload = { statut: (newStatus || '').toUpperCase() };
    this.http
      .patch(`http://localhost:8080/api/commandes/${historyItem.id}`, payload)
      .subscribe({
        next: () => {
          // Mise à jour locale immédiate
          historyItem.status = newStatus;
          this.filterHistory();
          // Notifier d'autres composants (dashboard) de rafraîchir
          try {
            window.dispatchEvent(new CustomEvent('requestsUpdated'));
          } catch (e) {
            console.warn(
              "Impossible de dispatcher l'événement requestsUpdated",
              e
            );
          }
          alert(`Statut mis à jour: ${this.getStatusText(newStatus)}`);
        },
        error: (error) => {
          console.error('Erreur mise à jour statut:', error);
          alert('Erreur mise à jour statut: ' + (error.message || error));
        },
      });
  }

  resetForm(): void {
    this.historyForm.reset();
    this.isEditMode = false;
    this.selectedHistory = null;
  }

  filterHistory(): void {
    this.filteredHistory = this.history.filter((item) => {
      const matchesSearch =
        this.searchTerm === '' ||
        (item.productName || '')
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        (item.clientName || '')
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        (item.notes || '')
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesFilter =
        this.selectedFilter === 'all' || item.status === this.selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }

  onSearchChange(): void {
    this.filterHistory();
  }

  onFilterChange(): void {
    this.filterHistory();
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

  getPendingRequests(): any[] {
    return this.history.filter((item) => item.status === 'pending');
  }

  getCompletedRequests(): any[] {
    return this.history.filter((item) => item.status === 'completed');
  }

  getSelectedProduct(): any {
    const productId = this.historyForm.get('productId')?.value;
    if (productId) {
      return this.products.find((p) => p.id == productId);
    }
    return null;
  }

  onProductChange(): void {
    const selectedProduct = this.getSelectedProduct();
    if (selectedProduct && selectedProduct.quantity === 0) {
      this.historyForm.get('quantity')?.setValue('');
    }
  }
}
