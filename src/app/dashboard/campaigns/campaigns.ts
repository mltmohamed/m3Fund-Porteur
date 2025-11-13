import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { CampaignService } from '../../services/campaign.service';
import { DashboardSummary } from '../../interfaces/dashboard.interface';
import { Campaign } from '../../interfaces/campaign.interface';

@Component({
  selector: 'app-campaigns',
  imports: [CommonModule],
  templateUrl: './campaigns.html',
  styleUrl: './campaigns.css'
})
export class Campaigns implements OnInit {
  @Output() viewChange = new EventEmitter<string>();
  
  isLoading = false;
  errorMessage = '';
  campaignStats: DashboardSummary | null = null;
  campaigns: Campaign[] = [];
  hasCampaigns = false;

  constructor(
    private dashboardService: DashboardService,
    private campaignService: CampaignService
  ) {}

  ngOnInit() {
    this.loadCampaignStats();
    this.loadRecentCampaigns();
  }

  loadCampaignStats() {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        const summaryCards = this.dashboardService.transformStatsToSummary(stats);
        this.campaignStats = summaryCards.find(card => card.title === 'Total Campagnes') || null;
        
        // Ne pas afficher de message d'erreur si aucune campagne, on affichera le bouton de création
        // if (stats.totalCampaigns === 0) {
        //   this.errorMessage = 'Aucune campagne trouvée';
        // }
        
        this.isLoading = false;
        console.log('Statistiques des campagnes chargées:', stats);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.errorMessage = 'Erreur lors du chargement des statistiques';
        this.isLoading = false;
        // Utiliser les données par défaut
        this.campaignStats = {
          title: 'Total Campagnes',
          value: '0',
          icon: 'fas fa-bullhorn',
          color: '#10B981'
        };
      }
    });
  }

  goToCampaigns() {
    this.viewChange.emit('campagnes');
  }

  createNewCampaign() {
    this.viewChange.emit('nouvelle-campagne');
  }

  refreshStats() {
    this.loadCampaignStats();
  }

  clearError() {
    this.errorMessage = '';
  }

  loadRecentCampaigns() {
    // Utiliser getMyCampaigns() pour récupérer uniquement les campagnes de l'utilisateur connecté
    this.campaignService.getMyCampaigns().subscribe({
      next: (backendCampaigns) => {
        // Filtrer uniquement les campagnes en cours (IN_PROGRESS) et prendre les 3 plus récentes
        const activeCampaigns = backendCampaigns
          .filter(campaign => {
            const state = campaign.state || campaign.status;
            return state === 'IN_PROGRESS';
          })
          .slice(0, 3);
        
        this.campaigns = activeCampaigns.map(campaign => 
          this.campaignService.transformCampaignData(campaign)
        );
        this.hasCampaigns = this.campaigns.length > 0;
        console.log('Mes campagnes en cours chargées:', this.campaigns);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des campagnes:', error);
        this.hasCampaigns = false;
        this.campaigns = [];
      }
    });
  }
}
