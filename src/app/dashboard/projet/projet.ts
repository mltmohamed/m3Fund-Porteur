import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projet',
  imports: [CommonModule, FormsModule],
  templateUrl: './projet.html',
  styleUrl: './projet.css'
})
export class Projet {
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedSector: string = '';
  showModal: boolean = false;
  showEditModal: boolean = false;
  selectedProject: any = null;

  // Données des cartes de résumé
  summaryCards = [
    {
      title: 'Nombre de projets',
      value: '09',
      icon: 'fas fa-bars'
    },
    {
      title: 'En Cours',
      value: '03',
      icon: 'fas fa-circle-notch'
    },
    {
      title: 'Non validés',
      value: '05',
      icon: 'fas fa-times'
    },
    {
      title: 'Clôturés',
      value: '01',
      icon: 'fas fa-times-circle'
    }
  ];

  // Données des projets
  projects = [
    {
      title: 'Plateforme de télémédecine',
      description: 'Application mobile pour consultations médicales à distance avec suivi des patients.',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch',
      // Données détaillées pour le modal
      creationDate: '13/10/2025',
      statusDetail: 'EN COURS',
      collaboratorCount: '31',
      campaignCount: '02',
      projectSummary: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      targetBudget: '2,500,000,000 FCFA',
      shareOffered: '2%',
      netValue: '500,000,000,000 FCFA',
      fundsRaised: '10,000,000 FCFA',
      projectDescription: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    },
    {
      title: 'Construction d\'une Ecole',
      description: 'Construction d\'une école avec dispositifs intégrés pour le suivi pédagogique administratif des élèves.',
      funds: '0 FCFA récoltés',
      sector: 'Education',
      collaborators: '0 Collaborateurs',
      progress: 0,
      status: 'validé',
      statusIcon: 'fas fa-check',
      // Données détaillées pour le modal
      creationDate: '15/09/2025',
      statusDetail: 'VALIDÉ',
      collaboratorCount: '0',
      campaignCount: '01',
      projectSummary: 'Construction d\'une école avec dispositifs intégrés pour le suivi pédagogique administratif des élèves.',
      targetBudget: '1,500,000,000 FCFA',
      shareOffered: '5%',
      netValue: '300,000,000,000 FCFA',
      fundsRaised: '0 FCFA',
      projectDescription: 'Construction d\'une école moderne avec dispositifs intégrés pour le suivi pédagogique et administratif des élèves. Ce projet vise à améliorer l\'éducation dans la région.'
    },
    {
      title: 'Plateforme de télémédecine',
      description: 'Application mobile pour consultations médicales à distance avec suivi des patients.',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch',
      // Données détaillées pour le modal
      creationDate: '13/10/2025',
      statusDetail: 'EN COURS',
      collaboratorCount: '31',
      campaignCount: '02',
      projectSummary: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      targetBudget: '2,500,000,000 FCFA',
      shareOffered: '2%',
      netValue: '500,000,000,000 FCFA',
      fundsRaised: '10,000,000 FCFA',
      projectDescription: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    },
    {
      title: 'Plateforme de télémédecine',
      description: 'Application mobile pour consultations médicales à distance avec suivi des patients.',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch',
      // Données détaillées pour le modal
      creationDate: '13/10/2025',
      statusDetail: 'EN COURS',
      collaboratorCount: '31',
      campaignCount: '02',
      projectSummary: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      targetBudget: '2,500,000,000 FCFA',
      shareOffered: '2%',
      netValue: '500,000,000,000 FCFA',
      fundsRaised: '10,000,000 FCFA',
      projectDescription: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients. Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    }
  ];

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'en-cours', label: 'En cours' },
    { value: 'valide', label: 'Validé' },
    { value: 'non-valide', label: 'Non validé' },
    { value: 'cloture', label: 'Clôturé' }
  ];

  sectorOptions = [
    { value: '', label: 'Tous les secteurs' },
    { value: 'sante', label: 'Santé' },
    { value: 'education', label: 'Éducation' },
    { value: 'technologie', label: 'Technologie' },
    { value: 'environnement', label: 'Environnement' }
  ];

  onSearch() {
    console.log('Recherche:', this.searchTerm);
  }

  onStatusChange() {
    console.log('Statut sélectionné:', this.selectedStatus);
  }

  onSectorChange() {
    console.log('Secteur sélectionné:', this.selectedSector);
  }

  openProjectModal(project: any) {
    this.selectedProject = project;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedProject = null;
  }

  openEditModal(project: any) {
    this.selectedProject = project;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedProject = null;
  }

  onSubmitEdit() {
    console.log('Modification soumise pour:', this.selectedProject);
    this.closeEditModal();
  }
}
