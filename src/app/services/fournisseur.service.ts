// src/app/services/fournisseur.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Fournisseur {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
}

@Injectable({
  providedIn: 'root',
})
export class FournisseurService {
  private apiUrl = `${environment.apiUrl}/api/fournisseurs`;

  constructor(private http: HttpClient) {}

  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http
      .get<any[]>(this.apiUrl)
      .pipe(
        map((fournisseurs) => fournisseurs.map((f) => this.convertFromApi(f)))
      );
  }

  addFournisseur(
    fournisseur: Omit<Fournisseur, 'id'>
  ): Observable<Fournisseur> {
    const fournisseurPourAPI = {
      nom: fournisseur.name,
      email: fournisseur.email,
      telephone: fournisseur.phone,
      adresse: fournisseur.address,
      entreprise: fournisseur.company,
    };
    return this.http
      .post<any>(this.apiUrl, fournisseurPourAPI)
      .pipe(map((f) => this.convertFromApi(f)));
  }

  updateFournisseur(
    id: string,
    fournisseur: Partial<Fournisseur>
  ): Observable<Fournisseur> {
    const fournisseurPourAPI = {
      nom: fournisseur.name,
      email: fournisseur.email,
      telephone: fournisseur.phone,
      adresse: fournisseur.address,
      entreprise: fournisseur.company,
    };
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, fournisseurPourAPI)
      .pipe(map((f) => this.convertFromApi(f)));
  }

  deleteFournisseur(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private convertFromApi(fournisseurApi: any): Fournisseur {
    return {
      id: fournisseurApi.id,
      name: fournisseurApi.nom,
      email: fournisseurApi.email,
      phone: fournisseurApi.telephone,
      address: fournisseurApi.adresse,
      company: fournisseurApi.entreprise,
    };
  }
}
