import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { ProjectCreateRequest } from '../../interfaces/project.interface';

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

  // Gestion des fichiers
  selectedImages: File[] = [];
  selectedVideo: File | null = null;
  selectedBusinessPlan: File | null = null;

  // États
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Modal de succès
  showSuccessModal = false;

  // Options pour le domaine (correspondant aux enums du backend)
  domainOptions = [
    { value: '', label: 'Sélectionner un domaine' },
    { value: 'AGRICULTURE', label: 'Agriculture' },
    { value: 'BREEDING', label: 'Élevage' },
    { value: 'EDUCATION', label: 'Éducation' },
    { value: 'HEALTH', label: 'Santé' },
    { value: 'MINE', label: 'Mines' },
    { value: 'CULTURE', label: 'Culture' },
    { value: 'ENVIRONMENT', label: 'Environnement' },
    { value: 'COMPUTER_SCIENCE', label: 'Informatique' },
    { value: 'SOLIDARITY', label: 'Solidarité' },
    { value: 'SHOPPING', label: 'Commerce' },
    { value: 'SOCIAL', label: 'Social' }
  ];

  constructor(private projectService: ProjectService) {}

  onSubmit() {
    // Validation des champs obligatoires
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données pour l'envoi
    // S'assurer que l'URL a un protocole
    let websiteLink = this.projectLink;
    if (!websiteLink.startsWith('http://') && !websiteLink.startsWith('https://')) {
      websiteLink = 'https://' + websiteLink;
    }
    
    // Préparer la date de lancement
    // Le backend a une contrainte @PastOrPresent, donc on doit utiliser une date qui ne dépasse pas aujourd'hui
    let launchedAt: string;
    
    // Toujours utiliser la date sélectionnée, le backend validera
    launchedAt = this.startDate + 'T00:00:00';
    
    const projectData: ProjectCreateRequest = {
      name: this.projectName,
      resume: this.projectSummary,
      description: this.projectDescription,
      domain: this.projectDomain,
      objective: this.projectObjective,
      websiteLink: websiteLink,
      launchedAt: launchedAt,
      images: this.selectedImages,
      video: this.selectedVideo!,
      businessPlan: this.selectedBusinessPlan!
    };

    console.log('=== CRÉATION DE PROJET ===');
    console.log('Données du projet:', projectData);

    this.projectService.createProject(projectData).subscribe({
      next: (response) => {
        console.log('Projet créé avec succès:', response);
        this.isLoading = false;
        
        // Réinitialiser le formulaire
        this.resetForm();
        
        // Afficher le modal de succès
        this.showSuccessModal = true;
      },
      error: (error) => {
        console.error('Erreur lors de la création du projet:', error);
        this.isLoading = false;
        
        // Gestion des erreurs spécifiques
        if (error.status === 400) {
          // Afficher les erreurs de validation du backend
          if (error.error && typeof error.error === 'object') {
            const errorMessages = Object.values(error.error).join(', ');
            this.errorMessage = `Erreurs de validation : ${errorMessages}`;
          } else {
            this.errorMessage = error.error?.message || 'Données invalides. Veuillez vérifier vos informations.';
          }
        } else if (error.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          this.errorMessage = 'Erreur lors de la création du projet. Veuillez réessayer.';
        }
      }
    });
  }

  // Validation du formulaire
  private validateForm(): boolean {
    if (!this.projectName || this.projectName.length < 3) {
      this.errorMessage = 'Le nom du projet doit contenir au moins 3 caractères.';
      return false;
    }
    
    if (!this.projectSummary || this.projectSummary.length < 10) {
      this.errorMessage = 'Le résumé doit contenir au moins 10 caractères.';
      return false;
    }
    
    if (!this.projectDescription || this.projectDescription.length < 20) {
      this.errorMessage = 'La description doit contenir au moins 20 caractères.';
      return false;
    }
    
    if (!this.projectDomain) {
      this.errorMessage = 'Veuillez sélectionner un domaine.';
      return false;
    }
    
    if (!this.projectObjective || this.projectObjective.length < 10) {
      this.errorMessage = 'L\'objectif doit contenir au moins 10 caractères.';
      return false;
    }
    
    if (!this.projectLink) {
      this.errorMessage = 'Veuillez fournir un lien vers votre site web.';
      return false;
    }
    
    // Validation du format URL selon le pattern du backend
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
    if (!urlPattern.test(this.projectLink)) {
      this.errorMessage = 'Le lien du site web doit être une URL valide (ex: https://monsite.com ou monsite.com).';
      return false;
    }
    
    if (!this.startDate) {
      this.errorMessage = 'Veuillez sélectionner une date de début.';
      return false;
    }
    
    // Valider que la date de lancement n'est pas dans le futur (doit être dans le passé ou aujourd'hui)
    if (!this.validateStartDate()) {
      return false;
    }
    
    if (this.selectedImages.length === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins une image.';
      return false;
    }
    
    if (!this.selectedVideo) {
      this.errorMessage = 'Veuillez sélectionner une vidéo pitch.';
      return false;
    }
    
    if (!this.selectedBusinessPlan) {
      this.errorMessage = 'Veuillez sélectionner le business plan.';
      return false;
    }
    
    return true;
  }

  // Réinitialiser le formulaire
  private resetForm() {
    this.projectName = '';
    this.projectSummary = '';
    this.projectLink = '';
    this.projectDescription = '';
    this.projectDomain = '';
    this.projectObjective = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedImages = [];
    this.selectedVideo = null;
    this.selectedBusinessPlan = null;
  }

  // Gestion de la sélection de vidéo
  onVideoSelect() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/mpeg,video/quicktime';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Vérifier le type MIME
        const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
          this.errorMessage = 'La vidéo doit être au format MP4, MPEG ou MOV.';
          return;
        }
        
        // Vérifier l'extension du fichier
        const fileName = file.name.toLowerCase();
        const allowedExtensions = ['.mp4', '.mpeg', '.mov'];
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        
        if (!hasValidExtension) {
          this.errorMessage = 'La vidéo doit avoir l\'extension .mp4, .mpeg ou .mov.';
          return;
        }
        
        // Vérifier la taille (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          this.errorMessage = 'La vidéo ne doit pas dépasser 50MB.';
          return;
        }
        
        this.selectedVideo = file;
        console.log('Vidéo sélectionnée:', file.name, 'Type:', file.type);
      }
    };
    input.click();
  }

  // Gestion de la sélection d'images
  onImagesSelect() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.multiple = true;
    input.onchange = (event: any) => {
      const files = Array.from(event.target.files) as File[];
      if (files.length > 0) {
        // Vérifier le nombre d'images (max 6)
        if (files.length > 6) {
          this.errorMessage = 'Vous ne pouvez sélectionner que 6 images maximum.';
          return;
        }
        
        // Vérifier la taille de chaque image (max 5MB)
        for (const file of files) {
          if (file.size > 5 * 1024 * 1024) {
            this.errorMessage = 'Chaque image ne doit pas dépasser 5MB.';
            return;
          }
        }
        
        this.selectedImages = files;
        console.log('Images sélectionnées:', files.length);
      }
    };
    input.click();
  }

  // Gestion de la sélection du business plan
  onBusinessPlanSelect() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Vérifier la taille (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          this.errorMessage = 'Le business plan ne doit pas dépasser 10MB.';
          return;
        }
        this.selectedBusinessPlan = file;
        console.log('Business plan sélectionné:', file.name);
      }
    };
    input.click();
  }

  // Valider la date de début lors de la saisie
  validateStartDate() {
    if (this.startDate) {
      const startDateObj = new Date(this.startDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fin de la journée d'aujourd'hui
      startDateObj.setHours(0, 0, 0, 0);
      
      // La date de lancement doit être dans le passé ou aujourd'hui (pas dans le futur)
      // @PastOrPresent dans le backend signifie: date <= aujourd'hui
      if (startDateObj.getTime() > today.getTime()) {
        this.errorMessage = 'La date de lancement ne peut pas être supérieure à aujourd\'hui.';
        return false;
      } else {
        // Réinitialiser l'erreur si la date est valide
        if (this.errorMessage && (this.errorMessage.includes('date de lancement') || this.errorMessage.includes('date de début'))) {
          this.errorMessage = '';
        }
      }
    }
    return true;
  }

  // Obtenir la date minimale (il n'y a pas de minimum, on peut mettre une date passée)
  // Mais on limite la date maximale à aujourd'hui
  getMinDate(): string {
    // Pas de minimum, on peut sélectionner n'importe quelle date passée
    return '';
  }

  // Obtenir la date maximale (aujourd'hui - la date de lancement ne peut pas être dans le futur)
  getMaxDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Effacer les messages d'erreur
  clearError() {
    this.errorMessage = '';
  }

  clearSuccess() {
    this.successMessage = '';
  }

  // Fermer le modal de succès
  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  // Rediriger vers la page des projets après succès
  goToProjects() {
    this.showSuccessModal = false;
    // Émettre un événement pour changer de vue
    const event = new CustomEvent('viewChanged', { detail: 'projet' });
    document.dispatchEvent(event);
  }
}

