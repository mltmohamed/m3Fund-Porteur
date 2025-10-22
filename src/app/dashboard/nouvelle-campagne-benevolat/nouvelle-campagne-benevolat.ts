import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nouvelle-campagne-benevolat',
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-campagne-benevolat.html',
  styleUrl: './nouvelle-campagne-benevolat.css'
})
export class NouvelleCampagneBenevolat {
  // Données du formulaire
  selectedProject: string = '';
  whatLookingFor: string = '';
  startDate: string = '';
  endDate: string = '';
  campaignDescription: string = '';

  // Options pour les projets
  projectOptions = [
    { value: '', label: 'Sélectionner un projet' },
    { value: 'plateforme-telemedecine', label: 'Plateforme de Télémédecine' },
    { value: 'construction-ecole', label: 'Construction d\'une Ecole' },
    { value: 'plateforme-ecommerce', label: 'Plateforme E-commerce' },
    { value: 'application-mobile', label: 'Application Mobile' }
  ];

  // Options pour ce que l'utilisateur recherche
  whatLookingForOptions = [
    { value: '', label: 'Sélectionner ce que vous recherchez' },
    { value: 'developpeurs', label: 'Développeurs' },
    { value: 'designers', label: 'Designers' },
    { value: 'marketing', label: 'Spécialistes Marketing' },
    { value: 'communication', label: 'Spécialistes Communication' },
    { value: 'finance', label: 'Spécialistes Finance' },
    { value: 'juridique', label: 'Spécialistes Juridique' },
    { value: 'autres', label: 'Autres compétences' }
  ];

  onSubmit() {
    console.log('Campagne de bénévolat soumise:', {
      selectedProject: this.selectedProject,
      whatLookingFor: this.whatLookingFor,
      startDate: this.startDate,
      endDate: this.endDate,
      campaignDescription: this.campaignDescription
    });
    
    // Ici vous pouvez ajouter la logique pour sauvegarder la campagne
    alert('Campagne de bénévolat soumise avec succès !');
  }
}
