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
    // Le backend attend 'profilePicture' et non 'profilePhoto'
    if (profileData.profilePhoto) formData.append('profilePicture', profileData.profilePhoto);
    // Le backend attend 'password' et non 'currentPassword'
    if (profileData.currentPassword) formData.append('password', profileData.currentPassword);

    // Utiliser l'endpoint project-owners pour la mise à jour
    return this.http.patch<ProfileResponse>(`${this.API_URL}/project-owners`, formData);
  }

  // Changer le mot de passe
  changePassword(passwordData: PasswordChangeRequest): Observable<any> {
    // Note: Cet endpoint n'existe peut-être pas encore dans le backend
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
    // Note: Cet endpoint n'existe peut-être pas encore dans le backend
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
      state: backendProfile.state as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | undefined,
      createdAt: backendProfile.createdAt || '',
      updatedAt: backendProfile.updatedAt || ''
    };
  }
  
  // Vérifier si l'utilisateur est vérifié (ACTIVE)
  isUserVerified(userProfile: UserProfile | null): boolean {
    return userProfile?.state === 'ACTIVE';
  }
  
  // Obtenir le label du statut de vérification
  getVerificationStatusLabel(state?: string): string {
    switch (state) {
      case 'ACTIVE':
        return 'Vérifié';
      case 'INACTIVE':
        return 'Non vérifié';
      case 'SUSPENDED':
        return 'Suspendu';
      default:
        return 'Non vérifié';
    }
  }
  
  // Obtenir l'icône du statut de vérification
  getVerificationStatusIcon(state?: string): string {
    switch (state) {
      case 'ACTIVE':
        return 'fas fa-check-circle';
      case 'INACTIVE':
        return 'fas fa-clock';
      case 'SUSPENDED':
        return 'fas fa-ban';
      default:
        return 'fas fa-clock';
    }
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
