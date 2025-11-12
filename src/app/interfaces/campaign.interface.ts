export interface Campaign {
  id: number;
  title: string;
  funds: string;
  sector: string;
  collaborators: string;
  progress: number;
  status: string;
  statusIcon: string;
  type: string;
  typeIcon: string;
  endDate: string;
  creationDate: string;
  statusDetail: string;
  collaboratorCount: string;
  campaignCount: string;
  campaignSummary: string;
  targetBudget: string;
  shareOffered: string;
  netValue: string;
  fundsRaised: string;
  campaignDescription: string;
}

export interface CampaignSummary {
  title: string;
  value: string;
  icon: string;
}

export interface CampaignFilters {
  searchTerm: string;
  selectedProject: string;
  selectedStatus: string;
}

export interface CampaignCreateRequest {
  endAt: string;
  type: 'INVESTMENT' | 'DONATION' | 'VOLUNTEERING';
  // Note: Le backend n'accepte pas 'description' dans CreateCampaignRequest
  targetVolunteer?: number;
  targetBudget?: number;
  shareOffered?: number;
  rewards?: RewardCreateRequest[];
}

export interface RewardCreateRequest {
  name: string;
  description: string;
  type: 'PRODUCT' | 'SERVICE' | 'EXPERIENCE';
  quantity: number;
  unlockAmount: number;
}

export interface CampaignUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  targetBudget?: number;
  shareOffered?: number;
  startDate?: string;
  endDate?: string;
}

export interface CampaignResponse {
  id: number;
  projectResponse?: {
    id: number;
    name: string;
    description: string;
    resume: string;
    domain: string;
  };
  owner?: any;
  launchedAt: string;
  endAt: string;
  targetBudget: number;
  targetVolunteer: number;
  shareOffered: number;
  type: 'INVESTMENT' | 'DONATION' | 'VOLUNTEERING';
  state: 'PENDING' | 'IN_PROGRESS' | 'FINISHED';
  rewards?: any[];
  currentFund: number;
  numberOfVolunteer: number;
  // Champs de compatibilité pour l'ancienne interface
  projectId?: number;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  campaignType?: 'INVESTMENT' | 'DONATION' | 'VOLUNTEERING';
  status?: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'FINISHED' | 'REJECTED';
  progress?: number;
  fundsRaised?: number;
  collaboratorCount?: number;
  campaignCount?: number;
  netValue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignType {
  value: string;
  label: string;
  icon: string;
}
