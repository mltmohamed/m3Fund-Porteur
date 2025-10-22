import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nouvelle-campagne-don',
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-campagne-don.html',
  styleUrl: './nouvelle-campagne-don.css'
})
export class NouvelleCampagneDon {
  // Données du formulaire
  selectedProject: string = '';
  targetBudget: string = '';
  startDate: string = '';
  endDate: string = '';
  reward: string = '';
  campaignDescription: string = '';

  // Options pour les projets
  projectOptions = [
    { value: '', label: 'Sélectionner un projet' },
    { value: 'plateforme-telemedecine', label: 'Plateforme de Télémédecine' },
    { value: 'construction-ecole', label: 'Construction d\'une Ecole' },
    { value: 'plateforme-ecommerce', label: 'Plateforme E-commerce' },
    { value: 'application-mobile', label: 'Application Mobile' }
  ];

  // Options pour les récompenses
  rewardOptions = [
    { value: '', label: 'Sélectionner une récompense' },
    { value: 'merci', label: 'Message de remerciement' },
    { value: 'badge', label: 'Badge de contributeur' },
    { value: 'certificat', label: 'Certificat de participation' },
    { value: 'mention', label: 'Mention spéciale' }
  ];

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

  onSubmit() {
    console.log('Campagne de don soumise:', {
      selectedProject: this.selectedProject,
      targetBudget: this.targetBudget,
      startDate: this.startDate,
      endDate: this.endDate,
      reward: this.reward,
      campaignDescription: this.campaignDescription,
      m3FundReceives: this.m3FundReceives,
      userReceives: this.userReceives
    });
    
    // Ici vous pouvez ajouter la logique pour sauvegarder la campagne
    alert('Campagne de don soumise avec succès !');
  }
}
