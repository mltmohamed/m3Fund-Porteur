import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { 
  Campaign, 
  CampaignSummary, 
  CampaignCreateRequest, 
  CampaignUpdateRequest, 
  CampaignResponse 
} from '../interfaces/campaign.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les campagnes validées et en cours (ENDPOINT PUBLIC - pour les contributeurs)
  getCampaigns(): Observable<CampaignResponse[]> {
    // Ajouter un timestamp pour éviter le cache
    const timestamp = new Date().getTime();
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    // Cet endpoint retourne uniquement les campagnes validées (IN_PROGRESS)
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/mine`, {headers});
  }

  // Récupérer les campagnes du porteur de projet connecté (ENDPOINT PRIVÉ)
  getMyCampaigns(): Observable<CampaignResponse[]> {
    const timestamp = new Date().getTime();
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/mine`, {headers});
  }

  // Récupérer les campagnes actives (en cours)
  getActiveCampaigns(): Observable<CampaignResponse[]> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/mine-active`, {headers});
  }

  // Récupérer une campagne par ID
  getCampaignById(id: number): Observable<CampaignResponse> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    // Note: Cet endpoint n'existe peut-être pas dans le backend, à vérifier
    return this.http.get<CampaignResponse>(`${this.API_URL}/projects/campaigns/${id}`, {headers});
  }

  // Créer une nouvelle campagne
  createCampaign(projectId: number, campaignData: CampaignCreateRequest): Observable<CampaignResponse> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.post<CampaignResponse>(`${this.API_URL}/projects/${projectId}/campaigns`, campaignData, {headers});
  }

  // Mettre à jour une campagne
  updateCampaign(campaignData: CampaignUpdateRequest): Observable<CampaignResponse> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    
    // Log the data being sent
    console.log('Sending campaign update data:', campaignData);
    console.log('Update URL:', `${this.API_URL}/projects/campaigns/${campaignData.id}`);
    console.log('Request method: PATCH');
    
    // Log the full request details
    console.log('Full request details:', {
      url: `${this.API_URL}/projects/campaigns/${campaignData.id}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: campaignData
    });
    
    return this.http.patch<CampaignResponse>(`${this.API_URL}/projects/campaigns/${campaignData.id}`, campaignData, {headers}).pipe(
      // Log the response
      tap({
        next: (response) => {
          console.log('Received campaign update response:', response);
          // Check if localization data is in the response
          if (response.localization) {
            console.log('Localization data in response:', response.localization);
            // Compare with the sent data
            if (campaignData.localization) {
              console.log('Comparing sent vs received localization data:');
              console.log('Sent:', campaignData.localization);
              console.log('Received:', response.localization);
              
              // Check if data matches
              const sentKeys = Object.keys(campaignData.localization);
              const receivedKeys = Object.keys(response.localization);
              const allKeys = [...new Set([...sentKeys, ...receivedKeys])];
              
              allKeys.forEach(key => {
                if (campaignData.localization && response.localization) {
                  const sentValue = campaignData.localization[key as keyof typeof campaignData.localization];
                  const receivedValue = response.localization[key as keyof typeof response.localization];
                  if (sentValue !== receivedValue) {
                    console.warn(`Localization field ${key} mismatch: sent ${sentValue}, received ${receivedValue}`);
                  }
                }
              });
            }
          } else {
            console.log('No localization data in response');
          }
        },
        error: (error) => {
          console.error('Error updating campaign:', error);
          if (error.error) {
            console.error('Error details:', error.error);
          }
          // Log the full error response
          console.error('Full error object:', JSON.stringify(error, null, 2));
        }
      })
    );
  }

  // Supprimer une campagne
  deleteCampaign(id: number): Observable<void> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    // Note: Cet endpoint n'existe peut-être pas dans le backend, à vérifier
    return this.http.delete<void>(`${this.API_URL}/projects/campaigns/${id}`, {headers});
  }

  // Récupérer les statistiques des campagnes
  getCampaignSummary(): Observable<CampaignSummary[]> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<CampaignSummary[]>(`${this.API_URL}/projects/campaigns/stats`, {headers});
  }

  // Rechercher des campagnes (ENDPOINT PUBLIC - pour les contributeurs)
  searchCampaigns(searchTerm: string): Observable<CampaignResponse[]> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/search?q=${encodeURIComponent(searchTerm)}`, {headers});
  }

  // Rechercher les campagnes du porteur de projet connecté (ENDPOINT PRIVÉ)
  searchMyCampaigns(searchTerm: string): Observable<CampaignResponse[]> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/search?q=${encodeURIComponent(searchTerm)}`, {headers});
  }

  // Filtrer les campagnes par projet (ENDPOINT PUBLIC - pour les contributeurs)
  filterCampaignsByProject(projectId: number): Observable<CampaignResponse[]> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/${projectId}/campaigns`, {headers});
  }

  // Filtrer les campagnes du porteur par projet (ENDPOINT PRIVÉ)
  filterMyCampaignsByProject(projectId: number): Observable<CampaignResponse[]> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/${projectId}/campaigns`, {headers});
  }

  // Filtrer les campagnes par statut (ENDPOINT PUBLIC - pour les contributeurs)
  filterCampaignsByStatus(status: string): Observable<CampaignResponse[]> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    if (status === 'IN_PROGRESS' || status === 'ACTIVE') {
      return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/mine-active`, {headers});
    } else if (status === 'COMPLETED' || status === 'FINISHED') {
      return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/mine-finished`, {headers});
    }
    // Pour les autres statuts, retourner toutes les campagnes
    return this.getMyCampaigns();
  }

  // Filtrer les campagnes du porteur par statut (ENDPOINT PRIVÉ)
  filterMyCampaignsByStatus(status: string): Observable<CampaignResponse[]> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    // Utiliser l'endpoint des campagnes actives ou terminées selon le statut
    if (status === 'IN_PROGRESS' || status === 'ACTIVE') {
      return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/mine-active`, {headers});
    } else if (status === 'COMPLETED' || status === 'FINISHED') {
      return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/mine-finished`, {headers});
    }
    // Pour les autres statuts, retourner toutes les campagnes
    return this.getMyCampaigns();
  }

  // Filtrer les campagnes par type
  filterCampaignsByType(type: string): Observable<CampaignResponse[]> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/projects/campaigns/type?t=${encodeURIComponent(type)}`, {headers});
  }

  // Récupérer les statistiques des campagnes (ENDPOINT PUBLIC - pour les contributeurs)
  getCampaignStats(): Observable<any> {
    const headers : HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<any>(`${this.API_URL}/projects/campaigns/stats`, {headers});
  }

  // Récupérer les statistiques des campagnes du porteur de projet connecté (ENDPOINT PRIVÉ)
  getMyCampaignStats(): Observable<any> {
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.get<any>(`${this.API_URL}/projects/campaigns/stats`, {headers});
  }

  // Clôturer une campagne manuellement
  finishCampaign(campaignId: number): Observable<CampaignResponse> {
    const headers: HttpHeaders = new HttpHeaders({
      "Authorization": `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.post<CampaignResponse>(`${this.API_URL}/projects/campaigns/${campaignId}/finish`, {}, { headers });
  }

  // Transformer les statistiques en cartes de résumé
  transformStatsToSummary(stats: any): CampaignSummary[] {
    return [
      {
        title: 'Nombre de Campagne',
        value: stats.total?.toString() || '0',
        icon: 'fas fa-bullhorn'
      },
      {
        title: 'En Cours',
        value: stats.inProgress?.toString() || '0',
        icon: 'fas fa-circle-notch'
      },
      {
        title: 'Non validés',
        value: stats.pending?.toString() || '0',
        icon: 'fas fa-times'
      },
      {
        title: 'Clôturés',
        value: stats.finished?.toString() || '0',
        icon: 'fas fa-times-circle'
      }
    ];
  }

  // Transformer les données du backend en format frontend
  transformCampaignData(backendCampaign: any): Campaign {
    // Le backend retourne CampaignResponse avec projectResponse, owner, etc.
    // Extraire les données nécessaires
    const project = backendCampaign.projectResponse || {};
    const projectName = project.name || backendCampaign.title || 'Projet sans nom';
    // Description spécifique à la campagne (backendCampaign.description)
    const campaignDescription = typeof backendCampaign.description === 'string' ? backendCampaign.description : '';
    // Description / résumé du projet
    const projectDescription = typeof project.description === 'string' ? project.description : '';
    const projectResume = typeof project.resume === 'string' ? project.resume : '';
    // Pour les affichages de campagne, on privilégie toujours la description de campagne
    const descriptionSource = campaignDescription || projectDescription || projectResume || '';
    // Le domaine doit être extrait du projectResponse, avec une valeur par défaut si absent
    const projectDomain = project.domain || 'SANTE';
    const projectId = project.id || backendCampaign.projectId || 0;
    
    console.log('Transformation campagne:', {
      campaignId: backendCampaign.id,
      projectDomain: projectDomain,
      project: project,
      hasProjectResponse: !!backendCampaign.projectResponse
    });
    
    // Mapper les champs du backend vers le frontend
    const campaignType = backendCampaign.type || backendCampaign.campaignType || 'INVESTMENT';
    const campaignState = backendCampaign.state || backendCampaign.status || 'IN_PROGRESS';
    const fundsRaised = backendCampaign.currentFund || backendCampaign.fundsRaised || 0;
    const collaboratorCount = backendCampaign.numberOfVolunteer || backendCampaign.collaboratorCount || 0;
    const targetBudget = backendCampaign.targetBudget || 0;
    const shareOffered = backendCampaign.shareOffered || 0;
    const launchedAt = backendCampaign.launchedAt || backendCampaign.startDate || '';
    const endAt = backendCampaign.endAt || backendCampaign.endDate || '';
    
    // Calculer le progrès
    let progress = 0;
    if (campaignType === 'VOLUNTEERING') {
      const targetVolunteer = backendCampaign.targetVolunteer || 0;
      progress = targetVolunteer > 0 ? Math.round((collaboratorCount / targetVolunteer) * 100) : 0;
    } else {
      progress = targetBudget > 0 ? Math.round((fundsRaised / targetBudget) * 100) : 0;
    }
    progress = Math.min(progress, 100); // Limiter à 100%
    
    const collaboratorText = collaboratorCount === 1 ? 'Collaborateur' : 'Collaborateurs';
    const volunteerText = collaboratorCount === 1 ? 'bénévole trouvé' : 'bénévoles trouvés';
    
    // Pour les campagnes de bénévolat, afficher le nombre de bénévoles au lieu des fonds récoltés
    let fundsDisplay: string;
    if (campaignType === 'VOLUNTEERING') {
      fundsDisplay = `${collaboratorCount} ${volunteerText}`;
    } else {
      fundsDisplay = `${fundsRaised.toLocaleString('fr-FR')} FCFA récoltés`;
    }
    
    // Vérifier si la date de fin de la campagne est dépassée
    let campaignStatus = campaignState;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Vérifier les dates seulement si elles sont présentes
    if (endAt) {
      const campaignEndDate = new Date(endAt);
      campaignEndDate.setHours(0, 0, 0, 0);
      
      // Si la date de fin est dépassée et que la campagne n'est pas déjà clôturée, marquer comme clôturée
      if (campaignEndDate < now && campaignStatus !== 'COMPLETED' && campaignStatus !== 'FINISHED' && campaignStatus !== 'REJECTED') {
        campaignStatus = 'COMPLETED';
      }
    }
    
    // Obtenir le label du domaine
    const domainLabel = this.getDomainLabel(projectDomain);
    
    return {
      id: backendCampaign.id,
      title: projectName,
      funds: fundsDisplay,
      sector: domainLabel,
      collaborators: `${collaboratorCount} ${collaboratorText}`,
      progress: progress,
      status: this.getStatusLabel(campaignStatus),
      statusIcon: this.getStatusIcon(campaignStatus),
      type: this.getCampaignTypeLabel(campaignType),
      typeIcon: this.getCampaignTypeIcon(campaignType),
      endDate: endAt ? new Date(endAt).toLocaleDateString('fr-FR') : '',
      creationDate: launchedAt ? new Date(launchedAt).toLocaleDateString('fr-FR') : '',
      statusDetail: campaignStatus,
      collaboratorCount: collaboratorCount.toString(),
      campaignCount: '0', // Non disponible dans CampaignResponse
      campaignSummary: descriptionSource && descriptionSource.trim().length > 0 
        ? (descriptionSource.length > 150 ? descriptionSource.substring(0, 150) + '...' : descriptionSource)
        : '',
      targetBudget: `${targetBudget.toLocaleString('fr-FR')} FCFA`,
      shareOffered: `${shareOffered}%`,
      netValue: '0 FCFA', // Non disponible dans CampaignResponse
      fundsRaised: `${fundsRaised.toLocaleString('fr-FR')} FCFA`,
      campaignDescription: descriptionSource && descriptionSource.trim().length > 0 
        ? descriptionSource.trim() 
        : '',
      // Add localization data if available
      localization: backendCampaign.localization ? {
        country: backendCampaign.localization.country,
        town: backendCampaign.localization.town,
        region: backendCampaign.localization.region,
        street: backendCampaign.localization.street,
        longitude: backendCampaign.localization.longitude,
        latitude: backendCampaign.localization.latitude
      } : undefined
    };
  }
  
  // Obtenir le label du domaine
  private getDomainLabel(domain: string): string {
    const domainMap: { [key: string]: string } = {
      'SANTE': 'SANTE',
      'EDUCATION': 'EDUCATION',
      'AGRICULTURE': 'AGRICULTURE',
      'TECHNOLOGY': 'TECHNOLOGIE',
      'SHOPPING': 'COMMERCE',
      'ENERGY': 'ENERGIE',
      'TRANSPORT': 'TRANSPORT',
      'TOURISM': 'TOURISME',
      'REAL_ESTATE': 'IMMOBILIER',
      'FOOD': 'ALIMENTATION'
    };
    return domainMap[domain] || domain;
  }

  // Transformer les données de résumé du backend
  transformSummaryData(backendSummary: any[]): CampaignSummary[] {
    return [
      {
        title: 'Nombre de Campagne',
        value: backendSummary[0]?.totalCampaigns?.toString() || '0',
        icon: 'fas fa-bullhorn'
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
      'FINISHED': 'Clôturé',
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
      'FINISHED': 'fas fa-times-circle',
      'REJECTED': 'fas fa-times'
    };
    return iconMap[status] || 'fas fa-question';
  }

  private getCampaignTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'INVESTMENT': 'Investissement',
      'DONATION': 'Don',
      'VOLUNTEERING': 'Bénévolat'
    };
    return typeMap[type] || type;
  }

  private getCampaignTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'INVESTMENT': 'fas fa-chart-line',
      'DONATION': 'fas fa-dollar-sign',
      'VOLUNTEERING': 'fas fa-hands-helping'
    };
    return iconMap[type] || 'fas fa-question';
  }

  private getSectorFromProject(projectId: number): string {
    // Cette méthode devrait récupérer le secteur du projet
    // Pour l'instant, on retourne une valeur par défaut
    return 'SANTE';
  }
}
