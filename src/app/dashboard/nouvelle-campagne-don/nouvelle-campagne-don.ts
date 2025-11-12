import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { ProjectService } from '../../services/project.service';
import { CampaignCreateRequest, RewardCreateRequest } from '../../interfaces/campaign.interface';
import { ProjectResponse } from '../../interfaces/project.interface';

@Component({
  selector: 'app-nouvelle-campagne-don',
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-campagne-don.html',
  styleUrl: './nouvelle-campagne-don.css'
})
export class NouvelleCampagneDon implements OnInit {
  // Données du formulaire
  selectedProject: string = '';
  targetBudget: string = '';
  targetVolunteer: number = 0;
  startDate: string = '';
  endDate: string = '';
  campaignDescription: string = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Gestion des récompenses
  rewards: RewardCreateRequest[] = [];
  currentReward = {
    name: '',
    description: '',
    type: 'PRODUCT' as 'PRODUCT' | 'SERVICE' | 'EXPERIENCE',
    quantity: 0,
    unlockAmount: 0
  };

  // Options pour les projets (chargées depuis le backend)
  projectOptions: { value: string, label: string }[] = [
    { value: '', label: 'Sélectionner un projet' }
  ];
  
  // Stocker les projets avec leurs dates de fin
  projects: ProjectResponse[] = [];
  selectedProjectData: ProjectResponse | null = null;

  // Options pour les types de récompenses
  rewardTypeOptions = [
    { value: 'PRODUCT', label: 'Produit' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'EXPERIENCE', label: 'Expérience' }
  ];

  constructor(
    private campaignService: CampaignService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadUserProjects();
  }

  // Charger les projets validés de l'utilisateur
  loadUserProjects() {
    this.projectService.getMyValidatedProjects().subscribe({
      next: (projects: ProjectResponse[]) => {
        this.projects = projects;
        this.projectOptions = [
          { value: '', label: 'Sélectionner un projet' },
          ...projects.map(project => ({
            value: project.id.toString(),
            label: project.name
          }))
        ];
        console.log('Projets validés chargés:', projects);
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
  
  // Obtenir la date minimale (aujourd'hui)
  getMinDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Calculs automatiques
  get m3FundReceives(): string {
    const budget = parseFloat(this.targetBudget.replace(/[^\d]/g, '')) || 0;
    const m3FundAmount = (budget * 0.05); // 5% de frais
    return `${m3FundAmount.toLocaleString()} FCFA`;
  }

  get userReceives(): string {
    const budget = parseFloat(this.targetBudget.replace(/[^\d]/g, '')) || 0;
    const m3FundAmount = (budget * 0.05); // 5% de frais
    const userAmount = budget - m3FundAmount;
    return `${userAmount.toLocaleString()} FCFA`;
  }

  // Ajouter une récompense à la liste
  addReward() {
    if (!this.currentReward.name || !this.currentReward.description || 
        this.currentReward.quantity <= 0 || this.currentReward.unlockAmount <= 0) {
      this.errorMessage = 'Veuillez remplir tous les champs de la récompense';
      return;
    }

    this.rewards.push({ ...this.currentReward });
    
    // Réinitialiser le formulaire de récompense
    this.currentReward = {
      name: '',
      description: '',
      type: 'PRODUCT',
      quantity: 0,
      unlockAmount: 0
    };
    this.errorMessage = '';
  }

  // Supprimer une récompense de la liste
  removeReward(index: number) {
    this.rewards.splice(index, 1);
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

    if (!this.targetBudget || parseFloat(this.targetBudget) <= 0) {
      this.errorMessage = 'Veuillez saisir un budget cible valide';
      return;
    }

    // Pour une campagne de don, les récompenses sont obligatoires
    if (!this.rewards || this.rewards.length === 0) {
      this.errorMessage = 'Veuillez ajouter au moins une récompense';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données de la campagne
    // Pour DONATION, le backend attend targetBudget et rewards
    const campaignData: CampaignCreateRequest = {
      endAt: new Date(this.endDate).toISOString(),
      type: 'DONATION',
      targetBudget: parseFloat(this.targetBudget.replace(/[^\d]/g, '')),
      rewards: this.rewards
    };
    
    console.log('Données de la campagne à envoyer:', campaignData);
    console.log('Description de la campagne:', this.campaignDescription);

    // Créer la campagne
    const projectId = parseInt(this.selectedProject);
    this.campaignService.createCampaign(projectId, campaignData).subscribe({
      next: (response) => {
        console.log('Campagne de don créée avec succès:', response);
        this.successMessage = 'Campagne de don créée avec succès !';
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
    this.targetVolunteer = 0;
    this.startDate = '';
    this.endDate = '';
    this.campaignDescription = '';
    this.rewards = [];
    this.currentReward = {
      name: '',
      description: '',
      type: 'PRODUCT',
      quantity: 0,
      unlockAmount: 0
    };
  }
}
