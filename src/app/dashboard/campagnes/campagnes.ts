import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { ProjectService } from '../../services/project.service';
import { Campaign, CampaignSummary, CampaignResponse } from '../../interfaces/campaign.interface';
import { ProjectResponse } from '../../interfaces/project.interface';
import { ConfirmationModal } from './confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-campagnes',
  imports: [CommonModule, FormsModule, ConfirmationModal],
  templateUrl: './campagnes.html',
  styleUrl: './campagnes.css'
})
export class Campagnes implements OnInit {
  searchTerm: string = '';
  selectedProject: string = '';
  selectedStatus: string = '';
  showModal: boolean = false;
  showEditModal: boolean = false;
  showEditDonModal: boolean = false;
  showEditBenevolatModal: boolean = false;
  showCampaignModal: boolean = false;
  selectedCampaign: Campaign | null = null;
  isLoading = false;
  errorMessage = '';
  
  // Modal de confirmation
  showConfirmationModal = false;
  confirmationSuccess = true;
  confirmationMessage = '';
  
  // Données du formulaire de modification
  editForm = {
    description: '',
    targetBudget: null as number | null,
    shareOffered: null as number | null,
    targetVolunteer: null as number | null,
    endDate: ''
  };
  
  // Calculs en temps réel
  get m3FundReceives(): string {
    const budget = this.editForm.targetBudget || 0;
    const m3FundAmount = budget * 0.05; // 5% de frais
    return `${m3FundAmount.toLocaleString('fr-FR')} FCFA`;
  }

  get userReceives(): string {
    const budget = this.editForm.targetBudget || 0;
    const m3FundAmount = budget * 0.05; // 5% de frais
    const userAmount = budget - m3FundAmount;
    return `${userAmount.toLocaleString('fr-FR')} FCFA`;
  }

  // Données des cartes de résumé
  summaryCards: CampaignSummary[] = [];

  // Données des campagnes
  campaigns: Campaign[] = [];
  
