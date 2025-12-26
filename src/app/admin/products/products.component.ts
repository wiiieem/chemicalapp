import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, Produit } from '../../services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  productForm: FormGroup;
  products: Produit[] = [];
  isEditMode = false;
  selectedProduct: Produit | null = null;

  constructor(private fb: FormBuilder, private productService: ProductService) {
    this.productForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProduits().subscribe({
      next: (data) => {
        console.log('Produits chargés:', data);
        this.products = data;
      },
      error: (error) => alert('Erreur chargement: ' + error.message),
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = this.productForm.value;

      if (this.isEditMode && formData.id) {
        this.productService.updateProduit(formData.id, formData).subscribe({
          next: () => {
            alert('Modifié avec succès!');
            this.loadProducts();
            this.resetForm();
          },
          error: (error) => alert('Erreur: ' + error.message),
        });
      } else {
        const { id, ...produitSansId } = formData;
        this.productService.addProduit(produitSansId).subscribe({
          next: () => {
            alert('Ajouté avec succès!');
            this.loadProducts();
            this.resetForm();
          },
          error: (error) => alert('Erreur: ' + error.message),
        });
      }
    }
  }

  editProduct(product: Produit): void {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.productForm.patchValue(product);
  }

  deleteProduct(product: Produit): void {
    if (confirm(`Supprimer "${product.name}" ?`)) {
      this.productService.deleteProduit(product.id).subscribe({
        next: () => {
          alert('Supprimé avec succès!');
          this.loadProducts();
        },
        error: (error) => alert('Erreur: ' + error.message),
      });
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.isEditMode = false;
    this.selectedProduct = null;
  }
}
