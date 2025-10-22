import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nouvelle-campagne',
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-campagne.html',
  styleUrl: './nouvelle-campagne.css'
})
export class NouvelleCampagne {
  // Données du formulaire
  selectedProject: string = '';
  targetBudget: string = '';
  shareOffered: string = '';
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
    console.log('Campagne soumise:', {
      selectedProject: this.selectedProject,
      targetBudget: this.targetBudget,
      shareOffered: this.shareOffered,
      startDate: this.startDate,
      endDate: this.endDate,
      campaignDescription: this.campaignDescription,
      m3FundReceives: this.m3FundReceives,
      userReceives: this.userReceives
    });
    
    // Ici vous pouvez ajouter la logique pour sauvegarder la campagne
    alert('Campagne soumise avec succès !');
  }
}

