import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectSummary, ProjectResponse, ProjectUpdateRequest } from '../../interfaces/project.interface';

@Component({
  selector: 'app-projet',
  imports: [CommonModule, FormsModule],
  templateUrl: './projet.html',
  styleUrl: './projet.css'
})
export class Projet implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedSector: string = '';
  showModal: boolean = false;
  showEditModal: boolean = false;
  selectedProject: Project | null = null;
  isLoading = false;
  errorMessage = '';

  // Données des cartes de résumé
  summaryCards: ProjectSummary[] = [];

  // Données des projets
  projects: Project[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.loadProjects();
    this.loadProjectSummary();
  }

  // Charger les projets depuis le backend
  loadProjects() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.projectService.getProjects().subscribe({
      next: (backendProjects: ProjectResponse[]) => {
        this.projects = backendProjects.map(project => 
          this.projectService.transformProjectData(project)
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des projets';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Charger les statistiques des projets
  loadProjectSummary() {
    this.projectService.getProjectStats().subscribe({
      next: (stats) => {
        this.summaryCards = this.projectService.transformStatsToSummary(stats);
        console.log('Statistiques des projets chargées:', stats);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        
        // Gestion spécifique des erreurs d'authentification
        if (error.status === 401) {
          console.log('Accès non autorisé aux statistiques - utilisation des données par défaut');
        } else {
          console.log('Erreur technique lors du chargement des statistiques');
        }
        
        // Utiliser les données par défaut en cas d'erreur
        this.summaryCards = [
          {
            title: 'Nombre de projets',
            value: '0',
            icon: 'fas fa-bars'
          },
          {
            title: 'En Cours',
            value: '0',
            icon: 'fas fa-circle-notch'
          },
          {
            title: 'Validés',
            value: '0',
            icon: 'fas fa-check'
          },
          {
            title: 'Non validés',
            value: '0',
            icon: 'fas fa-clock'
          }
        ];
      }
    });
  }

  // Données statiques pour les tests (à supprimer après intégration)
  staticProjects = [
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
    { value: 'validated', label: 'Validé' },
    { value: 'pending', label: 'Non validé' }
  ];

  sectorOptions = [
    { value: '', label: 'Tous les secteurs' },
    { value: 'AGRICULTURE', label: 'Agriculture' },
    { value: 'BREEDING', label: 'Élevage' },
    { value: 'EDUCATION', label: 'Éducation' },
    { value: 'HEALTH', label: 'Santé' },
    { value: 'MINE', label: 'Mine' },
    { value: 'CULTURE', label: 'Culture' },
    { value: 'ENVIRONMENT', label: 'Environnement' },
    { value: 'COMPUTER_SCIENCE', label: 'Informatique' },
    { value: 'SOLIDARITY', label: 'Solidarité' },
    { value: 'SHOPPING', label: 'Commerce' },
    { value: 'SOCIAL', label: 'Social' }
  ];

  onSearch() {
    if (this.searchTerm.trim()) {
      this.projectService.searchProjects(this.searchTerm).subscribe({
        next: (backendProjects: ProjectResponse[]) => {
          this.projects = backendProjects.map(project => 
            this.projectService.transformProjectData(project)
          );
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la recherche';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.loadProjects();
    }
  }

  onStatusChange() {
    if (this.selectedStatus) {
      this.projectService.filterProjectsByStatus(this.selectedStatus).subscribe({
        next: (backendProjects: ProjectResponse[]) => {
          this.projects = backendProjects.map(project => 
            this.projectService.transformProjectData(project)
          );
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du filtrage par statut';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.loadProjects();
    }
  }

  onSectorChange() {
    if (this.selectedSector) {
      this.projectService.filterProjectsBySector(this.selectedSector).subscribe({
        next: (backendProjects: ProjectResponse[]) => {
          this.projects = backendProjects.map(project => 
            this.projectService.transformProjectData(project)
          );
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du filtrage par secteur';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.loadProjects();
    }
  }

  openProjectModal(project: Project) {
    this.selectedProject = project;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedProject = null;
  }

  // Données du formulaire de modification
  editForm = {
    name: '',
    resume: '',
    description: '',
    domain: '',
    objective: '',
    websiteLink: '',
    launchedAt: '',
    images: [] as File[],
    video: null as File | null,
    businessPlan: null as File | null
  };

  openEditModal(project: Project) {
    this.selectedProject = project;
    this.showEditModal = true;
    
    // Pré-remplir le formulaire avec les données actuelles
    this.editForm = {
      name: project.title,
      resume: project.projectSummary,
      description: project.projectDescription,
      domain: '', // À récupérer depuis project si disponible
      objective: '', // À récupérer depuis project si disponible
      websiteLink: '', // À récupérer depuis project si disponible
      launchedAt: '', // Laisser vide - l'utilisateur peut saisir une nouvelle date si nécessaire
      images: [],
      video: null,
      businessPlan: null
    };
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedProject = null;
    // Réinitialiser le formulaire
    this.editForm = {
      name: '',
      resume: '',
      description: '',
      domain: '',
      objective: '',
      websiteLink: '',
      launchedAt: '',
      images: [],
      video: null,
      businessPlan: null
    };
  }

  onImagesSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.editForm.images = Array.from(files);
    }
  }

  onVideoSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.editForm.video = file;
    }
  }

  onBusinessPlanSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.editForm.businessPlan = file;
    }
  }

  onSubmitEdit() {
    if (this.selectedProject) {
      this.isLoading = true;
      this.errorMessage = '';

      // Créer l'objet de mise à jour
      const updateData: ProjectUpdateRequest = {};
      
      // Ajouter seulement les champs modifiés
      if (this.editForm.name && this.editForm.name !== this.selectedProject.title) {
        updateData.name = this.editForm.name;
      }
      if (this.editForm.resume) {
        updateData.resume = this.editForm.resume;
      }
      if (this.editForm.description) {
        updateData.description = this.editForm.description;
      }
      if (this.editForm.domain) {
        updateData.domain = this.editForm.domain;
      }
      if (this.editForm.objective) {
        updateData.objective = this.editForm.objective;
      }
      if (this.editForm.websiteLink) {
        updateData.websiteLink = this.editForm.websiteLink;
      }
      if (this.editForm.launchedAt) {
        // Convertir la date au format LocalDateTime attendu par le backend
        const date = new Date(this.editForm.launchedAt);
        // Vérifier que la date est valide
        if (!isNaN(date.getTime())) {
          updateData.launchedAt = date.toISOString().slice(0, 19); // Format: "2025-10-30T00:00:00"
        } else {
          console.error('Date invalide:', this.editForm.launchedAt);
        }
      }
      
      // Ajouter les fichiers UNIQUEMENT s'ils sont vraiment présents et valides
      if (this.editForm.images && this.editForm.images.length > 0) {
        const validImages = this.editForm.images.filter(img => img && img.size > 0);
        if (validImages.length > 0) {
          updateData.images = validImages;
        }
      }
      if (this.editForm.video && this.editForm.video.size > 0) {
        updateData.video = this.editForm.video;
      }
      if (this.editForm.businessPlan && this.editForm.businessPlan.size > 0) {
        updateData.businessPlan = this.editForm.businessPlan;
      }

      console.log('Champs envoyés pour la mise à jour:', Object.keys(updateData));

      this.projectService.updateProject(this.selectedProject.id, updateData).subscribe({
        next: (response) => {
          console.log('Projet modifié avec succès:', response);
          this.closeEditModal();
          // Recharger la liste des projets
          this.loadProjects();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.errorMessage = 'Erreur lors de la modification du projet';
          this.isLoading = false;
        }
      });
    }
  }

  // Méthode pour recharger les projets
  refreshProjects() {
    this.loadProjects();
    this.loadProjectSummary();
  }

  // Méthode pour gérer les erreurs
  clearError() {
    this.errorMessage = '';
  }
}
