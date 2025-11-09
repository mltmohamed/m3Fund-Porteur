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
  currentImageIndex: { [key: number]: number } = {};

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
        this.projectStats = {
          title: 'Projets actifs',
          value: stats.activeProjects.toString(),
          icon: 'fas fa-check-circle',
          color: '#10B981'
        };

        // Vérifier s'il n'y a aucun projet validé
        if (stats.activeProjects === 0) {
          this.errorMessage = 'Aucun projet validé pour l\'instant';
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
    // Utiliser getMyProjects() pour récupérer uniquement les projets du porteur connecté
    // et filtrer pour ne garder que les projets validés
    this.projectService.getMyProjects().subscribe({
      next: (backendProjects) => {
        const validatedProjects = backendProjects.filter(project => project.isValidated);
        this.projects = validatedProjects.slice(0, 2).map(project => 
          this.projectService.transformProjectData(project)
        );
        this.hasProjects = this.projects.length > 0;
        // Initialiser l'index du carousel pour chaque projet
        this.projects.forEach((project, index) => {
          this.currentImageIndex[project.id] = 0;
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets récents:', error);
        this.hasProjects = false;
      }
    });
  }

  getCurrentImage(project: Project): string {
    const index = this.currentImageIndex[project.id] || 0;
    return project.images[index] || project.images[0] || '';
  }

  nextImage(project: Project) {
    if (!this.currentImageIndex[project.id]) {
      this.currentImageIndex[project.id] = 0;
    }
    this.currentImageIndex[project.id] = (this.currentImageIndex[project.id] + 1) % project.images.length;
  }

  prevImage(project: Project) {
    if (!this.currentImageIndex[project.id]) {
      this.currentImageIndex[project.id] = 0;
    }
    this.currentImageIndex[project.id] = this.currentImageIndex[project.id] === 0 
      ? project.images.length - 1 
      : this.currentImageIndex[project.id] - 1;
  }

  goToImage(project: Project, index: number) {
    this.currentImageIndex[project.id] = index;
  }
}
