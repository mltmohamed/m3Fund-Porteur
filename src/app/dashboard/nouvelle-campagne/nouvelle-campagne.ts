import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { ProjectService } from '../../services/project.service';
import { CampaignCreateRequest, RewardCreateRequest } from '../../interfaces/campaign.interface';
import { ProjectResponse } from '../../interfaces/project.interface';

@Component({
  selector: 'app-nouvelle-campagne',
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-campagne.html',
  styleUrl: './nouvelle-campagne.css'
})
export class NouvelleCampagne implements OnInit {
  // Données du formulaire
  selectedProject: string = '';
  targetBudget: string = '';
  shareOffered: string = '';
  startDate: string = '';
  endDate: string = '';
  campaignDescription: string = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Options pour les projets (chargées depuis le backend)
  projectOptions: { value: string, label: string }[] = [
    { value: '', label: 'Sélectionner un projet' }
  ];
  
  // Stocker les projets avec leurs dates de fin
  projects: ProjectResponse[] = [];
  selectedProjectData: ProjectResponse | null = null;

  constructor(
    private campaignService: CampaignService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadUserProjects();
  }

  // Charger les projets validés de l'utilisateur (exclure les projets expirés)
  loadUserProjects() {
    this.projectService.getMyValidatedProjects().subscribe({
      next: (projects: ProjectResponse[]) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        // Filtrer les projets non expirés
        const activeProjects = projects.filter(project => {
          if (!project.launchedAt) return true;
          const projectEndDate = new Date(project.launchedAt);
          projectEndDate.setHours(0, 0, 0, 0);
          return projectEndDate >= now;
        });
        
        this.projects = activeProjects;
        this.projectOptions = [
          { value: '', label: 'Sélectionner un projet' },
          ...activeProjects.map(project => ({
            value: project.id.toString(),
            label: project.name
          }))
        ];
        console.log('Projets validés chargés:', activeProjects);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.errorMessage = 'Impossible de charger vos projets validés';
      }
    });
  }
  
  // Gérer le changement de projet sélectionné
  onProjectChange() {
    if (this.selectedProject) {
      this.selectedProjectData = this.projects.find(p => p.id.toString() === this.selectedProject) || null;
    } else {
      this.selectedProjectData = null;
    }
  }
  
  // Obtenir la date maximale pour la campagne (date de fin du projet)
  getMaxCampaignDate(): string {
    if (!this.selectedProjectData || !this.selectedProjectData.launchedAt) {
      return '';
    }
    const projectEndDate = new Date(this.selectedProjectData.launchedAt);
    const year = projectEndDate.getFullYear();
    const month = String(projectEndDate.getMonth() + 1).padStart(2, '0');
    const day = String(projectEndDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Obtenir la date minimale (aujourd'hui)
  getMinDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Valider que la date de fin de campagne ne dépasse pas la date de fin du projet
  validateCampaignDate() {
    if (this.endDate && this.selectedProjectData && this.selectedProjectData.launchedAt) {
      const campaignEndDate = new Date(this.endDate);
      const projectEndDate = new Date(this.selectedProjectData.launchedAt);
      campaignEndDate.setHours(0, 0, 0, 0);
      projectEndDate.setHours(0, 0, 0, 0);
      
      if (campaignEndDate > projectEndDate) {
        this.errorMessage = `La date de fin de la campagne ne peut pas être supérieure à la date de fin du projet (${projectEndDate.toLocaleDateString('fr-FR')}).`;
        this.endDate = '';
        return false;
      }
    }
    // Réinitialiser l'erreur si la date est valide
    if (this.errorMessage && this.errorMessage.includes('date de fin')) {
      this.errorMessage = '';
    }
    return true;
  }

  // Calculs automatiques
  get m3FundReceives(): string {
    const budget = parseFloat(this.targetBudget.replace(/[^\d]/g, '')) || 0;
    const share = parseFloat(this.shareOffered) || 0;
    const m3FundAmount = (budget * share / 100);
    return `${m3FundAmount.toLocaleString()} FCFA`;
  }

  get userReceives(): string {
    const budget = parseFloat(this.targetBudget.replace(/[^\d]/g, '')) || 0;
    const share = parseFloat(this.shareOffered) || 0;
    const m3FundAmount = (budget * share / 100);
    const userAmount = budget - m3FundAmount;
    return `${userAmount.toLocaleString()} FCFA`;
  }

  onSubmit() {
    if (!this.selectedProject) {
      this.errorMessage = 'Veuillez sélectionner un projet';
      return;
    }

    if (!this.endDate) {
      this.errorMessage = 'Veuillez sélectionner une date de fin';
      return;
    }
    
    // Valider que la date de fin de campagne ne dépasse pas la date de fin du projet
    if (!this.validateCampaignDate()) {
      return;
    }
    
    // Validation supplémentaire avant soumission
    if (this.selectedProjectData && this.selectedProjectData.launchedAt) {
      const campaignEndDate = new Date(this.endDate);
      const projectEndDate = new Date(this.selectedProjectData.launchedAt);
      campaignEndDate.setHours(0, 0, 0, 0);
      projectEndDate.setHours(0, 0, 0, 0);
      
      if (campaignEndDate > projectEndDate) {
        this.errorMessage = `La date de fin de la campagne ne peut pas être supérieure à la date de fin du projet (${projectEndDate.toLocaleDateString('fr-FR')}).`;
        return;
      }
    }

    if (!this.targetBudget || parseFloat(this.targetBudget) <= 0) {
      this.errorMessage = 'Veuillez saisir un budget cible valide';
      return;
    }

    if (!this.shareOffered || parseFloat(this.shareOffered) <= 0 || parseFloat(this.shareOffered) > 100) {
      this.errorMessage = 'Veuillez saisir un pourcentage de parts offert valide (1-100)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données de la campagne
    const campaignData: CampaignCreateRequest = {
      endAt: new Date(this.endDate).toISOString(),
      type: 'INVESTMENT',
      description: this.campaignDescription,
      targetBudget: parseFloat(this.targetBudget.replace(/[^\d]/g, '')),
      shareOffered: parseFloat(this.shareOffered)
    };

    // Créer la campagne
    const projectId = parseInt(this.selectedProject);
    this.campaignService.createCampaign(projectId, campaignData).subscribe({
      next: (response) => {
        console.log('Campagne créée avec succès:', response);
        this.successMessage = 'Campagne d\'investissement créée avec succès !';
        this.isLoading = false;
        
        // Réinitialiser le formulaire
        this.resetForm();
        
        // Rediriger vers la page des campagnes après 2 secondes
        setTimeout(() => {
          window.location.href = '/dashboard?view=campagnes';
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de la création de la campagne:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création de la campagne';
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.selectedProject = '';
    this.targetBudget = '';
    this.shareOffered = '';
    this.startDate = '';
    this.endDate = '';
    this.campaignDescription = '';
  }
}

