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
      icon: 'fas fa-arrow-up'
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
      statusIcon: 'fas fa-circle-notch'
    },
    {
      title: 'Construction d\'une Ecole',
      description: 'Construction d\'une école avec dispositifs intégrés pour le suivi pédagogique administratif des élèves.',
      funds: '0 FCFA récoltés',
      sector: 'Education',
      collaborators: '0 Collaborateurs',
      progress: 0,
      status: 'validé',
      statusIcon: 'fas fa-check'
    },
    {
      title: 'Plateforme de télémédecine',
      description: 'Application mobile pour consultations médicales à distance avec suivi des patients.',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch'
    },
    {
      title: 'Plateforme de télémédecine',
      description: 'Application mobile pour consultations médicales à distance avec suivi des patients.',
      funds: '250,000 FCFA récoltés',
      sector: 'SANTE',
      collaborators: '21 Collaborateurs',
      progress: 31,
      status: 'En cours',
      statusIcon: 'fas fa-circle-notch'
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
}
