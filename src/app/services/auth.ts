import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  IndividualRegistrationRequest,
  IndividualRegistrationResponse,
  CompanyRegistrationRequest,
  CompanyRegistrationResponse,
  AssociationRegistrationRequest,
  AssociationRegistrationResponse,
  ApiError
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setTokens(response.accessToken, response.refreshToken);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  // Inscription individu
  registerIndividual(data: IndividualRegistrationRequest): Observable<IndividualRegistrationResponse> {
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('address', data.address);
    formData.append('annualIncome', data.annualIncome.toString());
    formData.append('password', data.password);
    
    // Ajouter les fichiers si présents
    if (data.biometricCard) {
      formData.append('biometricCard', data.biometricCard);
    }
    if (data.residenceCertificate) {
      formData.append('residenceCertificate', data.residenceCertificate);
    }
    if (data.bankStatement) {
      formData.append('bankStatement', data.bankStatement);
    }
    if (data.profilePhoto) {
      formData.append('profilePicture', data.profilePhoto);
    }

    const url = `${this.API_URL}/auth/register/project-owners/individual`;
    console.log('Envoi de la requête d\'inscription à:', url);
    console.log('FormData keys:', Array.from(formData.keys()));
    
    // Vérifier chaque fichier
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1] instanceof File ? `${(pair[1] as File).name} (${(pair[1] as File).size} bytes)` : pair[1]);
    }

    return this.http.post<IndividualRegistrationResponse>(url, formData);
  }

  registerAssociation(data: AssociationRegistrationRequest): Observable<AssociationRegistrationResponse> {
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('entityName', data.associationName);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('address', data.address);
    formData.append('password', data.password);
    formData.append('annualIncome', data.annualIncome.toString());
    formData.append('shareCapital', data.shareCapital.toString());
    
    // Ajouter les fichiers si présents
    if (data.associationStatus) {
      formData.append('associationStatus', data.associationStatus);
    }
    if (data.bankStatement) {
      formData.append('bankStatement', data.bankStatement);
    }

    return this.http.post<AssociationRegistrationResponse>(
      `${this.API_URL}/auth/register/project-owners/association`, 
      formData
    );
  }

  registerCompany(data: CompanyRegistrationRequest): Observable<CompanyRegistrationResponse> {
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('entityName', data.companyName);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('address', data.address);
    formData.append('password', data.password);
    formData.append('annualIncome', data.annualIncome.toString());
    formData.append('shareCapital', data.shareCapital.toString());
    
    // Ajouter les fichiers si présents
    if (data.rccm) {
      formData.append('rccm', data.rccm);
    }
    if (data.bankStatement) {
      formData.append('bankStatement', data.bankStatement);
    }

    return this.http.post<CompanyRegistrationResponse>(
      `${this.API_URL}/auth/register/project-owners/organization`, 
      formData
    );
  }

  // Refresh token
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Créer un objet avec le refresh token
    const refreshData = { refreshToken: refreshToken };
    
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/refresh`, refreshData)
      .pipe(
        tap(response => {
          this.setTokens(response.accessToken, response.refreshToken);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
    
    // Rediriger vers la page de connexion
    console.log('Redirection vers la page de connexion...');
    window.location.href = '/';
  }

  // Gestion des tokens
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  // Headers avec token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return this.hasToken();
  }
}
