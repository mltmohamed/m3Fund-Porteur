export interface Project {
  id: number;
  title: string;
  description: string;
  funds: string;
  sector: string;
  collaborators: string;
  progress: number;
  status: string;
  statusIcon: string;
  creationDate: string;
  statusDetail: string;
  collaboratorCount: string;
  campaignCount: string;
  projectSummary: string;
  targetBudget: string;
  shareOffered: string;
  netValue: string;
  fundsRaised: string;
  projectDescription: string;
}

export interface ProjectSummary {
  title: string;
  value: string;
  icon: string;
}

export interface ProjectFilters {
  searchTerm: string;
  selectedStatus: string;
  selectedSector: string;
}

export interface ProjectCreateRequest {
  title: string;
  description: string;
  sector: string;
  targetBudget: number;
  shareOffered: number;
  projectDescription: string;
}

export interface ProjectUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  sector?: string;
  targetBudget?: number;
  shareOffered?: number;
  projectDescription?: string;
}

export interface ProjectResponse {
  id: number;
  title: string;
  description: string;
  sector: string;
  targetBudget: number;
  shareOffered: number;
  projectDescription: string;
  status: string;
  progress: number;
  fundsRaised: number;
  collaboratorCount: number;
  campaignCount: number;
  netValue: number;
  createdAt: string;
  updatedAt: string;
}
