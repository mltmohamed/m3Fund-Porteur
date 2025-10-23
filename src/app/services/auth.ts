import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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
  private readonly API_URL = 'http://localhost:8080/api'; // Ajustez selon votre configuration
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
    formData.append('confirmPassword', data.confirmPassword);
    
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
      formData.append('profilePhoto', data.profilePhoto);
    }

    return this.http.post<IndividualRegistrationResponse>(
      `${this.API_URL}/auth/register/project-owners/individual`, 
      formData
    );
  }

  registerAssociation(data: AssociationRegistrationRequest): Observable<AssociationRegistrationResponse> {
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('associationName', data.associationName);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('address', data.address);
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    
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
    formData.append('companyName', data.companyName);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('address', data.address);
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    
    // Ajouter les fichiers si présents
    if (data.rccm) {
      formData.append('rccm', data.rccm);
    }
    if (data.bankStatement) {
      formData.append('bankStatement', data.bankStatement);
    }

    return this.http.post<CompanyRegistrationResponse>(
      `${this.API_URL}/auth/register/project-owners/company`, 
      formData
    );
  }

  // Refresh token
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/refresh`, refreshToken)
      .pipe(
        tap(response => {
          this.setTokens(response.accessToken, response.refreshToken);
        })
      );
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
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
