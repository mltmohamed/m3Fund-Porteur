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
    // Utiliser getCampaigns() pour récupérer les campagnes validées et en cours (IN_PROGRESS) du dashboard public
    // Ces campagnes sont déjà filtrées côté backend pour ne retourner que les campagnes validées
    this.campaignService.getCampaigns().subscribe({
      next: (backendCampaigns) => {
        // Prendre les 3 campagnes les plus récentes
        this.campaigns = backendCampaigns.slice(0, 3).map(campaign => 
          this.campaignService.transformCampaignData(campaign)
        );
        this.hasCampaigns = this.campaigns.length > 0;
        console.log('Campagnes validées et en cours chargées:', this.campaigns);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des campagnes:', error);
        this.hasCampaigns = false;
      }
    });
  }
}
