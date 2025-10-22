import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-campagnes',
  imports: [CommonModule, FormsModule],
  templateUrl: './campagnes.html',
  styleUrl: './campagnes.css'
})
export class Campagnes {
  searchTerm: string = '';
  selectedProject: string = '';
  selectedStatus: string = '';
  showModal: boolean = false;
  showEditModal: boolean = false;
  showEditDonModal: boolean = false;
  showEditBenevolatModal: boolean = false;
  showCampaignModal: boolean = false;
  selectedCampaign: any = null;

  // Données des cartes de résumé
  summaryCards = [
    {
      title: 'Nombre de Campagne',
      value: '09',
      icon: 'fas fa-bullhorn'
    },
    {
      title: 'En Cours',
      value: '06',
      icon: 'fas fa-circle-notch'
    },
    {
      title: 'Non validés',
      value: '02',
      icon: 'fas fa-times'
    },
    {
      title: 'Clôturés',
      value: '01',
      icon: 'fas fa-times-circle'
    }
  ];

  // Données des campagnes
  campaigns = [
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
    console.log('Recherche:', this.searchTerm);
  }

  onProjectChange() {
    console.log('Projet sélectionné:', this.selectedProject);
  }

  onStatusChange() {
    console.log('Statut sélectionné:', this.selectedStatus);
  }

  openCampaignModal(campaign: any) {
    this.selectedCampaign = campaign;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCampaign = null;
  }

  openEditModal(campaign: any) {
    this.selectedCampaign = campaign;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedCampaign = null;
  }

  onSubmitEdit() {
    console.log('Modification soumise pour:', this.selectedCampaign);
    this.closeEditModal();
  }

  openEditDonModal(campaign: any) {
    this.selectedCampaign = campaign;
    this.showEditDonModal = true;
  }

  closeEditDonModal() {
    this.showEditDonModal = false;
    this.selectedCampaign = null;
  }

  onSubmitEditDon() {
    console.log('Modification campagne don soumise pour:', this.selectedCampaign);
    this.closeEditDonModal();
  }

  openEditBenevolatModal(campaign: any) {
    this.selectedCampaign = campaign;
    this.showEditBenevolatModal = true;
  }

  closeEditBenevolatModal() {
    this.showEditBenevolatModal = false;
    this.selectedCampaign = null;
  }

  onSubmitEditBenevolat() {
    console.log('Modification campagne bénévolat soumise pour:', this.selectedCampaign);
    this.closeEditBenevolatModal();
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
}
