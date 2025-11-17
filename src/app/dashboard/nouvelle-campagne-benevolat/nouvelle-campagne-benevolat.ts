import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { ProjectService } from '../../services/project.service';
import { ProfileService } from '../../services/profile.service';
import { CampaignCreateRequest } from '../../interfaces/campaign.interface';
import { ProjectResponse } from '../../interfaces/project.interface';

@Component({
  selector: 'app-nouvelle-campagne-benevolat',
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-campagne-benevolat.html',
  styleUrl: './nouvelle-campagne-benevolat.css'
})
export class NouvelleCampagneBenevolat implements OnInit {
  // Données du formulaire
  selectedProject: string = '';
  targetVolunteer: number = 0;
  startDate: string = '';
  endDate: string = '';
  campaignDescription: string = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Statut de vérification de l'utilisateur
  isUserVerified = true;

  // Options pour les projets (chargées depuis le backend)
  projectOptions: { value: string, label: string }[] = [
    { value: '', label: 'Sélectionner un projet' }
  ];
  
  // Stocker les projets avec leurs dates de fin
  projects: ProjectResponse[] = [];
  selectedProjectData: ProjectResponse | null = null;

  constructor(
    private campaignService: CampaignService,
    private projectService: ProjectService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.loadUserProjects();
    // Vérifier le statut de vérification de l'utilisateur
    // this.checkUserVerificationStatus();
  }

  // Vérifier le statut de vérification de l'utilisateur
  checkUserVerificationStatus() {
    this.profileService.getCurrentProfile().subscribe({
      next: (profile) => {
        const userProfile = this.profileService.transformProfileData(profile);
        this.isUserVerified = this.profileService.isUserVerified(userProfile);
        
        if (!this.isUserVerified) {
          this.errorMessage = 'Votre compte n\'est pas encore vérifié. Vous devez être vérifié par un administrateur avant de pouvoir créer des campagnes.';
        }
      },
      error: (error) => {
        console.error('Erreur lors de la vérification du statut:', error);
        // En cas d'erreur, considérer comme non vérifié par sécurité
        this.isUserVerified = false;
        this.errorMessage = 'Impossible de vérifier votre statut. Veuillez réessayer plus tard.';
      }
    });
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

  onSubmit() {
    // Vérifier si l'utilisateur est vérifié
    if (!this.isUserVerified) {
      this.errorMessage = 'Votre compte n\'est pas encore vérifié. Vous devez être vérifié par un administrateur avant de pouvoir créer des campagnes.';
      return;
    }
    
    if (!this.selectedProject) {
      this.errorMessage = 'Veuillez sélectionner un projet';
      return;
    }

    if (!this.endDate) {
      this.errorMessage = 'Veuillez sélectionner une date de fin';
      return;
    }

    if (!this.targetVolunteer || this.targetVolunteer <= 0) {
      this.errorMessage = 'Veuillez saisir un nombre de bénévoles recherchés';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données de la campagne
    // Pour VOLUNTEERING, le backend attend targetVolunteer et peut recevoir une description
    const campaignData: CampaignCreateRequest = {
      endAt: new Date(this.endDate).toISOString(),
      type: 'VOLUNTEERING',
      targetVolunteer: this.targetVolunteer,
      description: this.campaignDescription?.trim() || undefined
    };

    // Créer la campagne
    const projectId = parseInt(this.selectedProject);
    this.campaignService.createCampaign(projectId, campaignData).subscribe({
      next: (response) => {
        console.log('Campagne de bénévolat créée avec succès:', response);
        this.successMessage = 'Campagne de bénévolat créée avec succès !';
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

  clearError() {
    this.errorMessage = '';
  }

  resetForm() {
    this.selectedProject = '';
    this.targetVolunteer = 0;
    this.startDate = '';
    this.endDate = '';
    this.campaignDescription = '';
  }
}
