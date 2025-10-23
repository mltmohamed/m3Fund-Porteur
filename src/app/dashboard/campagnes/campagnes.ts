import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { Campaign, CampaignSummary, CampaignResponse } from '../../interfaces/campaign.interface';

@Component({
  selector: 'app-campagnes',
  imports: [CommonModule, FormsModule],
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

  // Données des cartes de résumé
  summaryCards: CampaignSummary[] = [];

  // Données des campagnes
  campaigns: Campaign[] = [];

  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.loadCampaigns();
    this.loadCampaignSummary();
  }

  // Charger les campagnes depuis le backend
  loadCampaigns() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.campaignService.getCampaigns().subscribe({
      next: (backendCampaigns: CampaignResponse[]) => {
        this.campaigns = backendCampaigns.map(campaign => 
          this.campaignService.transformCampaignData(campaign)
        );
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
    this.campaignService.getCampaignSummary().subscribe({
      next: (backendSummary) => {
        this.summaryCards = this.campaignService.transformSummaryData(backendSummary);
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

  // Données statiques pour les tests (à supprimer après intégration)
  staticCampaigns = [
    {
      title: 'Plateforme de télémédecine',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch',
      type: 'Don',
      typeIcon: 'fas fa-dollar-sign',
      endDate: '09/12/2025',
      // Données détaillées pour le modal
      creationDate: '13/10/2025',
      statusDetail: 'EN COURS',
      collaboratorCount: '21',
      campaignCount: '02',
      campaignSummary: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      targetBudget: '2,500,000,000 FCFA',
      shareOffered: '2%',
      netValue: '500,000,000,000 FCFA',
      fundsRaised: '250,000 FCFA',
      campaignDescription: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    },
    {
      title: 'Construction d\'une Ecole',
      funds: '50,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '01 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch',
      type: 'Don',
      typeIcon: 'fas fa-dollar-sign',
      endDate: '31/12/2025',
      // Données détaillées pour le modal
      creationDate: '15/09/2025',
      statusDetail: 'EN COURS',
      collaboratorCount: '01',
      campaignCount: '01',
      campaignSummary: 'Construction d\'une école avec dispositifs intégrés pour le suivi pédagogique administratif des élèves.',
      targetBudget: '1,500,000,000 FCFA',
      shareOffered: '5%',
      netValue: '300,000,000,000 FCFA',
      fundsRaised: '50,000 FCFA',
      campaignDescription: 'Construction d\'une école moderne avec dispositifs intégrés pour le suivi pédagogique et administratif des élèves. Ce projet vise à améliorer l\'éducation dans la région.'
    },
    {
      title: 'Plateforme de télémédecine',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch',
      type: 'Don',
      typeIcon: 'fas fa-dollar-sign',
      endDate: '09/12/2025',
      // Données détaillées pour le modal
      creationDate: '13/10/2025',
      statusDetail: 'EN COURS',
      collaboratorCount: '21',
      campaignCount: '02',
      campaignSummary: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      targetBudget: '2,500,000,000 FCFA',
      shareOffered: '2%',
      netValue: '500,000,000,000 FCFA',
      fundsRaised: '250,000 FCFA',
      campaignDescription: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    },
    {
      title: 'Plateforme de télémédecine',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch',
      type: 'Don',
      typeIcon: 'fas fa-dollar-sign',
      endDate: '09/12/2025',
      // Données détaillées pour le modal
      creationDate: '13/10/2025',
      statusDetail: 'EN COURS',
      collaboratorCount: '21',
      campaignCount: '02',
      campaignSummary: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      targetBudget: '2,500,000,000 FCFA',
      shareOffered: '2%',
      netValue: '500,000,000,000 FCFA',
      fundsRaised: '250,000 FCFA',
      campaignDescription: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    },
    {
      title: 'Plateforme de télémédecine',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch',
      type: 'Don',
      typeIcon: 'fas fa-dollar-sign',
      endDate: '09/12/2025',
      // Données détaillées pour le modal
      creationDate: '13/10/2025',
      statusDetail: 'EN COURS',
      collaboratorCount: '21',
      campaignCount: '02',
      campaignSummary: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      targetBudget: '2,500,000,000 FCFA',
      shareOffered: '2%',
      netValue: '500,000,000,000 FCFA',
      fundsRaised: '250,000 FCFA',
      campaignDescription: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    },
    {
      title: 'Plateforme de télémédecine',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch',
      type: 'Don',
      typeIcon: 'fas fa-dollar-sign',
      endDate: '09/12/2025',
      // Données détaillées pour le modal
      creationDate: '13/10/2025',
      statusDetail: 'EN COURS',
      collaboratorCount: '21',
      campaignCount: '02',
      campaignSummary: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      targetBudget: '2,500,000,000 FCFA',
      shareOffered: '2%',
      netValue: '500,000,000,000 FCFA',
      fundsRaised: '250,000 FCFA',
      campaignDescription: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    }
  ];

  projectOptions = [
    { value: '', label: 'Tous les projets' },
    { value: 'plateforme-telemedecine', label: 'Plateforme de Télémédecine' },
    { value: 'construction-ecole', label: 'Construction d\'une Ecole' },
    { value: 'plateforme-ecommerce', label: 'Plateforme E-commerce' },
    { value: 'application-mobile', label: 'Application Mobile' }
  ];

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'en-cours', label: 'En cours' },
    { value: 'valide', label: 'Validé' },
    { value: 'non-valide', label: 'Non validé' },
    { value: 'cloture', label: 'Clôturé' }
  ];

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
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedCampaign = null;
  }

  onSubmitEdit() {
    if (this.selectedCampaign) {
      // Ici vous pouvez implémenter la logique de mise à jour
      console.log('Modification soumise pour:', this.selectedCampaign);
      this.closeEditModal();
    }
  }

  openEditDonModal(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.showEditDonModal = true;
  }

  closeEditDonModal() {
    this.showEditDonModal = false;
    this.selectedCampaign = null;
  }

  onSubmitEditDon() {
    if (this.selectedCampaign) {
      console.log('Modification campagne don soumise pour:', this.selectedCampaign);
      this.closeEditDonModal();
    }
  }

  openEditBenevolatModal(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.showEditBenevolatModal = true;
  }

  closeEditBenevolatModal() {
    this.showEditBenevolatModal = false;
    this.selectedCampaign = null;
  }

  onSubmitEditBenevolat() {
    if (this.selectedCampaign) {
      console.log('Modification campagne bénévolat soumise pour:', this.selectedCampaign);
      this.closeEditBenevolatModal();
    }
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
}
