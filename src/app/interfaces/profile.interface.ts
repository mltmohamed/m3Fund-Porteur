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
  userType: string;
  state?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStats {
  totalProjects: number;
  totalCampaigns: number;
  totalFunds: number;
  memberSince: string;
  lastLogin: string;
}
