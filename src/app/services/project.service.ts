import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Project, 
  ProjectSummary, 
  ProjectCreateRequest, 
  ProjectUpdateRequest, 
  ProjectResponse 
} from '../interfaces/project.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = 'http://localhost:7878/api/v1';

  constructor(private http: HttpClient) {}

  // Récupérer tous les projets
  getProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/public/projects`);
  }

  // Récupérer un projet par ID
  getProjectById(id: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.API_URL}/projects/${id}`);
  }

  // Créer un nouveau projet
  createProject(projectData: ProjectCreateRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(`${this.API_URL}/projects`, projectData);
  }

  // Mettre à jour un projet
  updateProject(projectData: ProjectUpdateRequest): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.API_URL}/projects/${projectData.id}`, projectData);
  }

  // Supprimer un projet
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/projects/${id}`);
  }

  // Récupérer les statistiques des projets
  getProjectSummary(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(`${this.API_URL}/projects/summary`);
  }

  // Rechercher des projets
  searchProjects(searchTerm: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Filtrer les projets par statut
  filterProjectsByStatus(status: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/status/${status}`);
  }

  // Filtrer les projets par secteur
  filterProjectsBySector(sector: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/sector/${sector}`);
  }

  // Transformer les données du backend en format frontend
  transformProjectData(backendProject: ProjectResponse): Project {
    return {
      id: backendProject.id,
      title: backendProject.title,
      description: backendProject.description,
      funds: `${backendProject.fundsRaised.toLocaleString()} FCFA récoltés`,
      sector: backendProject.sector,
      collaborators: `${backendProject.collaboratorCount} Collaborateurs`,
      progress: backendProject.progress,
      status: this.getStatusLabel(backendProject.status),
      statusIcon: this.getStatusIcon(backendProject.status),
      creationDate: new Date(backendProject.createdAt).toLocaleDateString('fr-FR'),
      statusDetail: backendProject.status.toUpperCase(),
      collaboratorCount: backendProject.collaboratorCount.toString(),
      campaignCount: backendProject.campaignCount.toString(),
      projectSummary: backendProject.description,
      targetBudget: `${backendProject.targetBudget.toLocaleString()} FCFA`,
      shareOffered: `${backendProject.shareOffered}%`,
      netValue: `${backendProject.netValue.toLocaleString()} FCFA`,
      fundsRaised: `${backendProject.fundsRaised.toLocaleString()} FCFA`,
      projectDescription: backendProject.projectDescription
    };
  }

  // Transformer les données de résumé du backend
  transformSummaryData(backendSummary: any[]): ProjectSummary[] {
    return [
      {
        title: 'Nombre de projets',
        value: backendSummary[0]?.totalProjects?.toString() || '0',
        icon: 'fas fa-bars'
      },
      {
        title: 'En Cours',
        value: backendSummary[0]?.inProgress?.toString() || '0',
        icon: 'fas fa-circle-notch'
      },
      {
        title: 'Non validés',
        value: backendSummary[0]?.pending?.toString() || '0',
        icon: 'fas fa-times'
      },
      {
        title: 'Clôturés',
        value: backendSummary[0]?.closed?.toString() || '0',
        icon: 'fas fa-times-circle'
      }
    ];
  }

  private getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Non validé',
      'APPROVED': 'Validé',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Clôturé',
      'REJECTED': 'Rejeté'
    };
    return statusMap[status] || status;
  }

  private getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'PENDING': 'fas fa-clock',
      'APPROVED': 'fas fa-check',
      'IN_PROGRESS': 'fas fa-circle-notch',
      'COMPLETED': 'fas fa-times-circle',
      'REJECTED': 'fas fa-times'
    };
    return iconMap[status] || 'fas fa-question';
  }
}
