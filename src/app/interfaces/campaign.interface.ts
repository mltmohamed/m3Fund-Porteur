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
  projectId: number;
  title: string;
  description: string;
  targetBudget: number;
  shareOffered: number;
  startDate: string;
  endDate: string;
  campaignType: 'INVESTMENT' | 'DONATION' | 'VOLUNTEERING';
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  progress: number;
  fundsRaised: number;
  collaboratorCount: number;
  campaignCount: number;
  netValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignType {
  value: string;
  label: string;
  icon: string;
}
