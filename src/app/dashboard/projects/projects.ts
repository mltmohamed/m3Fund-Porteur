import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { ProjectService } from '../../services/project.service';
import { DashboardSummary } from '../../interfaces/dashboard.interface';
import { Project } from '../../interfaces/project.interface';

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
  projects: Project[] = [];
  hasProjects = false;

  constructor(
    private dashboardService: DashboardService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadProjectStats();
    this.loadRecentProjects();
  }

  loadProjectStats() {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        const summaryCards = this.dashboardService.transformStatsToSummary(stats);
        this.projectStats = summaryCards.find(card => card.title === 'Total Projets') || null;
        
        // Vérifier s'il n'y a aucun projet
        if (stats.totalProjects === 0) {
          this.errorMessage = 'Aucun projet trouvé';
        }
        
        this.isLoading = false;
        console.log('Statistiques des projets chargées:', stats);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.errorMessage = 'Erreur lors du chargement des statistiques';
        this.isLoading = false;
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

  clearError() {
    this.errorMessage = '';
  }

  loadRecentProjects() {
    this.projectService.getProjects().subscribe({
      next: (backendProjects) => {
        this.projects = backendProjects.slice(0, 2).map(project => 
          this.projectService.transformProjectData(project)
        );
        this.hasProjects = this.projects.length > 0;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets récents:', error);
        this.hasProjects = false;
      }
    });
  }
}
