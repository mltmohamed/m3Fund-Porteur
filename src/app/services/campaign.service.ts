import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Campaign, 
  CampaignSummary, 
  CampaignCreateRequest, 
  CampaignUpdateRequest, 
  CampaignResponse 
} from '../interfaces/campaign.interface';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private readonly API_URL = 'http://localhost:7878/api/v1';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les campagnes
  getCampaigns(): Observable<CampaignResponse[]> {
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/public/campaigns`);
  }

  // Récupérer une campagne par ID
  getCampaignById(id: number): Observable<CampaignResponse> {
    return this.http.get<CampaignResponse>(`${this.API_URL}/campaigns/${id}`);
  }

  // Créer une nouvelle campagne
  createCampaign(campaignData: CampaignCreateRequest): Observable<CampaignResponse> {
    return this.http.post<CampaignResponse>(`${this.API_URL}/campaigns`, campaignData);
  }

  // Mettre à jour une campagne
  updateCampaign(campaignData: CampaignUpdateRequest): Observable<CampaignResponse> {
    return this.http.put<CampaignResponse>(`${this.API_URL}/campaigns/${campaignData.id}`, campaignData);
  }

  // Supprimer une campagne
  deleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/campaigns/${id}`);
  }

  // Récupérer les statistiques des campagnes
  getCampaignSummary(): Observable<CampaignSummary[]> {
    return this.http.get<CampaignSummary[]>(`${this.API_URL}/campaigns/summary`);
  }

  // Rechercher des campagnes
  searchCampaigns(searchTerm: string): Observable<CampaignResponse[]> {
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/campaigns/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Filtrer les campagnes par projet
  filterCampaignsByProject(projectId: number): Observable<CampaignResponse[]> {
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/campaigns/project/${projectId}`);
  }

  // Filtrer les campagnes par statut
  filterCampaignsByStatus(status: string): Observable<CampaignResponse[]> {
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/campaigns/status/${status}`);
  }

  // Filtrer les campagnes par type
  filterCampaignsByType(type: string): Observable<CampaignResponse[]> {
    return this.http.get<CampaignResponse[]>(`${this.API_URL}/campaigns/type/${type}`);
  }

  // Transformer les données du backend en format frontend
  transformCampaignData(backendCampaign: CampaignResponse): Campaign {
    return {
      id: backendCampaign.id,
      title: backendCampaign.title,
      funds: `${backendCampaign.fundsRaised.toLocaleString()} FCFA récoltés`,
      sector: this.getSectorFromProject(backendCampaign.projectId), // À adapter selon votre logique
      collaborators: `${backendCampaign.collaboratorCount} Collaborateurs`,
      progress: backendCampaign.progress,
      status: this.getStatusLabel(backendCampaign.status),
      statusIcon: this.getStatusIcon(backendCampaign.status),
      type: this.getCampaignTypeLabel(backendCampaign.campaignType),
      typeIcon: this.getCampaignTypeIcon(backendCampaign.campaignType),
      endDate: new Date(backendCampaign.endDate).toLocaleDateString('fr-FR'),
      creationDate: new Date(backendCampaign.createdAt).toLocaleDateString('fr-FR'),
      statusDetail: backendCampaign.status.toUpperCase(),
      collaboratorCount: backendCampaign.collaboratorCount.toString(),
      campaignCount: backendCampaign.campaignCount.toString(),
      campaignSummary: backendCampaign.description,
      targetBudget: `${backendCampaign.targetBudget.toLocaleString()} FCFA`,
      shareOffered: `${backendCampaign.shareOffered}%`,
      netValue: `${backendCampaign.netValue.toLocaleString()} FCFA`,
      fundsRaised: `${backendCampaign.fundsRaised.toLocaleString()} FCFA`,
      campaignDescription: backendCampaign.description
    };
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

  private getCampaignTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'INVESTMENT': 'Investissement',
      'DONATION': 'Don',
      'VOLUNTEER': 'Bénévolat'
    };
    return typeMap[type] || type;
  }

  private getCampaignTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'INVESTMENT': 'fas fa-chart-line',
      'DONATION': 'fas fa-dollar-sign',
      'VOLUNTEER': 'fas fa-hands-helping'
    };
    return iconMap[type] || 'fas fa-question';
  }

  private getSectorFromProject(projectId: number): string {
    // Cette méthode devrait récupérer le secteur du projet
    // Pour l'instant, on retourne une valeur par défaut
    return 'SANTE';
  }
}
