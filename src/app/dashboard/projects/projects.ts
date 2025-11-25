import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { ProjectService } from '../../services/project.service';
import { CampaignService } from '../../services/campaign.service';
import { DashboardSummary } from '../../interfaces/dashboard.interface';
import { Project } from '../../interfaces/project.interface';
import { forkJoin } from 'rxjs';

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
    private projectService: ProjectService,
    private campaignService: CampaignService
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

        // Ne pas afficher de message d'erreur si aucun projet, on affichera le bouton de création
        // if (stats.activeProjects === 0) {
        //   this.errorMessage = 'Aucun projet validé pour l\'instant';
        // }
        
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

  createNewProject() {
    this.viewChange.emit('nouveau-projet');
  }

  refreshStats() {
    this.loadProjectStats();
  }

  clearError() {
    this.errorMessage = '';
  }

  loadRecentProjects() {
    // Utiliser getMyProjects() pour récupérer uniquement les projets du porteur connecté
    // et getMyCampaigns() pour récupérer les campagnes, puis calculer les fonds récoltés
    forkJoin({
      projects: this.projectService.getMyProjects(),
      campaigns: this.campaignService.getMyCampaigns()
    }).subscribe({
      next: ({ projects: backendProjects, campaigns: backendCampaigns }) => {
        const validatedProjects = backendProjects.filter(project => project.isValidated);
        
        // Transformer les projets et enrichir avec les données des campagnes
        this.projects = validatedProjects.slice(0, 2).map(project => {
          const transformedProject = this.projectService.transformProjectData(project);
          
          // Filtrer les campagnes de ce projet
          const projectCampaigns = backendCampaigns.filter(
            campaign => {
              // Le backend peut retourner projectId directement ou via projectResponse.id
              const campaignProjectId = campaign.projectId || campaign.projectResponse?.id;
              return campaignProjectId === project.id;
            }
          );
          
          // Calculer les fonds récoltés totaux
          const totalFundsRaised = projectCampaigns.reduce(
            (sum, campaign) => sum + (campaign.currentFund || campaign.fundsRaised || 0), 
            0
          );
          
          // Mettre à jour les fonds récoltés dans le projet transformé
          transformedProject.funds = `${totalFundsRaised.toLocaleString('fr-FR')} FCFA récoltés`;
          transformedProject.fundsRaised = `${totalFundsRaised.toLocaleString('fr-FR')} FCFA`;
          
          // Calculer le nombre de collaborateurs (réel)
          // Compter le nombre de campagnes avec des fonds récoltés
          // Chaque campagne avec des fonds représente au moins un contributeur unique
          const campaignsWuthContributions = projectCampaigns.filter(
            campaign => (campaign.currentFund || campaign.fundsRaised || 0) > 0
          );
          
          const totalCollaborators = campaignsWuthContributions.length;
          
          transformedProject.collaborators = `${totalCollaborators} Collaborateurs`;
          transformedProject.collaboratorCount = totalCollaborators.toString();
          
          // Calculer le nombre de campagnes
          transformedProject.campaignCount = projectCampaigns.length.toString();
          
          return transformedProject;
        });
        
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