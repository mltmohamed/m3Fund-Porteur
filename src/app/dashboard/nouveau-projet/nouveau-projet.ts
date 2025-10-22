import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nouveau-projet',
  imports: [CommonModule, FormsModule],
  templateUrl: './nouveau-projet.html',
  styleUrl: './nouveau-projet.css'
})
export class NouveauProjet {
  // Données du formulaire
  projectName: string = '';
  projectSummary: string = '';
  projectLink: string = '';
  projectDescription: string = '';
  projectDomain: string = '';
  projectObjective: string = '';
  startDate: string = '';
  endDate: string = '';

  // Options pour le domaine
  domainOptions = [
    { value: '', label: 'Sélectionner un domaine' },
    { value: 'sante', label: 'Santé' },
    { value: 'education', label: 'Éducation' },
    { value: 'technologie', label: 'Technologie' },
    { value: 'environnement', label: 'Environnement' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'art', label: 'Art et Culture' }
  ];

  onSubmit() {
    console.log('Projet soumis:', {
      projectName: this.projectName,
      projectSummary: this.projectSummary,
      projectLink: this.projectLink,
      projectDescription: this.projectDescription,
      projectDomain: this.projectDomain,
      projectObjective: this.projectObjective,
      startDate: this.startDate,
      endDate: this.endDate
    });
    
    // Ici vous pouvez ajouter la logique pour sauvegarder le projet
    alert('Projet soumis avec succès !');
  }

  onVideoSelect() {
    console.log('Sélection de vidéo');
    // Ici vous pouvez ajouter la logique pour sélectionner une vidéo
  }

  onImagesSelect() {
    console.log('Sélection d\'images');
    // Ici vous pouvez ajouter la logique pour sélectionner des images
  }

  onBusinessPlanSelect() {
    console.log('Sélection du business plan');
    // Ici vous pouvez ajouter la logique pour sélectionner le business plan
  }
}

