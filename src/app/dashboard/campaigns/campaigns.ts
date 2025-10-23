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
        
        // Vérifier s'il n'y a aucune campagne
        if (stats.totalCampaigns === 0) {
          this.errorMessage = 'Aucune campagne trouvée';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des statistiques';
        this.isLoading = false;
        console.error('Erreur:', error);
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

  refreshStats() {
    this.loadCampaignStats();
  }

  clearError() {
    this.errorMessage = '';
  }

  loadRecentCampaigns() {
    this.campaignService.getCampaigns().subscribe({
      next: (backendCampaigns) => {
        this.campaigns = backendCampaigns.slice(0, 3).map(campaign => 
          this.campaignService.transformCampaignData(campaign)
        );
        this.hasCampaigns = this.campaigns.length > 0;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des campagnes récentes:', error);
        this.hasCampaigns = false;
      }
    });
  }
}
