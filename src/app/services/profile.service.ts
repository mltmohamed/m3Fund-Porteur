import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { UserProfile, ProfileUpdateRequest, PasswordChangeRequest, ProfileResponse, ProfileStats } from '../interfaces/profile.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = environment.apiUrl;
  private currentUserType: string | null = null;

  constructor(private http: HttpClient) {}

  // Récupérer le profil de l'utilisateur connecté
  getCurrentProfile(): Observable<ProfileResponse> {
    console.log('Récupération du profil depuis:', `${this.API_URL}/users/me`);
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<ProfileResponse>(`${this.API_URL}/users/me`, { headers });
  }

  // Mettre à jour le profil
  updateProfile(profileData: ProfileUpdateRequest): Observable<ProfileResponse> {
    // Vérifier si le type d'utilisateur est disponible
    if (!this.currentUserType) {
      console.log('Type d\'utilisateur non disponible, chargement du profil...');
      // Charger le profil d'abord pour obtenir le type d'utilisateur
      return this.getCurrentProfile().pipe(
        switchMap((profile: ProfileResponse) => {
          // Transformer les données pour définir le type d'utilisateur
          this.transformProfileData(profile);
          // Maintenant faire la mise à jour
          return this.performUpdate(profileData);
        })
      );
    } else {
      // Le type d'utilisateur est disponible, faire la mise à jour directement
      return this.performUpdate(profileData);
    }
  }

  // Effectuer la mise à jour du profil
  private performUpdate(profileData: ProfileUpdateRequest): Observable<ProfileResponse> {
    const formData = new FormData();

    // Ajouter les champs de texte au FormData
    if (this.currentUserType === 'INDIVIDUAL') {
      if (profileData.firstName) formData.append('firstName', profileData.firstName);
      if (profileData.lastName) formData.append('lastName', profileData.lastName);
      // Le backend attend 'profilePicture' pour les individus
      if (profileData.profilePhoto) formData.append('profilePicture', profileData.profilePhoto);
      // Le backend attend 'password' et non 'currentPassword'
      if (profileData.currentPassword) formData.append('password', profileData.currentPassword);
    } else {
      // Pour les organisations et associations
      if (profileData.entityName) formData.append('entityName', profileData.entityName);
      if (profileData.email) formData.append('email', profileData.email);
      if (profileData.phone) formData.append('phone', profileData.phone);
      if (profileData.address) formData.append('address', profileData.address);
      // Le backend attend 'logo' pour les organisations et associations
      if (profileData.profilePhoto) formData.append('logo', profileData.profilePhoto);
      // Le backend attend 'password' et non 'currentPassword'
      if (profileData.currentPassword) formData.append('password', profileData.currentPassword);
    }

    // Déterminer l'endpoint approprié en fonction du type d'utilisateur
    let endpoint = `${this.API_URL}/users/me`; // fallback
    
    console.log('Type d\'utilisateur courant:', this.currentUserType);
    
    if (this.currentUserType === 'INDIVIDUAL') {
      endpoint = `${this.API_URL}/project-owners/individuals`;
    } else if (this.currentUserType === 'COMPANY' || this.currentUserType === 'ORGANIZATION') {
      endpoint = `${this.API_URL}/project-owners/organizations`;
    } else if (this.currentUserType === 'ASSOCIATION') {
      endpoint = `${this.API_URL}/project-owners/associations`;
    }

    // Ajouter explicitement le header d'authentification comme dans campaign.service.ts
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });

    console.log('Mise à jour du profil via:', endpoint);
    console.log('FormData envoyé:', formData);
    return this.http.patch<ProfileResponse>(endpoint, formData, { headers });
  }

  // Changer le mot de passe
  changePassword(passwordData: PasswordChangeRequest): Observable<any> {
    // Utiliser la même approche que updateProfile mais uniquement avec le mot de passe
    const updateData: ProfileUpdateRequest = {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
    };
    
    // Vérifier si le type d'utilisateur est disponible
    if (!this.currentUserType) {
      console.log('Type d\'utilisateur non disponible, chargement du profil pour changer le mot de passe...');
      // Charger le profil d'abord pour obtenir le type d'utilisateur
      return this.getCurrentProfile().pipe(
        switchMap((profile: ProfileResponse) => {
          // Transformer les données pour définir le type d'utilisateur
          this.transformProfileData(profile);
          // Maintenant faire la mise à jour du mot de passe
          return this.performPasswordUpdate(updateData);
        })
      );
    } else {
      // Le type d'utilisateur est disponible, faire la mise à jour directement
      return this.performPasswordUpdate(updateData);
    }
  }

  // Effectuer la mise à jour du mot de passe
  private performPasswordUpdate(passwordData: ProfileUpdateRequest): Observable<ProfileResponse> {
    const formData = new FormData();

    // Ajouter uniquement le mot de passe au FormData
    // Le backend attend 'password' et non 'currentPassword'
    if (passwordData.newPassword) {
      formData.append('password', passwordData.newPassword);
    }

    // Déterminer l'endpoint approprié en fonction du type d'utilisateur
    let endpoint = `${this.API_URL}/users/me`; // fallback
    
    console.log('Type d\'utilisateur courant pour changement de mot de passe:', this.currentUserType);
    
    if (this.currentUserType === 'INDIVIDUAL') {
      endpoint = `${this.API_URL}/project-owners/individuals`;
    } else if (this.currentUserType === 'COMPANY' || this.currentUserType === 'ORGANIZATION') {
      endpoint = `${this.API_URL}/project-owners/organizations`;
    } else if (this.currentUserType === 'ASSOCIATION') {
      endpoint = `${this.API_URL}/project-owners/associations`;
    }

    // Ajouter explicitement le header d'authentification comme dans campaign.service.ts
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });

    console.log('Changement de mot de passe via:', endpoint);
    console.log('FormData envoyé:', formData);
    return this.http.patch<ProfileResponse>(endpoint, formData, { headers });
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
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.delete<void>(`${this.API_URL}/users/me`, { headers });
  }

  // Transformer les données du backend en format frontend
  transformProfileData(backendProfile: ProfileResponse): UserProfile {
    // Stocker le type d'utilisateur pour les mises à jour
    // Changé de userType à type pour correspondre au backend
    this.currentUserType = backendProfile.type;
    
    console.log('Type d\'utilisateur défini à partir du profil:', this.currentUserType);
    
    // S'assurer que le mapping est correct entre le backend et le frontend
    // Le backend utilise ORGANIZATION mais le frontend utilise COMPANY
    let mappedUserType = backendProfile.type;
    if (mappedUserType === 'ORGANIZATION') {
      mappedUserType = 'COMPANY';
    }
    
    return {
      id: backendProfile.id,
      firstName: backendProfile.firstName,
      lastName: backendProfile.lastName,
      entityName: backendProfile.entityName,
      email: backendProfile.email,
      phone: backendProfile.phone,
      address: backendProfile.address,
      profilePhoto: backendProfile.profilePictureUrl,
      userType: mappedUserType as 'INDIVIDUAL' | 'COMPANY' | 'ASSOCIATION',
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