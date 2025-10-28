import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, ProfileUpdateRequest, PasswordChangeRequest, ProfileResponse, ProfileStats } from '../interfaces/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = 'http://localhost:7878/api/v1';

  constructor(private http: HttpClient) {}

  // Récupérer le profil de l'utilisateur connecté
  getCurrentProfile(): Observable<ProfileResponse> {
    console.log('Récupération du profil depuis:', `${this.API_URL}/users/me`);
    return this.http.get<ProfileResponse>(`${this.API_URL}/users/me`);
  }

  // Mettre à jour le profil
  updateProfile(profileData: ProfileUpdateRequest): Observable<ProfileResponse> {
    const formData = new FormData();
    
    if (profileData.firstName) formData.append('firstName', profileData.firstName);
    if (profileData.lastName) formData.append('lastName', profileData.lastName);
    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.phone) formData.append('phone', profileData.phone);
    if (profileData.address) formData.append('address', profileData.address);
    if (profileData.profilePhoto) formData.append('profilePhoto', profileData.profilePhoto);
    if (profileData.currentPassword) formData.append('currentPassword', profileData.currentPassword);

    return this.http.put<ProfileResponse>(`${this.API_URL}/users/me`, formData);
  }

  // Changer le mot de passe
  changePassword(passwordData: PasswordChangeRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/users/me/change-password`, passwordData);
  }

  // Récupérer les statistiques du profil
  getProfileStats(): Observable<ProfileStats> {
    // Pour l'instant, retourner des statistiques par défaut
    return new Observable(observer => {
      observer.next({
        totalProjects: 0,
        totalCampaigns: 0,
        totalFunds: 0,
        memberSince: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      observer.complete();
    });
  }

  // Supprimer le compte
  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/me`);
  }

  // Transformer les données du backend en format frontend
  transformProfileData(backendProfile: ProfileResponse): UserProfile {
    return {
      id: backendProfile.id,
      firstName: backendProfile.firstName,
      lastName: backendProfile.lastName,
      entityName: backendProfile.entityName,
      email: backendProfile.email,
      phone: backendProfile.phone,
      address: backendProfile.address,
      profilePhoto: backendProfile.profilePictureUrl,
      userType: backendProfile.userType as 'INDIVIDUAL' | 'COMPANY' | 'ASSOCIATION',
      createdAt: backendProfile.createdAt || '',
      updatedAt: backendProfile.updatedAt || ''
    };
  }

  // Obtenir le type d'utilisateur en français
  getUserTypeLabel(userType: string): string {
    const typeMap: { [key: string]: string } = {
      'INDIVIDUAL': 'Individu',
      'COMPANY': 'Entreprise',
      'ASSOCIATION': 'Association'
    };
    return typeMap[userType] || userType;
  }

  // Obtenir l'icône du type d'utilisateur
  getUserTypeIcon(userType: string): string {
    const iconMap: { [key: string]: string } = {
      'INDIVIDUAL': 'fas fa-user',
      'COMPANY': 'fas fa-building',
      'ASSOCIATION': 'fas fa-users'
    };
    return iconMap[userType] || 'fas fa-user';
  }
}