  // Options pour les filtres
  projectOptions: { value: string, label: string }[] = [
    { value: '', label: 'Tous les projets' }
  ];

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'FINISHED', label: 'Terminée' }
  ];

  constructor(
    private campaignService: CampaignService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadCampaigns();
    this.loadCampaignSummary();
    this.loadProjects();
  }

  // Charger les campagnes depuis le backend
  loadCampaigns() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.campaignService.getCampaigns().subscribe({
      next: (backendCampaigns: CampaignResponse[]) => {
        console.log('Campagnes chargées du backend:', backendCampaigns);
        // Créer un nouveau tableau pour forcer la détection de changement Angular
        const transformedCampaigns = backendCampaigns.map(campaign => 
          this.campaignService.transformCampaignData(campaign)
        );
        // Assigner le nouveau tableau (pas modifier l'ancien)
        this.campaigns = [...transformedCampaigns];
        console.log('Campagnes transformées:', this.campaigns);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des campagnes';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Charger les statistiques des campagnes
  loadCampaignSummary() {
    this.campaignService.getCampaignStats().subscribe({
      next: (stats) => {
        this.summaryCards = this.campaignService.transformStatsToSummary(stats);
        console.log('Statistiques des campagnes chargées:', stats);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Utiliser les données par défaut en cas d'erreur
        this.summaryCards = [
          {
            title: 'Nombre de Campagne',
            value: '0',
            icon: 'fas fa-bullhorn'
          },
          {
            title: 'En Cours',
            value: '0',
            icon: 'fas fa-circle-notch'
          },
          {
            title: 'Non validés',
            value: '0',
            icon: 'fas fa-times'
          },
          {
            title: 'Clôturés',
            value: '0',
            icon: 'fas fa-times-circle'
          }
        ];
      }
    });
  }

  // Charger les projets pour le filtre
  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (projects: ProjectResponse[]) => {
        this.projectOptions = [
          { value: '', label: 'Tous les projets' },
          ...projects.map(project => ({
            value: project.id.toString(),
            label: project.name
          }))
        ];
        console.log('Projets chargés pour les filtres:', this.projectOptions);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
      }
    });
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.campaignService.searchCampaigns(this.searchTerm).subscribe({
        next: (backendCampaigns: CampaignResponse[]) => {
          this.campaigns = backendCampaigns.map(campaign => 
            this.campaignService.transformCampaignData(campaign)
          );
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la recherche';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.loadCampaigns();
    }
  }

  onProjectChange() {
    if (this.selectedProject) {
      const projectId = parseInt(this.selectedProject);
      this.campaignService.filterCampaignsByProject(projectId).subscribe({
        next: (backendCampaigns: CampaignResponse[]) => {
          this.campaigns = backendCampaigns.map(campaign => 
            this.campaignService.transformCampaignData(campaign)
          );
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du filtrage par projet';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.loadCampaigns();
    }
  }

  onStatusChange() {
    if (this.selectedStatus) {
      this.campaignService.filterCampaignsByStatus(this.selectedStatus).subscribe({
        next: (backendCampaigns: CampaignResponse[]) => {
          this.campaigns = backendCampaigns.map(campaign => 
            this.campaignService.transformCampaignData(campaign)
          );
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du filtrage par statut';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.loadCampaigns();
    }
  }

  openCampaignModal(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCampaign = null;
  }

  openEditModal(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.editForm = {
      description: '',
      targetBudget: null,
      shareOffered: null,
      targetVolunteer: null,
      endDate: ''
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedCampaign = null;
    this.editForm = {
      description: '',
      targetBudget: null,
      shareOffered: null,
      targetVolunteer: null,
      endDate: ''
    };
  }

  onSubmitEdit() {
    if (!this.selectedCampaign) return;

    // Préparer les données pour la mise à jour (uniquement les champs modifiés)
    const updateData: any = {
      id: this.selectedCampaign.id
    };

    // Ajouter les champs modifiés
    if (this.editForm.description && this.editForm.description.trim()) {
      updateData.description = this.editForm.description;
    }
    
    if (this.editForm.targetBudget !== null && this.editForm.targetBudget > 0) {
      updateData.targetBudget = this.editForm.targetBudget;
    }
    
    if (this.editForm.shareOffered !== null && this.editForm.shareOffered >= 0) {
      updateData.shareOffered = this.editForm.shareOffered;
    }

    if (this.editForm.endDate) {
      const date = new Date(this.editForm.endDate);
      if (!isNaN(date.getTime())) {
        updateData.endDate = date.toISOString().slice(0, 19);
      }
    }

    // Appeler l'API pour mettre à jour la campagne
    this.campaignService.updateCampaign(updateData).subscribe({
      next: (response) => {
        console.log('Campagne mise à jour avec succès:', response);
        this.confirmationSuccess = true;
        this.confirmationMessage = 'Votre campagne a été modifiée avec succès !';
        this.showConfirmationModal = true;
        this.closeEditModal();
        // Recharger immédiatement
        this.loadCampaigns();
        this.loadCampaignSummary();
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          this.showConfirmationModal = false;
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.confirmationSuccess = false;
        this.confirmationMessage = error.error?.message || 'Une erreur est survenue lors de la modification de la campagne.';
        this.showConfirmationModal = true;
        this.closeEditModal();
      }
    });
  }

  openEditDonModal(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.editForm = {
      description: '',
      targetBudget: null,
      shareOffered: null,
      targetVolunteer: null,
      endDate: ''
    };
    this.showEditDonModal = true;
  }

  closeEditDonModal() {
    this.showEditDonModal = false;
    this.selectedCampaign = null;
    this.editForm = {
      description: '',
      targetBudget: null,
      shareOffered: null,
      targetVolunteer: null,
      endDate: ''
    };
  }

  onSubmitEditDon() {
    if (!this.selectedCampaign) return;

    // Préparer les données pour la mise à jour
    const updateData: any = {
      id: this.selectedCampaign.id
    };

    // Ajouter les champs modifiés
    if (this.editForm.description && this.editForm.description.trim()) {
      updateData.description = this.editForm.description;
    }
    
    if (this.editForm.targetBudget !== null && this.editForm.targetBudget > 0) {
      updateData.targetBudget = this.editForm.targetBudget;
    }

    if (this.editForm.endDate) {
      const date = new Date(this.editForm.endDate);
      if (!isNaN(date.getTime())) {
        updateData.endDate = date.toISOString().slice(0, 19);
      }
    }

    // Appeler l'API pour mettre à jour la campagne
    this.campaignService.updateCampaign(updateData).subscribe({
      next: (response) => {
        console.log('Campagne de don mise à jour avec succès:', response);
        this.confirmationSuccess = true;
        this.confirmationMessage = 'Votre campagne de don a été modifiée avec succès !';
        this.showConfirmationModal = true;
        this.closeEditDonModal();
        // Recharger immédiatement
        this.loadCampaigns();
        this.loadCampaignSummary();
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          this.showConfirmationModal = false;
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.confirmationSuccess = false;
        this.confirmationMessage = error.error?.message || 'Une erreur est survenue lors de la modification de la campagne de don.';
        this.showConfirmationModal = true;
        this.closeEditDonModal();
      }
    });
  }

  openEditBenevolatModal(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.editForm = {
      description: '',
      targetBudget: null,
      shareOffered: null,
      targetVolunteer: null,
      endDate: ''
    };
    this.showEditBenevolatModal = true;
  }

  closeEditBenevolatModal() {
    this.showEditBenevolatModal = false;
    this.selectedCampaign = null;
    this.editForm = {
      description: '',
      targetBudget: null,
      shareOffered: null,
      targetVolunteer: null,
      endDate: ''
    };
  }

  onSubmitEditBenevolat() {
    if (!this.selectedCampaign) return;

    // Préparer les données pour la mise à jour
    const updateData: any = {
      id: this.selectedCampaign.id
    };

    // Ajouter les champs modifiés
    if (this.editForm.description && this.editForm.description.trim()) {
      updateData.description = this.editForm.description;
    }
    
    if (this.editForm.targetVolunteer !== null && this.editForm.targetVolunteer > 0) {
      updateData.targetVolunteer = this.editForm.targetVolunteer;
    }

    if (this.editForm.endDate) {
      const date = new Date(this.editForm.endDate);
      if (!isNaN(date.getTime())) {
        updateData.endDate = date.toISOString().slice(0, 19);
      }
    }

    // Appeler l'API pour mettre à jour la campagne
    this.campaignService.updateCampaign(updateData).subscribe({
      next: (response) => {
        console.log('Campagne de bénévolat mise à jour avec succès:', response);
        this.confirmationSuccess = true;
        this.confirmationMessage = 'Votre campagne de bénévolat a été modifiée avec succès !';
        this.showConfirmationModal = true;
        this.closeEditBenevolatModal();
        // Recharger immédiatement
        this.loadCampaigns();
        this.loadCampaignSummary();
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          this.showConfirmationModal = false;
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.confirmationSuccess = false;
        this.confirmationMessage = error.error?.message || 'Une erreur est survenue lors de la modification de la campagne de bénévolat.';
        this.showConfirmationModal = true;
        this.closeEditBenevolatModal();
      }
    });
  }

  toggleCampaignModal() {
    this.showCampaignModal = !this.showCampaignModal;
  }

  closeCampaignModal() {
    this.showCampaignModal = false;
  }

  selectCampaignType(type: string) {
    console.log('Type de campagne sélectionné:', type);
    this.closeCampaignModal();

    // Navigation vers la page appropriée selon le type
    if (type === 'investissement') {
      // Redirection vers nouvelle campagne investissement
      window.location.href = '/dashboard?view=nouvelle-campagne';
    } else if (type === 'don') {
      // Redirection vers nouvelle campagne don
      window.location.href = '/dashboard?view=nouvelle-campagne-don';
    } else if (type === 'benevolat') {
      // Redirection vers nouvelle campagne bénévolat
      window.location.href = '/dashboard?view=nouvelle-campagne-benevolat';
    }
  }

  // Méthode pour recharger les campagnes
  refreshCampaigns() {
    this.loadCampaigns();
    this.loadCampaignSummary();
  }

  // Méthode pour gérer les erreurs
  clearError() {
    this.errorMessage = '';
  }
  
  // Fermer le modal de confirmation
  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
}
