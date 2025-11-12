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
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = environment.apiUrl;
  private readonly API_ORIGIN = this.extractApiOrigin(environment.apiUrl);

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
    // Le backend attend PATCH avec @RequestBody (JSON), pas PUT avec FormData
    // Construire l'objet JSON (sans les fichiers car @RequestBody ne peut pas les recevoir)
    const updatePayload: any = {};
    
    if (projectData.name && projectData.name.trim()) {
      updatePayload.name = projectData.name.trim();
    }
    if (projectData.resume && projectData.resume.trim()) {
      updatePayload.resume = projectData.resume.trim();
    }
    if (projectData.description && projectData.description.trim()) {
      updatePayload.description = projectData.description.trim();
    }
    if (projectData.domain) {
      updatePayload.domain = projectData.domain;
    }
    if (projectData.objective && projectData.objective.trim()) {
      updatePayload.objective = projectData.objective.trim();
    }
    if (projectData.websiteLink && projectData.websiteLink.trim()) {
      updatePayload.websiteLink = projectData.websiteLink.trim();
    }
    if (projectData.launchedAt) {
      // Convertir en format ISO si nécessaire
      updatePayload.launchedAt = projectData.launchedAt;
    }
    
    // Note: Les images, vidéo et business plan ne peuvent pas être mis à jour via cet endpoint
    // car le backend utilise @RequestBody qui ne supporte pas les fichiers multipart
    
    console.log('JSON envoyé pour update:', updatePayload);
    
    return this.http.patch<ProjectResponse>(`${this.API_URL}/projects/${projectId}`, updatePayload);
  }

  // Supprimer un projet
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/projects/${id}`);
  }

  // Récupérer tous les projets de l'utilisateur connecté
  getMyProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/mine`);
  }

  // Récupérer les projets validés de l'utilisateur connecté
  getMyValidatedProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/mine-validated`);
  }

  // Récupérer les statistiques des projets depuis le backend (public)
  getProjectStats(): Observable<ProjectStats> {
    return this.http.get<ProjectStats>(`${this.API_URL}/public/projects/stats`);
  }

  // Récupérer les statistiques des projets de l'utilisateur connecté (privé)
  getMyProjectStats(): Observable<ProjectStats> {
    return this.http.get<ProjectStats>(`${this.API_URL}/projects/stats`);
  }

  // Ancienne méthode (à garder pour compatibilité si nécessaire)
  getProjectSummary(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(`${this.API_URL}/projects/stats`);
  }

  // Rechercher des projets (public)
  searchProjects(searchTerm: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/public/projects/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Rechercher des projets de l'utilisateur connecté (privé)
  searchMyProjects(searchTerm: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Filtrer les projets par statut (public)
  filterProjectsByStatus(status: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/public/projects/${status}`);
  }

  // Filtrer les projets de l'utilisateur connecté par statut (privé)
  filterMyProjectsByStatus(status: string): Observable<ProjectResponse[]> {
    // Utiliser l'endpoint approprié selon le statut
    if (status === 'VALIDATED' || status === 'APPROVED') {
      return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/mine-validated`);
    } else if (status === 'PENDING' || status === 'UNVALIDATED') {
      return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/mine-unvalidated`);
    }
    // Pour les autres statuts, retourner tous les projets
    return this.getMyProjects();
  }

  // Filtrer les projets par secteur/domaine (public)
  filterProjectsBySector(sector: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/public/projects/domain/${sector}`);
  }

  // Filtrer les projets de l'utilisateur connecté par secteur/domaine (privé)
  filterMyProjectsBySector(sector: string): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API_URL}/projects/domain?d=${encodeURIComponent(sector)}`);
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
    let status = backendProject.isValidated ? 'APPROVED' : 'PENDING';
    
    // Vérifier si la date de fin du projet (launchedAt) est dépassée
    const now = new Date();
    const projectEndDate = new Date(backendProject.launchedAt);
    now.setHours(0, 0, 0, 0);
    projectEndDate.setHours(0, 0, 0, 0);
    
    // Si la date de fin du projet est dépassée, marquer comme clôturé
    if (projectEndDate < now) {
      status = 'COMPLETED';
    }
    
    const images = (backendProject.imagesUrl || []).map(url => this.ensureAbsoluteUrl(url));
    const videoUrl = this.ensureAbsoluteUrl(backendProject.videoUrl || '');
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
      endDate: new Date(backendProject.launchedAt).toLocaleDateString('fr-FR'),
      statusDetail: status,
      collaboratorCount: '0',
      campaignCount: '0',
      projectSummary: backendProject.resume,
      targetBudget: '0 FCFA',
      shareOffered: '0%',
      netValue: '0 FCFA',
      fundsRaised: '0 FCFA',
      projectDescription: backendProject.description,
      images,
      videoUrl,
      hasMedia: images.length > 0 || !!videoUrl
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

  private ensureAbsoluteUrl(url?: string): string {
    if (!url) {
      return '';
    }
    // Si c'est déjà une URL HTTP/HTTPS, la retourner telle quelle
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    
    // Si c'est un chemin absolu Windows (commence par C:\ ou D:\ etc.) ou Unix (/)
    // Le convertir en URL via l'endpoint /public/download
    if (/^[A-Za-z]:\\/.test(url) || /^\/[^\/]/.test(url)) {
      // Encoder le chemin pour l'URL
      const encodedPath = encodeURIComponent(url);
      return `${this.API_URL}/public/download?absolutePath=${encodedPath}`;
    }
    
    // Si c'est un chemin relatif, essayer de le normaliser
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    if (normalizedPath.startsWith('/api')) {
      return `${this.API_ORIGIN}${normalizedPath}`;
    }
    const base = this.API_URL.replace(/\/$/, '');
    return `${base}${normalizedPath}`;
  }

  private extractApiOrigin(apiUrl: string): string {
    try {
      const parsed = new URL(apiUrl);
      return parsed.origin;
    } catch {
      // Fallback: retirer la partie chemin après le premier slash suivant le protocole
      const matches = apiUrl.match(/^(https?:\/\/[^\/]+)(?:\/.*)?$/i);
      return matches ? matches[1] : '';
    }
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
