import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Project, 
  ProjectSummary, 
  ProjectStats,
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
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('name', projectData.name);
    formData.append('resume', projectData.resume);
    formData.append('description', projectData.description);
    formData.append('domain', projectData.domain);
    formData.append('objective', projectData.objective);
    formData.append('websiteLink', projectData.websiteLink);
    formData.append('launchedAt', projectData.launchedAt);
    
    // Ajouter les fichiers
    if (projectData.images && projectData.images.length > 0) {
      projectData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    if (projectData.video) {
      formData.append('video', projectData.video);
    }
    
    if (projectData.businessPlan) {
      formData.append('businessPlan', projectData.businessPlan);
    }
    
    console.log('Envoi de la requête de création de projet...');
    console.log('FormData keys:', Array.from(formData.keys()));
    
    return this.http.post<ProjectResponse>(`${this.API_URL}/projects`, formData);
  }

  // Mettre à jour un projet
  updateProject(projectId: number, projectData: ProjectUpdateRequest): Observable<ProjectResponse> {
    const formData = new FormData();
    
    // Ajouter les champs texte si présents et non vides
    if (projectData.name && projectData.name.trim()) {
      formData.append('name', projectData.name.trim());
    }
    if (projectData.resume && projectData.resume.trim()) {
      formData.append('resume', projectData.resume.trim());
    }
    if (projectData.description && projectData.description.trim()) {
      formData.append('description', projectData.description.trim());
    }
    if (projectData.domain && projectData.domain.trim()) {
      formData.append('domain', projectData.domain.trim());
    }
    if (projectData.objective && projectData.objective.trim()) {
      formData.append('objective', projectData.objective.trim());
    }
    if (projectData.websiteLink && projectData.websiteLink.trim()) {
      formData.append('websiteLink', projectData.websiteLink.trim());
    }
    if (projectData.launchedAt) {
      formData.append('launchedAt', projectData.launchedAt);
    }
    
    // Ajouter les fichiers UNIQUEMENT s'ils sont présents et valides
    if (projectData.images && projectData.images.length > 0) {
      // Filtrer les fichiers vides ou invalides
      const validImages = projectData.images.filter(img => img && img.size > 0);
      if (validImages.length > 0) {
        validImages.forEach(image => {
          formData.append('images', image);
        });
      }
    }
    
    if (projectData.video && projectData.video.size > 0) {
      formData.append('video', projectData.video);
    }
    
    if (projectData.businessPlan && projectData.businessPlan.size > 0) {
      formData.append('businessPlan', projectData.businessPlan);
    }
    
    console.log('FormData envoyé pour update:', Array.from(formData.keys()));
    
    return this.http.put<ProjectResponse>(`${this.API_URL}/projects/${projectId}`, formData);
  }

  // Supprimer un projet
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/projects/${id}`);
  }

  // Récupérer tous les projets de l'utilisateur connecté
  getMyProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/my-projects`);
  }

  // Récupérer les projets validés de l'utilisateur connecté
  getMyValidatedProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/my-projects/validated`);
  }

  // Récupérer les statistiques des projets depuis le backend
  getProjectStats(): Observable<ProjectStats> {
    return this.http.get<ProjectStats>(`${this.API_URL}/public/projects/stats`);
  }

  // Ancienne méthode (à garder pour compatibilité si nécessaire)
  getProjectSummary(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(`${this.API_URL}/projects/summary`);
  }

  // Rechercher des projets
  searchProjects(searchTerm: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/public/projects/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Filtrer les projets par statut (validated ou pending)
  filterProjectsByStatus(status: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/public/projects/${status}`);
  }

  // Filtrer les projets par secteur/domaine
  filterProjectsBySector(sector: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/public/projects/domain/${sector}`);
  }

  // Récupérer les projets validés
  getValidatedProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/public/projects/validated`);
  }

  // Récupérer les projets en attente
  getPendingProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/public/projects/pending`);
  }

  // Transformer les données du backend en format frontend
  transformProjectData(backendProject: ProjectResponse): Project {
    const status = backendProject.isValidated ? 'APPROVED' : 'PENDING';
    return {
      id: backendProject.id,
      title: backendProject.name,
      description: backendProject.resume || backendProject.description,
      funds: '0 FCFA récoltés', // Sera calculé via les campagnes
      sector: this.getDomainLabel(backendProject.domain),
      collaborators: '0 Collaborateurs', // Sera calculé via les campagnes
      progress: 0, // Sera calculé via les campagnes
      status: this.getStatusLabel(status),
      statusIcon: this.getStatusIcon(status),
      creationDate: new Date(backendProject.createdAt).toLocaleDateString('fr-FR'),
      statusDetail: status,
      collaboratorCount: '0',
      campaignCount: '0',
      projectSummary: backendProject.resume,
      targetBudget: '0 FCFA',
      shareOffered: '0%',
      netValue: '0 FCFA',
      fundsRaised: '0 FCFA',
      projectDescription: backendProject.description
    };
  }

  // Transformer les données de statistiques du backend en cartes de résumé
  transformStatsToSummary(stats: ProjectStats): ProjectSummary[] {
    return [
      {
        title: 'Nombre de projets',
        value: stats.totalProjects.toString(),
        icon: 'fas fa-bars'
      },
      {
        title: 'En Cours',
        value: stats.projectsWithActiveCampaigns.toString(),
        icon: 'fas fa-circle-notch'
      },
      {
        title: 'Validés',
        value: stats.validatedProjects.toString(),
        icon: 'fas fa-check'
      },
      {
        title: 'Non validés',
        value: stats.pendingProjects.toString(),
        icon: 'fas fa-clock'
      }
    ];
  }

  // Transformer les données de résumé du backend (ancienne méthode)
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

  getDomainLabel(domain: string): string {
    const domainMap: { [key: string]: string } = {
      'AGRICULTURE': 'Agriculture',
      'BREEDING': 'Élevage',
      'EDUCATION': 'Éducation',
      'HEALTH': 'Santé',
      'MINE': 'Mine',
      'CULTURE': 'Culture',
      'ENVIRONMENT': 'Environnement',
      'COMPUTER_SCIENCE': 'Informatique',
      'SOLIDARITY': 'Solidarité',
      'SHOPPING': 'Commerce',
      'SOCIAL': 'Social'
    };
    return domainMap[domain] || domain;
  }
}
