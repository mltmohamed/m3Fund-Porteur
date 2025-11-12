import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { CampaignService } from '../../services/campaign.service';
import { Project, ProjectSummary, ProjectResponse, ProjectUpdateRequest } from '../../interfaces/project.interface';
import { CampaignResponse } from '../../interfaces/campaign.interface';
import { forkJoin } from 'rxjs';

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
  selectedProjectRaw: ProjectResponse | null = null; // Stocker les données brutes du backend
  backendProjectsMap: Map<number, ProjectResponse> = new Map(); // Map pour stocker les projets bruts par ID
  backendCampaignsMap: Map<number, CampaignResponse[]> = new Map(); // Map pour stocker les campagnes par projectId
  isLoading = false;
  errorMessage = '';

  // Données des cartes de résumé
  summaryCards: ProjectSummary[] = [];

  // Données des projets
  projects: Project[] = [];

  constructor(
    private projectService: ProjectService,
    private campaignService: CampaignService
  ) {}

  ngOnInit() {
    this.loadProjects();
    this.loadProjectSummary();
  }

  // Charger les projets depuis le backend
  loadProjects() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Récupérer les projets et les campagnes en parallèle (utilise maintenant les endpoints privés)
    forkJoin({
      projects: this.projectService.getMyProjects(), // Endpoint privé - seulement les projets du porteur
      campaigns: this.campaignService.getMyCampaigns() // Endpoint privé - seulement les campagnes du porteur
    }).subscribe({
      next: ({ projects: backendProjects, campaigns: backendCampaigns }) => {
        // Stocker les projets bruts dans une map pour accès rapide
        this.backendProjectsMap.clear();
        backendProjects.forEach(project => {
          this.backendProjectsMap.set(project.id, project);
        });
        
        // Stocker les campagnes par projet dans une map pour accès rapide
        this.backendCampaignsMap.clear();
        backendProjects.forEach(project => {
          const projectCampaigns = backendCampaigns.filter(
            campaign => {
              // Le backend peut retourner projectId directement ou via projectResponse.id
              const campaignProjectId = campaign.projectId || campaign.projectResponse?.id;
              return campaignProjectId === project.id;
            }
          );
          this.backendCampaignsMap.set(project.id, projectCampaigns);
        });
        
        // Transformer les projets et enrichir avec les données des campagnes
        this.projects = backendProjects.map(project => {
          const transformedProject = this.projectService.transformProjectData(project);
          
          // Filtrer les campagnes de ce projet
          const projectCampaigns = backendCampaigns.filter(
            campaign => {
              // Le backend peut retourner projectId directement ou via projectResponse.id
              const campaignProjectId = campaign.projectId || campaign.projectResponse?.id;
              return campaignProjectId === project.id;
            }
          );
          
          // Calculer le nombre de campagnes
          transformedProject.campaignCount = projectCampaigns.length.toString();
          
          // Calculer la somme des parts vendues (seulement pour les campagnes d'investissement)
          const totalSharesSold = projectCampaigns
            .filter(campaign => {
              const campaignType = campaign.type || campaign.campaignType;
              return campaignType === 'INVESTMENT';
            })
            .reduce((sum, campaign) => sum + (campaign.shareOffered || 0), 0);
          
          transformedProject.shareOffered = totalSharesSold > 0 
            ? `${totalSharesSold.toFixed(2)}%` 
            : '0%';
          
          // Calculer les fonds récoltés totaux
          const totalFundsRaised = projectCampaigns.reduce(
            (sum, campaign) => sum + (campaign.currentFund || campaign.fundsRaised || 0), 
            0
          );
          
          transformedProject.fundsRaised = `${totalFundsRaised.toLocaleString('fr-FR')} FCFA`;
          
          // Calculer le budget cible total
          const totalTargetBudget = projectCampaigns.reduce(
            (sum, campaign) => sum + (campaign.targetBudget || 0), 
            0
          );
          
          transformedProject.targetBudget = `${totalTargetBudget.toLocaleString('fr-FR')} FCFA`;
          
          // Calculer la valeur nette totale (pour les investissements)
          // Pour le moment, laisser à 0 comme demandé
          // const totalNetValue = projectCampaigns
          //   .filter(campaign => campaign.campaignType === 'INVESTMENT')
          //   .reduce((sum, campaign) => sum + (campaign.netValue || 0), 0);
          
          transformedProject.netValue = '0 FCFA';
          
          // Calculer le nombre total de collaborateurs uniques
          const uniqueCollaborators = new Set<number>();
          projectCampaigns.forEach(campaign => {
            // Note: collaboratorCount est déjà calculé par campagne, on doit agréger
            // Pour l'instant, on prend le max ou la somme selon la logique métier
          });
          
          return transformedProject;
        });
        
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
    this.projectService.getMyProjectStats().subscribe({
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
      this.projectService.searchMyProjects(this.searchTerm).subscribe({
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
      this.projectService.filterMyProjectsByStatus(this.selectedStatus).subscribe({
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
      this.projectService.filterMyProjectsBySector(this.selectedSector).subscribe({
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

  // Calculer les valeurs du projet à partir de ses campagnes
  calculateProjectValues(project: Project): void {
    // Récupérer les campagnes de ce projet depuis la map
    const projectCampaigns = this.backendCampaignsMap.get(project.id) || [];
    
    console.log('Campagnes du projet pour calcul:', projectCampaigns);
    
    // Calculer les totaux à partir de toutes les campagnes (pas seulement les investissements)
    // Budget cible : somme de tous les budgets cibles
    const totalTargetBudget = projectCampaigns.reduce(
      (sum, campaign) => sum + (campaign.targetBudget || 0), 
      0
    );
    
    // Fonds récoltés : somme de tous les fonds récoltés
    const totalFundsRaised = projectCampaigns.reduce(
      (sum, campaign) => sum + (campaign.currentFund || campaign.fundsRaised || 0), 
      0
    );
    
    // Parts vendues : seulement pour les campagnes d'investissement
    const investmentCampaigns = projectCampaigns.filter(campaign => {
      const campaignType = campaign.type || campaign.campaignType;
      return campaignType === 'INVESTMENT';
    });
    
    const totalSharesSold = investmentCampaigns.reduce(
      (sum, campaign) => sum + (campaign.shareOffered || 0), 
      0
    );
    
    console.log('Totaux calculés pour le projet:', { 
      projectId: project.id,
      totalSharesSold, 
      totalTargetBudget, 
      totalFundsRaised,
      nombreCampagnes: projectCampaigns.length,
      nombreInvestissements: investmentCampaigns.length
    });
    
    // Mettre à jour les valeurs dans le projet
    project.shareOffered = totalSharesSold > 0 
        ? `${totalSharesSold.toFixed(2)}%` 
        : '0%';
    project.targetBudget = `${totalTargetBudget.toLocaleString('fr-FR')} FCFA`;
    project.fundsRaised = `${totalFundsRaised.toLocaleString('fr-FR')} FCFA`;
      // Laisser la valeur nette à 0 pour le moment
    project.netValue = '0 FCFA';
    // Les projets n'ont pas de date de fin
    project.endDate = '';
  }

  openProjectModal(project: Project) {
    this.selectedProject = project;
    
    // Calculer et mettre à jour les valeurs à partir des campagnes
    this.calculateProjectValues(project);
    
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

  // Vérifier si un projet est validé (ne peut plus modifier la date de début)
  isProjectValidated(): boolean {
    if (this.selectedProjectRaw) {
      // Utiliser le champ isValidated du backend
      return this.selectedProjectRaw.isValidated === true;
    }
    // Si on n'a pas les données brutes, considérer comme non validé pour permettre la modification
    return false;
  }

  // Vérifier si un projet est clôturé (toutes les campagnes sont FINISHED)
  isProjectClosed(project: Project): boolean {
    const projectCampaigns = this.backendCampaignsMap.get(project.id) || [];
    if (projectCampaigns.length === 0) {
      // Un projet sans campagnes n'est pas clôturé
      return false;
    }
    // Un projet est clôturé si toutes ses campagnes sont FINISHED
    return projectCampaigns.every(campaign => campaign.status === 'FINISHED');
  }

  // Vérifier si un projet peut être modifié
  canEditProject(project: Project): boolean {
    return !this.isProjectClosed(project);
  }

  openEditModal(project: Project, event?: Event) {
    console.log('=== openEditModal appelé ===', { projectId: project.id, event });
    
    // Empêcher la propagation de l'événement IMMÉDIATEMENT
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    // Vérifier si le projet peut être modifié
    if (!this.canEditProject(project)) {
      console.warn('Tentative de modification d\'un projet clôturé - bloquée');
      this.errorMessage = 'Ce projet est clôturé (toutes les campagnes sont terminées) et ne peut plus être modifié.';
      return;
    }
    
    // S'assurer que le modal s'ouvre immédiatement
    this.selectedProject = project;
    
    // Calculer et mettre à jour les valeurs à partir des campagnes avant d'ouvrir le modal
    this.calculateProjectValues(project);
    
    this.showEditModal = true;
    this.errorMessage = '';
    
    console.log('Modal ouvert, recherche du projet dans la map...', { 
      projectId: project.id, 
      mapSize: this.backendProjectsMap.size 
    });
    
    // Récupérer les données complètes du projet depuis la map
    const projectResponse = this.backendProjectsMap.get(project.id);
    
    if (projectResponse) {
      console.log('Projet trouvé dans la map, utilisation des données');
      // Utiliser les données déjà chargées
      this.selectedProjectRaw = projectResponse;
      
      // Pré-remplir le formulaire avec les données actuelles
      // Ne pas pré-remplir launchedAt si le projet est validé
      this.editForm = {
        name: projectResponse.name || project.title,
        resume: projectResponse.resume || project.projectSummary || '',
        description: projectResponse.description || project.projectDescription || '',
        domain: projectResponse.domain || '',
        objective: projectResponse.objective || '',
        websiteLink: projectResponse.websiteLink || '',
        launchedAt: (projectResponse.isValidated ? '' : (projectResponse.launchedAt ? this.formatDateForInput(projectResponse.launchedAt) : '')),
        images: [],
        video: null,
        businessPlan: null
      };
    } else {
      console.warn('Projet non trouvé dans la map, utilisation des données transformées disponibles');
      console.warn('ATTENTION: Ne pas appeler getMyProjects() pour éviter une erreur 401 et une redirection');
      
      // NE PAS appeler getMyProjects() car cela pourrait déclencher une erreur 401
      // et causer une déconnexion via l'intercepteur
      // Utiliser les données du projet transformé qui sont déjà disponibles
      this.selectedProjectRaw = null; // Pas de données brutes disponibles
      
      // Pré-remplir le formulaire avec les données disponibles depuis le projet transformé
      // Note: certains champs seront vides, mais l'utilisateur peut les remplir manuellement
      // Ne pas pré-remplir launchedAt si on ne peut pas vérifier si le projet est validé
      this.editForm = {
        name: project.title,
        resume: project.projectSummary || '',
        description: project.projectDescription || '',
        domain: '', // Ne sera pas disponible depuis Project transformé
        objective: '', // Ne sera pas disponible depuis Project transformé
        websiteLink: '', // Ne sera pas disponible depuis Project transformé
        launchedAt: '', // Ne pas pré-remplir si on n'a pas les données brutes
        images: [],
        video: null,
        businessPlan: null
      };
      
      // Afficher un message informatif (mais pas une erreur)
      console.log('Formulaire pré-rempli avec les données disponibles du projet transformé');
    }
  }
  
  // Formater la date pour l'input de type date (format YYYY-MM-DD)
  private formatDateForInput(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return '';
    }
  }

  // Parser une date depuis une chaîne locale (format DD/MM/YYYY) vers format YYYY-MM-DD
  private parseDateFromString(dateString: string): string {
    try {
      // Format attendu: "DD/MM/YYYY" (format français)
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
      // Si ce n'est pas au format attendu, essayer de parser comme date ISO
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return this.formatDateForInput(dateString);
      }
      return '';
    } catch (error) {
      console.error('Erreur lors du parsing de la date:', error);
      return '';
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedProject = null;
    this.selectedProjectRaw = null;
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
        
        this.editForm.images = files;
        // Ne réinitialiser que les erreurs liées aux fichiers
        if (this.errorMessage && (this.errorMessage.includes('image') || this.errorMessage.includes('Image'))) {
          this.errorMessage = '';
        }
        console.log('Images sélectionnées:', files.length);
      }
    };
    input.click();
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
        
        this.editForm.video = file;
        // Ne réinitialiser que les erreurs liées aux fichiers
        if (this.errorMessage && (this.errorMessage.includes('vidéo') || this.errorMessage.includes('Vidéo') || this.errorMessage.includes('video'))) {
          this.errorMessage = '';
        }
        console.log('Vidéo sélectionnée:', file.name, 'Type:', file.type);
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
        // Vérifier que c'est bien un PDF
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          this.errorMessage = 'Le business plan doit être un fichier PDF.';
          return;
        }
        
        // Vérifier la taille (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          this.errorMessage = 'Le business plan ne doit pas dépasser 10MB.';
          return;
        }
        
        this.editForm.businessPlan = file;
        // Ne réinitialiser que les erreurs liées aux fichiers
        if (this.errorMessage && (this.errorMessage.includes('business plan') || this.errorMessage.includes('Business plan') || this.errorMessage.includes('PDF'))) {
          this.errorMessage = '';
        }
        console.log('Business plan sélectionné:', file.name);
      }
    };
    input.click();
  }

  onSubmitEdit() {
    if (this.selectedProject) {
      // Valider la date avant la soumission
      if (this.editForm.launchedAt) {
        const selectedDate = new Date(this.editForm.launchedAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          this.errorMessage = 'La date sélectionnée ne peut pas être antérieure à aujourd\'hui.';
          return;
        }
      }
      
      this.isLoading = true;
      this.errorMessage = '';

      // Créer l'objet de mise à jour
      const updateData: ProjectUpdateRequest = {};
      
      // Ajouter seulement les champs modifiés (comparer avec les données originales)
      const originalProject = this.selectedProjectRaw || {
        name: this.selectedProject.title,
        resume: this.selectedProject.projectSummary,
        description: this.selectedProject.projectDescription,
        domain: '',
        objective: '',
        websiteLink: '',
        launchedAt: ''
      };
      
      if (this.editForm.name && this.editForm.name.trim() !== originalProject.name) {
        updateData.name = this.editForm.name.trim();
      }
      if (this.editForm.resume && this.editForm.resume.trim() !== originalProject.resume) {
        updateData.resume = this.editForm.resume.trim();
      }
      if (this.editForm.description && this.editForm.description.trim() !== originalProject.description) {
        updateData.description = this.editForm.description.trim();
      }
      if (this.editForm.domain && this.editForm.domain !== originalProject.domain) {
        updateData.domain = this.editForm.domain;
      }
      if (this.editForm.objective && this.editForm.objective.trim() !== originalProject.objective) {
        updateData.objective = this.editForm.objective.trim();
      }
      if (this.editForm.websiteLink && this.editForm.websiteLink.trim() !== originalProject.websiteLink) {
        updateData.websiteLink = this.editForm.websiteLink.trim();
      }
      // Ne pas envoyer la date de début si le projet est validé
      if (!this.isProjectValidated() && this.editForm.launchedAt) {
        const formattedDate = this.formatDateForInput(this.editForm.launchedAt);
        const originalDate = originalProject.launchedAt ? this.formatDateForInput(originalProject.launchedAt) : '';
        if (formattedDate !== originalDate) {
          // Convertir la date au format LocalDateTime attendu par le backend
          const date = new Date(this.editForm.launchedAt);
          // Vérifier que la date est valide
          if (!isNaN(date.getTime())) {
            updateData.launchedAt = date.toISOString().slice(0, 19); // Format: "2025-10-30T00:00:00"
          } else {
            console.error('Date invalide:', this.editForm.launchedAt);
          }
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

  // Obtenir la date minimale (aujourd'hui)
  getMinDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Valider que la date sélectionnée n'est pas inférieure à aujourd'hui
  validateDate() {
    if (this.editForm.launchedAt) {
      const selectedDate = new Date(this.editForm.launchedAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit pour la comparaison
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        this.errorMessage = 'La date de début ne peut pas être antérieure à aujourd\'hui.';
        return;
      }
    }
    // Si la date est valide et qu'il y avait une erreur de date, la réinitialiser
    if (this.errorMessage && this.errorMessage.includes('date')) {
      this.errorMessage = '';
    }
  }
}
