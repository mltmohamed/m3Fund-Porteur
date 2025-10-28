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

export interface ProjectStats {
  totalProjects: number;
  validatedProjects: number;
  pendingProjects: number;
  projectsWithActiveCampaigns: number;
}

export interface ProjectFilters {
  searchTerm: string;
  selectedStatus: string;
  selectedSector: string;
}

export interface ProjectCreateRequest {
  name: string;
  resume: string;
  description: string;
  domain: string;
  objective: string;
  websiteLink: string;
  launchedAt: string;
  images: File[];
  video: File;
  businessPlan: File;
}

export interface ProjectUpdateRequest {
  name?: string;
  resume?: string;
  description?: string;
  domain?: string;
  objective?: string;
  websiteLink?: string;
  launchedAt?: string;
  images?: File[];
  video?: File;
  businessPlan?: File;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  resume: string;
  objective: string;
  domain: string;
  websiteLink: string;
  imagesUrl: string[];
  videoUrl: string;
  businessPlanUrl: string;
  launchedAt: string;
  createdAt: string;
  isValidated: boolean;
}
