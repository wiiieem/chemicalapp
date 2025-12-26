import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Produit {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/produits`;

  constructor(private http: HttpClient) {}

  getProduits(): Observable<Produit[]> {
    return this.http
      .get<any[]>(this.apiUrl)
      .pipe(
        map((produitsApi) => produitsApi.map((p) => this.convertFromApi(p)))
      );
  }

  getProduit(id: string): Observable<Produit> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(map((p) => this.convertFromApi(p)));
  }

  searchProduits(query: string): Observable<Produit[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/search?q=${query}`)
      .pipe(
        map((produitsApi) => produitsApi.map((p) => this.convertFromApi(p)))
      );
  }

  addProduit(produit: Omit<Produit, 'id'>): Observable<Produit> {
    // Convertir anglais → français pour l'API
    const produitPourAPI = this.convertToApi(produit);
    console.log('Envoi à API:', produitPourAPI);

    return this.http
      .post<any>(this.apiUrl, produitPourAPI)
      .pipe(map((p) => this.convertFromApi(p)));
  }

  updateProduit(id: string, produit: Partial<Produit>): Observable<Produit> {
    const produitPourAPI = this.convertToApi(produit);
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, produitPourAPI)
      .pipe(map((p) => this.convertFromApi(p)));
  }

  deleteProduit(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // CONVERSIONS
  private convertToApi(produit: Partial<Produit>): any {
    return {
      nom: produit.name,
      description: produit.description,
      prix: produit.price,
      quantite: produit.stock,
      categorie: produit.category,
    };
  }

  private convertFromApi(produitApi: any): Produit {
    return {
      id: produitApi.id,
      name: produitApi.nom,
      description: produitApi.description,
      price: produitApi.prix,
      stock: produitApi.quantite,
      category: produitApi.categorie,
      image: produitApi.image,
      createdAt: produitApi.createdAt,
      updatedAt: produitApi.updatedAt,
    };
  }
}
