export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IndividualRegistrationRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  annualIncome: number;
  password: string;
  confirmPassword: string;
  biometricCard?: File;
  residenceCertificate?: File;
  bankStatement?: File;
  profilePhoto?: File;
}

export interface IndividualRegistrationResponse {
  id: number;
  firstName?: string;
  lastName?: string;
  phone: string;
  email: string;
  address: string;
  annualIncome: number;
  userCreatedAt: string;
  state: string;
  userRoles: string[];
}

export interface CompanyRegistrationRequest {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  annualIncome: number;
  shareCapital: number;
  rccm: File | null;
  bankStatement: File | null;
  password: string;
  confirmPassword: string;
}

export interface CompanyRegistrationResponse {
  id: number;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  rccmUrl: string;
  bankStatementUrl: string | null;
  userCreatedAt: string;
}

export interface AssociationRegistrationRequest {
  associationName: string;
  phone: string;
  email: string;
  address: string;
  annualIncome: number;
  shareCapital: number;
  associationStatus: File | null;
  bankStatement: File | null;
  password: string;
  confirmPassword: string;
}

export interface AssociationRegistrationResponse {
  id: number;
  associationName: string;
  email: string;
  phone: string;
  address: string;
  associationStatusUrl: string;
  bankStatementUrl: string | null;
  userCreatedAt: string;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}
