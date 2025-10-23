import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummary } from '../../interfaces/dashboard.interface';

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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadCampaignStats();
  }

  loadCampaignStats() {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        const summaryCards = this.dashboardService.transformStatsToSummary(stats);
        this.campaignStats = summaryCards.find(card => card.title === 'Total Campagnes') || null;
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
}
