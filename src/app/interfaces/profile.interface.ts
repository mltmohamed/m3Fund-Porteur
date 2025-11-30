export interface UserProfile {
  id: number;
  firstName?: string;
  lastName?: string;
  entityName?: string;
  email: string;
  phone: string;
  address: string;
  profilePhoto?: string;
  userType: 'INDIVIDUAL' | 'COMPANY' | 'ASSOCIATION';
  state?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  profilePhoto?: File;
  currentPassword?: string;
  entityName?: string;  // Ajouté pour les organisations et associations
  newPassword?: string;  // Ajouté pour le changement de mot de passe
  confirmPassword?: string;  // Ajouté pour le changement de mot de passe
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  id: number;
  firstName?: string;
  lastName?: string;
  entityName?: string;
  email: string;
  phone: string;
  address: string;
  profilePictureUrl?: string;  // Le backend retourne profilePictureUrl
  type: string;  // Changé de userType à type pour correspondre au backend
  state?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  fund: number;
}

export interface ProfileStats {
  totalProjects: number;
  totalCampaigns: number;
  totalFunds: number;
  memberSince: string;
  lastLogin: string;
}