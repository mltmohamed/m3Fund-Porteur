import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummary } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects implements OnInit {
  @Output() viewChange = new EventEmitter<string>();
  
  isLoading = false;
  errorMessage = '';
  projectStats: DashboardSummary | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadProjectStats();
  }

  loadProjectStats() {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        const summaryCards = this.dashboardService.transformStatsToSummary(stats);
        this.projectStats = summaryCards.find(card => card.title === 'Total Projets') || null;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des statistiques';
        this.isLoading = false;
        console.error('Erreur:', error);
        // Utiliser les données par défaut
        this.projectStats = {
          title: 'Total Projets',
          value: '0',
          icon: 'fas fa-project-diagram',
          color: '#3B82F6'
        };
      }
    });
  }

  goToProjects() {
    this.viewChange.emit('projet');
  }

  refreshStats() {
    this.loadProjectStats();
  }
}
