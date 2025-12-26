import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  FournisseurService,
  Fournisseur,
} from '../../services/fournisseur.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css'],
})
export class SuppliersComponent implements OnInit {
  supplierForm: FormGroup;
  suppliers: Fournisseur[] = [];
  isEditMode = false;
  selectedSupplier: Fournisseur | null = null;

  constructor(
    private fb: FormBuilder,
    private fournisseurService: FournisseurService
  ) {
    this.supplierForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      company: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.fournisseurService.getFournisseurs().subscribe({
      next: (data) => {
        console.log('Fournisseurs chargés:', data);
        this.suppliers = data;
      },
      error: (error) => alert('Erreur chargement: ' + error.message),
    });
  }

  onSubmit(): void {
    if (this.supplierForm.valid) {
      const formData = this.supplierForm.value;

      if (this.isEditMode && formData.id) {
        this.fournisseurService
          .updateFournisseur(formData.id, formData)
          .subscribe({
            next: () => {
              alert('Fournisseur modifié avec succès!');
              this.loadSuppliers();
              this.resetForm();
            },
            error: (error) => alert('Erreur: ' + error.message),
          });
      } else {
        const { id, ...fournisseurSansId } = formData;
        this.fournisseurService.addFournisseur(fournisseurSansId).subscribe({
          next: () => {
            alert('Fournisseur ajouté avec succès!');
            this.loadSuppliers();
            this.resetForm();
          },
          error: (error) => alert('Erreur: ' + error.message),
        });
      }
    } else {
      alert('Veuillez remplir tous les champs obligatoires');
    }
  }

  editSupplier(supplier: Fournisseur): void {
    this.isEditMode = true;
    this.selectedSupplier = supplier;
    this.supplierForm.patchValue(supplier);
  }

  deleteSupplier(supplier: Fournisseur): void {
    if (confirm(`Supprimer "${supplier.name}" ?`)) {
      this.fournisseurService.deleteFournisseur(supplier.id).subscribe({
        next: () => {
          alert('Fournisseur supprimé avec succès!');
          this.loadSuppliers();
        },
        error: (error) => alert('Erreur: ' + error.message),
      });
    }
  }

  resetForm(): void {
    this.supplierForm.reset();
    this.isEditMode = false;
    this.selectedSupplier = null;
  }
}
 