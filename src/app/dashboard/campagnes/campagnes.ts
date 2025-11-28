import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { ProjectService } from '../../services/project.service';
import { Campaign, CampaignSummary, CampaignResponse } from '../../interfaces/campaign.interface';
import { ProjectResponse } from '../../interfaces/project.interface';
import { ConfirmationModal } from './confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-campagnes',
  imports: [CommonModule, FormsModule, ConfirmationModal],
  templateUrl: './campagnes.html',
  styleUrl: './campagnes.css'
})
export class Campagnes implements OnInit {
  @Output() viewChange = new EventEmitter<string>();
  searchTerm: string = '';
  selectedProject: string = '';
  selectedStatus: string = '';
  showModal: boolean = false;
  showEditModal: boolean = false;
  showEditDonModal: boolean = false;
  showEditBenevolatModal: boolean = false;
  showCampaignModal: boolean = false;
  selectedCampaign: Campaign | null = null;
  selectedCampaignRaw: CampaignResponse | null = null; // Données brutes de la campagne depuis le backend
  selectedCampaignProject: ProjectResponse | null = null; // Projet associé à la campagne sélectionnée
  backendCampaignsMap: Map<number, CampaignResponse> = new Map(); // Map pour stocker les campagnes brutes par ID
  backendProjectsMap: Map<number, ProjectResponse> = new Map(); // Map pour stocker les projets bruts par ID
  isLoading = false;
  errorMessage = '';
  
  // Modal de confirmation
  showConfirmationModal = false;
  confirmationSuccess = true;
  confirmationMessage = '';
  isConfirmationMode = false;
  confirmationTitle = '';
  confirmationProceedText = '';
  pendingCloseCampaign: Campaign | null = null;
  
  // Données du formulaire de modification
  editForm = {
    description: '',
    targetBudget: null as number | null,
    shareOffered: null as number | null,
    targetVolunteer: null as number | null,
    startDate: '',
    endDate: '',
    // Localization fields
    country: '',
    town: '',
    region: '',
    street: '',
    longitude: null as number | null,
    latitude: null as number | null
  };
  
  // Calculs en temps réel
  get m3FundReceives(): string {
    const budget = this.editForm.targetBudget || 0;
    const m3FundAmount = budget * 0.05; // 5% de frais
    return `${m3FundAmount.toLocaleString('fr-FR')} FCFA`;
  }

  get userReceives(): string {
    const budget = this.editForm.targetBudget || 0;
    const m3FundAmount = budget * 0.05; // 5% de frais
    const userAmount = budget - m3FundAmount;
    return `${userAmount.toLocaleString('fr-FR')} FCFA`;
  }

  // Données des cartes de résumé
  summaryCards: CampaignSummary[] = [];

  // Données des campagnes
  campaigns: Campaign[] = [];
  
  // Options pour les filtres
  projectOptions: { value: string, label: string }[] = [
    { value: '', label: 'Tous les projets' }
  ];

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'FINISHED', label: 'Terminée' }
  ];

  constructor(
    private campaignService: CampaignService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadCampaigns();
    this.loadCampaignSummary();
    this.loadProjects();
  }

  // Charger les campagnes depuis le backend (utilise maintenant l'endpoint privé)
  loadCampaigns() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.campaignService.getMyCampaigns().subscribe({
      next: (backendCampaigns: CampaignResponse[]) => {
        console.log('Campagnes chargées du backend:', backendCampaigns);
        // Stocker les campagnes brutes dans une map pour accès rapide
        this.backendCampaignsMap.clear();
        backendCampaigns.forEach(campaign => {
          this.backendCampaignsMap.set(campaign.id, campaign);
        });
        // Log des descriptions pour déboguer
        backendCampaigns.forEach((campaign, index) => {
          console.log(`Campagne ${index} (ID: ${campaign.id}): description =`, campaign.description, 'type:', typeof campaign.description, 'length:', campaign.description?.length);
        });
        // Créer un nouveau tableau pour forcer la détection de changement Angular
        const transformedCampaigns = backendCampaigns.map(campaign => 
          this.campaignService.transformCampaignData(campaign)
        );
        // Assigner le nouveau tableau (pas modifier l'ancien)
        this.campaigns = [...transformedCampaigns];
        console.log('Campagnes transformées:', this.campaigns);
        
        // Log localization data for each campaign
        this.campaigns.forEach((campaign, index) => {
          if (campaign.localization) {
            console.log(`Campaign ${index} localization:`, campaign.localization);
          }
        });
        
        // Si un modal de détail était ouvert, mettre à jour selectedCampaign avec les nouvelles données
        if (this.showModal && this.selectedCampaign) {
          const updatedCampaign = this.campaigns.find(c => c.id === this.selectedCampaign!.id);
          if (updatedCampaign) {
            console.log('Previous selected campaign localization:', this.selectedCampaign.localization);
            console.log('New selected campaign localization:', updatedCampaign.localization);
            this.selectedCampaign = updatedCampaign;
            console.log('Updated selected campaign with new data:', updatedCampaign);
          }
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des campagnes';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Charger les statistiques des campagnes (utilise maintenant l'endpoint privé)
  loadCampaignSummary() {
    this.campaignService.getMyCampaignStats().subscribe({
      next: (stats) => {
        this.summaryCards = this.campaignService.transformStatsToSummary(stats);
        console.log('Statistiques des campagnes chargées:', stats);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Utiliser les données par défaut en cas d'erreur
        this.summaryCards = [
          {
            title: 'Nombre de Campagne',
            value: '0',
            icon: 'fas fa-bullhorn'
          },
          {
            title: 'En Cours',
            value: '0',
            icon: 'fas fa-circle-notch'
          },
          {
            title: 'Non validés',
            value: '0',
            icon: 'fas fa-times'
          },
          {
            title: 'Clôturés',
            value: '0',
            icon: 'fas fa-times-circle'
          }
        ];
      }
    });
  }

  // Charger les projets pour le filtre (utilise maintenant l'endpoint privé)
  loadProjects() {
    this.projectService.getMyProjects().subscribe({
      next: (projects: ProjectResponse[]) => {
        // Stocker les projets dans une map pour accès rapide
        this.backendProjectsMap.clear();
        projects.forEach(project => {
          this.backendProjectsMap.set(project.id, project);
        });
        // Filtrer pour ne garder que les projets du porteur connecté
        this.projectOptions = [
          { value: '', label: 'Tous les projets' },
          ...projects.map(project => ({
            value: project.id.toString(),
            label: project.name
          }))
        ];
        console.log('Projets chargés pour les filtres:', this.projectOptions);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
      }
    });
  }
  
  // Vérifier si une campagne est clôturée
  isCampaignClosed(campaign: Campaign): boolean {
    const status = campaign.statusDetail || campaign.status;
    return status === 'COMPLETED' || status === 'FINISHED' || status === 'Clôturé' || status === 'clôturé';
  }

  // Vérifier si une campagne est en cours (ne peut plus être modifiée)
  isCampaignInProgress(campaign: Campaign): boolean {
    const status = campaign.statusDetail || campaign.status;
    return status === 'IN_PROGRESS' || status === 'En cours' || status === 'en cours';
  }

  // Vérifier si une campagne peut être modifiée
  // Les campagnes peuvent être modifiées à tous les statuts SAUF si elles sont clôturées
  canEditCampaign(campaign: Campaign): boolean {
    return !this.isCampaignClosed(campaign);
  }

  // Vérifier si une campagne peut être clôturée
  canCloseCampaign(campaign: Campaign): boolean {
    return this.isCampaignInProgress(campaign) && !this.isCampaignClosed(campaign);
  }

  // Clôturer une campagne
  openConfirmCloseModal(campaign: Campaign) {
    if (!campaign || !this.canCloseCampaign(campaign)) return;
    this.pendingCloseCampaign = campaign;
    this.isConfirmationMode = true;
    this.confirmationSuccess = true;
    this.confirmationTitle = 'Clôturer la campagne ?';
    this.confirmationMessage = 'Cette action va clôturer définitivement la campagne. Voulez-vous continuer ?';
    this.confirmationProceedText = 'Clôturer';
    this.showConfirmationModal = true;
  }

  onConfirmClose() {
    if (!this.pendingCloseCampaign) { this.closeConfirmationModal(); return; }
    const campaign = this.pendingCloseCampaign;
    this.isLoading = true;
    this.errorMessage = '';
    this.showConfirmationModal = false;
    this.isConfirmationMode = false;
    this.campaignService.finishCampaign(campaign.id).subscribe({
      next: (response) => {
        this.confirmationSuccess = true;
        this.confirmationMessage = 'Campagne clôturée avec succès';
        this.showConfirmationModal = true;
        this.isLoading = false;
        this.loadCampaigns();
        this.loadCampaignSummary();
        setTimeout(() => {
          this.showConfirmationModal = false;
        }, 2000);
      },
      error: (error) => {
        this.confirmationSuccess = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la clôture de la campagne.';
        this.confirmationMessage = this.errorMessage;
        this.showConfirmationModal = true;
        this.isLoading = false;
      }
    });
  }

  

  // Vérifier si une campagne est validée (ne peut plus modifier la date de début)
  isCampaignValidated(): boolean {
    if (!this.selectedCampaignRaw) {
      // Si on n'a pas les données brutes, vérifier depuis la campagne transformée
      if (this.selectedCampaign) {
        const status = this.selectedCampaign.statusDetail || this.selectedCampaign.status;
        // Une campagne est validée si elle est APPROVED, IN_PROGRESS, COMPLETED, ou FINISHED
        return status === 'APPROVED' || status === 'IN_PROGRESS' || status === 'COMPLETED' || status === 'FINISHED' || 
               status === 'Validé' || status === 'En cours' || status === 'Clôturé';
      }
      return false;
    }
    // Utiliser le statut brut du backend
    const status = this.selectedCampaignRaw.status;
    return status === 'APPROVED' || status === 'IN_PROGRESS' || status === 'COMPLETED' || status === 'FINISHED';
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.campaignService.searchMyCampaigns(this.searchTerm).subscribe({
        next: (backendCampaigns: CampaignResponse[]) => {
          this.campaigns = backendCampaigns.map(campaign => 
            this.campaignService.transformCampaignData(campaign)
          );
          
          // Si un modal de détail était ouvert, mettre à jour selectedCampaign avec les nouvelles données
          if (this.showModal && this.selectedCampaign) {
            const updatedCampaign = this.campaigns.find(c => c.id === this.selectedCampaign!.id);
            if (updatedCampaign) {
              this.selectedCampaign = updatedCampaign;
            }
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la recherche';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.loadCampaigns();
    }
  }

  onProjectChange() {
    if (this.selectedProject) {
      const projectId = parseInt(this.selectedProject);
      this.campaignService.filterMyCampaignsByProject(projectId).subscribe({
        next: (backendCampaigns: CampaignResponse[]) => {
          this.campaigns = backendCampaigns.map(campaign => 
            this.campaignService.transformCampaignData(campaign)
          );
          
          // Si un modal de détail était ouvert, mettre à jour selectedCampaign avec les nouvelles données
          if (this.showModal && this.selectedCampaign) {
            const updatedCampaign = this.campaigns.find(c => c.id === this.selectedCampaign!.id);
            if (updatedCampaign) {
              this.selectedCampaign = updatedCampaign;
            }
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du filtrage par projet';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.loadCampaigns();
    }
  }

  onStatusChange() {
    if (this.selectedStatus) {
      this.campaignService.filterMyCampaignsByStatus(this.selectedStatus).subscribe({
        next: (backendCampaigns: CampaignResponse[]) => {
          this.campaigns = backendCampaigns.map(campaign => 
            this.campaignService.transformCampaignData(campaign)
          );
          
          // Si un modal de détail était ouvert, mettre à jour selectedCampaign avec les nouvelles données
          if (this.showModal && this.selectedCampaign) {
            const updatedCampaign = this.campaigns.find(c => c.id === this.selectedCampaign!.id);
            if (updatedCampaign) {
              this.selectedCampaign = updatedCampaign;
            }
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du filtrage par statut';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.loadCampaigns();
    }
  }

  openCampaignModal(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCampaign = null;
  }

  openEditModal(campaign: Campaign, event?: Event) {
    console.log('=== openEditModal appelé ===', { campaignId: campaign.id, event });
    
    // Empêcher la propagation de l’événement IMMÉDIATEMENT
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    // Vérifier si la campagne peut être modifiée
    if (!this.canEditCampaign(campaign)) {
      console.warn('Tentative de modification d\'une campagne clôturée - bloquée');
      this.errorMessage = 'Cette campagne est clôturée et ne peut plus être modifiée.';
      return;
    }
    
    // S'assurer que le modal s'ouvre immédiatement
    this.selectedCampaign = campaign;
    this.showEditModal = true;
    this.errorMessage = '';
    
    console.log('Modal ouvert, recherche de la campagne dans la map...', { 
      campaignId: campaign.id, 
      mapSize: this.backendCampaignsMap.size 
    });
    
    // Récupérer les données complètes de la campagne depuis la map
    const campaignResponse = this.backendCampaignsMap.get(campaign.id);
    
    if (campaignResponse) {
      console.log('Campagne trouvée dans la map, utilisation des données');
      this.selectedCampaignRaw = campaignResponse;
      
      // Pré-remplir le formulaire avec les données actuelles
      const campaignDescription = typeof campaignResponse.description === 'string' ? campaignResponse.description : '';
      const projectDescription = campaignResponse.projectResponse?.description || campaignResponse.projectResponse?.resume || '';
      const descriptionForForm = campaignDescription || projectDescription || '';
      const campaignState = campaignResponse.state || campaignResponse.status || 'IN_PROGRESS';
      const launchedAt = campaignResponse.launchedAt || campaignResponse.startDate || '';
      const endAt = campaignResponse.endAt || campaignResponse.endDate || '';
      
      // Ne pas pré-remplir startDate si la campagne est validée (IN_PROGRESS ou FINISHED)
      // Les campagnes PENDING peuvent avoir leur startDate modifiée
      this.editForm = {
        description: descriptionForForm || campaign.campaignDescription || '',
        targetBudget: campaignResponse.targetBudget || null,
        shareOffered: campaignResponse.shareOffered || null,
        targetVolunteer: null, // Pas disponible pour les campagnes d'investissement
        startDate: (campaignState === 'IN_PROGRESS' || campaignState === 'FINISHED') 
          ? '' 
          : (launchedAt ? this.formatDateForInput(launchedAt) : ''),
        endDate: endAt ? this.formatDateForInput(endAt) : '',
        // Localization fields
        country: campaignResponse.localization?.country || '',
        town: campaignResponse.localization?.town || '',
        region: campaignResponse.localization?.region || '',
        street: campaignResponse.localization?.street || '',
        longitude: campaignResponse.localization?.longitude || null,
        latitude: campaignResponse.localization?.latitude || null
      };
      
      // Récupérer le projet associé depuis la map
      const projectId = campaignResponse.projectId || campaignResponse.projectResponse?.id;
      const project = projectId ? this.backendProjectsMap.get(projectId) : undefined;
      if (project) {
        this.selectedCampaignProject = project;
      } else {
        console.warn('Projet non trouvé dans la map pour la campagne', campaign.id);
        this.selectedCampaignProject = null;
      }
    } else {
      console.warn('Campagne non trouvée dans la map, utilisation des données transformées disponibles');
      console.warn('ATTENTION: Ne pas appeler getCampaignById() pour éviter une erreur 401 et une redirection');
      
      // NE PAS appeler getCampaignById() car cela pourrait déclencher une erreur 401
      // Utiliser les données de la campagne transformée qui sont déjà disponibles
      this.selectedCampaignRaw = null;
      
      // Pré-remplir le formulaire avec les données disponibles
      this.editForm = {
        description: campaign.campaignDescription || '',
        targetBudget: this.parseNumberFromString(campaign.targetBudget) || null,
        shareOffered: this.parseNumberFromString(campaign.shareOffered) || null,
        targetVolunteer: null,
        startDate: '',
        endDate: campaign.endDate ? this.parseDateFromString(campaign.endDate) : '',
        // Localization fields
        country: campaign.localization?.country || '',
        town: campaign.localization?.town || '',
        region: campaign.localization?.region || '',
        street: campaign.localization?.street || '',
        longitude: campaign.localization?.longitude || null,
        latitude: campaign.localization?.latitude || null
      };
      
      this.selectedCampaignProject = null;
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedCampaign = null;
    this.selectedCampaignRaw = null;
    this.selectedCampaignProject = null;
    this.errorMessage = '';
    this.editForm = {
      description: '',
      targetBudget: null,
      shareOffered: null,
      targetVolunteer: null,
      startDate: '',
      endDate: '',
      // Localization fields
      country: '',
      town: '',
      region: '',
      street: '',
      longitude: null,
      latitude: null
    };
  }

  onSubmitEdit() {
    if (!this.selectedCampaign) return;

    // Valider la date de début de campagne avant la soumission (seulement si la campagne n'est pas validée)
    if (!this.isCampaignValidated() && this.editForm.startDate) {
      const campaignStartDate = new Date(this.editForm.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      campaignStartDate.setHours(0, 0, 0, 0);
      
      if (campaignStartDate < today) {
        this.errorMessage = 'La date de début ne peut pas être antérieure à aujourd\'hui.';
        return;
      }
    }


    // Préparer les données pour la mise à jour (uniquement les champs modifiés)
    const updateData: any = {
      id: this.selectedCampaign.id
    };

    // Ajouter les champs modifiés
    if (this.editForm.description && this.editForm.description.trim()) {
      updateData.description = this.editForm.description.trim();
    }
    
    if (this.editForm.targetBudget !== null && this.editForm.targetBudget > 0) {
      updateData.targetBudget = this.editForm.targetBudget;
    }
    
    if (this.editForm.shareOffered !== null && this.editForm.shareOffered >= 0) {
      updateData.shareOffered = this.editForm.shareOffered;
    }

    // Ne pas envoyer la date de début si la campagne est validée
    if (!this.isCampaignValidated() && this.editForm.startDate) {
      const date = new Date(this.editForm.startDate);
      if (!isNaN(date.getTime())) {
        updateData.startDate = date.toISOString().slice(0, 19);
      }
    }

    if (this.editForm.endDate) {
      const date = new Date(this.editForm.endDate);
      if (!isNaN(date.getTime())) {
        updateData.endDate = date.toISOString().slice(0, 19);
      }
    }
    
    // Ajouter les données de localisation dans un objet imbriqué
    // Always send all localization fields to ensure proper handling by backend
    const localizationData: any = {
      country: this.editForm.country ? this.editForm.country.trim() : '',
      town: this.editForm.town ? this.editForm.town.trim() : '',
      region: (this.editForm.region !== null && this.editForm.region !== undefined) ? this.editForm.region.trim() : '',
      street: (this.editForm.street !== null && this.editForm.street !== undefined) ? this.editForm.street.trim() : '',
      longitude: (this.editForm.longitude !== null && this.editForm.longitude !== undefined && !isNaN(this.editForm.longitude)) ? this.editForm.longitude : null,
      latitude: (this.editForm.latitude !== null && this.editForm.latitude !== undefined && !isNaN(this.editForm.latitude)) ? this.editForm.latitude : null
    };
    
    // Inclure les données de localisation
    updateData.localization = localizationData;
    
    // Log the data being sent
    console.log('Prepared update data:', updateData);

    this.isLoading = true;
    this.errorMessage = '';

    // Appeler l'API pour mettre à jour la campagne
    this.campaignService.updateCampaign(updateData).subscribe({
      next: (response) => {
        console.log('Campagne mise à jour avec succès:', response);
        this.confirmationSuccess = true;
        this.confirmationMessage = 'Votre campagne a été modifiée avec succès !';
        this.showConfirmationModal = true;
        this.closeEditModal();
        this.isLoading = false;
        // Recharger immédiatement avec un petit délai pour s'assurer que le backend a traité la mise à jour
        console.log('Reloading campaigns after successful update...');
        setTimeout(() => {
          this.loadCampaigns();
          this.loadCampaignSummary();
        }, 500);
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          this.showConfirmationModal = false;
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.confirmationSuccess = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la modification de la campagne.';
        this.confirmationMessage = error.error?.message || 'Une erreur est survenue lors de la modification de la campagne.';
        this.showConfirmationModal = true;
        this.isLoading = false;
      }
    });
  }

  openEditDonModal(campaign: Campaign, event?: Event) {
    console.log('=== openEditDonModal appelé ===', { campaignId: campaign.id, event });
    
    // Empêcher la propagation de l’événement IMMÉDIATEMENT
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    // Vérifier si la campagne peut être modifiée
    if (!this.canEditCampaign(campaign)) {
      console.warn('Tentative de modification d\'une campagne clôturée - bloquée');
      this.errorMessage = 'Cette campagne est clôturée et ne peut plus être modifiée.';
      return;
    }
    
    // S'assurer que le modal s'ouvre immédiatement
    this.selectedCampaign = campaign;
    this.showEditDonModal = true;
    this.errorMessage = '';
    
    // Récupérer les données complètes de la campagne depuis la map
    const campaignResponse = this.backendCampaignsMap.get(campaign.id);
    
    if (campaignResponse) {
      this.selectedCampaignRaw = campaignResponse;
      
      // Pré-remplir le formulaire avec les données actuelles
      const campaignDescription = typeof campaignResponse.description === 'string' ? campaignResponse.description : '';
      const projectDescription = campaignResponse.projectResponse?.description || campaignResponse.projectResponse?.resume || '';
      const descriptionForForm = campaignDescription || projectDescription || '';
      const launchedAt = campaignResponse.launchedAt || campaignResponse.startDate || '';
      const endAt = campaignResponse.endAt || campaignResponse.endDate || '';
      
      this.editForm = {
        description: descriptionForForm || campaign.campaignDescription || '',
        targetBudget: campaignResponse.targetBudget || null,
        shareOffered: null, // Pas de parts pour les campagnes de don
        targetVolunteer: null,
        startDate: launchedAt ? this.formatDateForInput(launchedAt) : '',
        endDate: endAt ? this.formatDateForInput(endAt) : '',
        // Localization fields
        country: campaignResponse.localization?.country || '',
        town: campaignResponse.localization?.town || '',
        region: campaignResponse.localization?.region || '',
        street: campaignResponse.localization?.street || '',
        longitude: campaignResponse.localization?.longitude || null,
        latitude: campaignResponse.localization?.latitude || null
      };
      
      // Récupérer le projet associé depuis la map
      const projectId = campaignResponse.projectId || campaignResponse.projectResponse?.id;
      const project = projectId ? this.backendProjectsMap.get(projectId) : undefined;
      if (project) {
        this.selectedCampaignProject = project;
      } else {
        this.selectedCampaignProject = null;
      }
    } else {
      console.warn('Campagne non trouvée dans la map, utilisation des données transformées');
      this.selectedCampaignRaw = null;
      
      this.editForm = {
        description: campaign.campaignDescription || '',
        targetBudget: this.parseNumberFromString(campaign.targetBudget) || null,
        shareOffered: null,
        targetVolunteer: null,
        startDate: '',
        endDate: campaign.endDate ? this.parseDateFromString(campaign.endDate) : '',
        // Localization fields
        country: campaign.localization?.country || '',
        town: campaign.localization?.town || '',
        region: campaign.localization?.region || '',
        street: campaign.localization?.street || '',
        longitude: campaign.localization?.longitude || null,
        latitude: campaign.localization?.latitude || null
      };
      
      this.selectedCampaignProject = null;
    }
  }

  closeEditDonModal() {
    this.showEditDonModal = false;
    this.selectedCampaign = null;
    this.selectedCampaignRaw = null;
    this.selectedCampaignProject = null;
    this.errorMessage = '';
    this.editForm = {
      description: '',
      targetBudget: null,
      shareOffered: null,
      targetVolunteer: null,
      startDate: '',
      endDate: '',
      // Localization fields
      country: '',
      town: '',
      region: '',
      street: '',
      longitude: null,
      latitude: null
    };
  }

  onSubmitEditDon() {
    if (!this.selectedCampaign) return;

    // Valider la date de début de campagne avant la soumission (seulement si la campagne n'est pas validée)
    if (!this.isCampaignValidated() && this.editForm.startDate) {
      const campaignStartDate = new Date(this.editForm.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      campaignStartDate.setHours(0, 0, 0, 0);
      
      if (campaignStartDate < today) {
        this.errorMessage = 'La date de début ne peut pas être antérieure à aujourd\'hui.';
        return;
      }
    }


    // Préparer les données pour la mise à jour
    const updateData: any = {
      id: this.selectedCampaign.id
    };

    // Ajouter les champs modifiés
    if (this.editForm.description && this.editForm.description.trim()) {
      updateData.description = this.editForm.description.trim();
    }
    
    if (this.editForm.targetBudget !== null && this.editForm.targetBudget > 0) {
      updateData.targetBudget = this.editForm.targetBudget;
    }

    // Ne pas envoyer la date de début si la campagne est validée
    if (!this.isCampaignValidated() && this.editForm.startDate) {
      const date = new Date(this.editForm.startDate);
      if (!isNaN(date.getTime())) {
        updateData.startDate = date.toISOString().slice(0, 19);
      }
    }

    if (this.editForm.endDate) {
      const date = new Date(this.editForm.endDate);
      if (!isNaN(date.getTime())) {
        updateData.endDate = date.toISOString().slice(0, 19);
      }
    }
    
    // Ajouter les données de localisation dans un objet imbriqué
    const localizationData: any = {};
    let hasLocalizationData = false;
    
    if (this.editForm.country) {
      localizationData.country = this.editForm.country;
      hasLocalizationData = true;
    }
    if (this.editForm.town) {
      localizationData.town = this.editForm.town;
      hasLocalizationData = true;
    }
    if (this.editForm.region !== null && this.editForm.region !== '') {
      localizationData.region = this.editForm.region;
      hasLocalizationData = true;
    }
    if (this.editForm.street !== null && this.editForm.street !== '') {
      localizationData.street = this.editForm.street;
      hasLocalizationData = true;
    }
    if (this.editForm.longitude !== null) {
      localizationData.longitude = this.editForm.longitude;
      hasLocalizationData = true;
    }
    if (this.editForm.latitude !== null) {
      localizationData.latitude = this.editForm.latitude;
      hasLocalizationData = true;
    }
    
    // Inclure les données de localisation seulement si au moins un champ est rempli
    if (hasLocalizationData) {
      updateData.localization = localizationData;
    }
    
    // Log the data being sent
    console.log('Prepared update data for donation campaign:', updateData);

    this.isLoading = true;
    this.errorMessage = '';

    // Appeler l'API pour mettre à jour la campagne
    this.campaignService.updateCampaign(updateData).subscribe({
      next: (response) => {
        console.log('Campagne de don mise à jour avec succès:', response);
        this.confirmationSuccess = true;
        this.confirmationMessage = 'Votre campagne de don a été modifiée avec succès !';
        this.showConfirmationModal = true;
        this.closeEditDonModal();
        this.isLoading = false;
        // Recharger immédiatement avec un petit délai pour s'assurer que le backend a traité la mise à jour
        console.log('Reloading campaigns after successful donation campaign update...');
        setTimeout(() => {
          this.loadCampaigns();
          this.loadCampaignSummary();
        }, 500);
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          this.showConfirmationModal = false;
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.confirmationSuccess = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la modification de la campagne de don.';
        this.confirmationMessage = error.error?.message || 'Une erreur est survenue lors de la modification de la campagne de don.';
        this.showConfirmationModal = true;
        this.isLoading = false;
      }
    });
  }

  openEditBenevolatModal(campaign: Campaign, event?: Event) {
    console.log('=== openEditBenevolatModal appelé ===', { campaignId: campaign.id, event });
    
    // Empêcher la propagation de l’événement IMMÉDIATEMENT
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    // Vérifier si la campagne peut être modifiée
    if (!this.canEditCampaign(campaign)) {
      console.warn('Tentative de modification d\'une campagne clôturée - bloquée');
      this.errorMessage = 'Cette campagne est clôturée et ne peut plus être modifiée.';
      return;
    }
    
    // S'assurer que le modal s'ouvre immédiatement
    this.selectedCampaign = campaign;
    this.showEditBenevolatModal = true;
    this.errorMessage = '';
    
    // Récupérer les données complètes de la campagne depuis la map
    const campaignResponse = this.backendCampaignsMap.get(campaign.id);
    
    if (campaignResponse) {
      this.selectedCampaignRaw = campaignResponse;
      
      // Pré-remplir le formulaire avec les données actuelles
      const campaignDescription = typeof campaignResponse.description === 'string' ? campaignResponse.description : '';
      const projectDescription = campaignResponse.projectResponse?.description || campaignResponse.projectResponse?.resume || '';
      const descriptionForForm = campaignDescription || projectDescription || '';
      const campaignState = campaignResponse.state || campaignResponse.status || 'IN_PROGRESS';
      const launchedAt = campaignResponse.launchedAt || campaignResponse.startDate || '';
      const endAt = campaignResponse.endAt || campaignResponse.endDate || '';
      
      // Ne pas pré-remplir startDate si la campagne est validée (IN_PROGRESS ou FINISHED)
      // Les campagnes PENDING peuvent avoir leur startDate modifiée
      this.editForm = {
        description: '', // Ne pas inclure la description pour les campagnes de bénévolat
        targetBudget: null,
        shareOffered: null,
        targetVolunteer: campaignResponse.targetVolunteer || null,
        startDate: (campaignState === 'IN_PROGRESS' || campaignState === 'FINISHED') 
          ? '' 
          : (launchedAt ? this.formatDateForInput(launchedAt) : ''),
        endDate: endAt ? this.formatDateForInput(endAt) : '',
        // Localization fields
        country: campaignResponse.localization?.country || '',
        town: campaignResponse.localization?.town || '',
        region: campaignResponse.localization?.region || '',
        street: campaignResponse.localization?.street || '',
        longitude: campaignResponse.localization?.longitude || null,
        latitude: campaignResponse.localization?.latitude || null
      };
      
      // Récupérer le projet associé depuis la map
      const projectId = campaignResponse.projectId || campaignResponse.projectResponse?.id;
      const project = projectId ? this.backendProjectsMap.get(projectId) : undefined;
      if (project) {
        this.selectedCampaignProject = project;
      } else {
        this.selectedCampaignProject = null;
      }
    } else {
      console.warn('Campagne non trouvée dans la map, utilisation des données transformées');
      this.selectedCampaignRaw = null;
      
      this.editForm = {
        description: '', // Ne pas inclure la description pour les campagnes de bénévolat
        targetBudget: null,
        shareOffered: null,
        targetVolunteer: null,
        startDate: '',
        endDate: campaign.endDate ? this.parseDateFromString(campaign.endDate) : '',
        // Localization fields
        country: campaign.localization?.country || '',
        town: campaign.localization?.town || '',
        region: campaign.localization?.region || '',
        street: campaign.localization?.street || '',
        longitude: campaign.localization?.longitude || null,
        latitude: campaign.localization?.latitude || null
      };
      
      this.selectedCampaignProject = null;
    }
  }

  closeEditBenevolatModal() {
    this.showEditBenevolatModal = false;
    this.selectedCampaign = null;
    this.selectedCampaignRaw = null;
    this.selectedCampaignProject = null;
    this.errorMessage = '';
    this.editForm = {
      description: '', // Ne pas inclure la description pour les campagnes de bénévolat
      targetBudget: null,
      shareOffered: null,
      targetVolunteer: null,
      startDate: '',
      endDate: '',
      // Localization fields
      country: '',
      town: '',
      region: '',
      street: '',
      longitude: null,
      latitude: null
    };
  }

  onSubmitEditBenevolat() {
    if (!this.selectedCampaign) return;

    // Valider la date de début de campagne avant la soumission (seulement si la campagne n'est pas validée)
    if (!this.isCampaignValidated() && this.editForm.startDate) {
      const campaignStartDate = new Date(this.editForm.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      campaignStartDate.setHours(0, 0, 0, 0);
      
      if (campaignStartDate < today) {
        this.errorMessage = 'La date de début ne peut pas être antérieure à aujourd\'hui.';
        return;
      }
    }


    // Préparer les données pour la mise à jour
    const updateData: any = {
      id: this.selectedCampaign.id
    };

    // Ajouter les champs modifiés
    // Ne pas inclure la description pour les campagnes de bénévolat
    if (this.editForm.targetVolunteer !== null && this.editForm.targetVolunteer > 0) {
      updateData.targetVolunteer = this.editForm.targetVolunteer;
    }

    // Ne pas envoyer la date de début si la campagne est validée
    if (!this.isCampaignValidated() && this.editForm.startDate) {
      const date = new Date(this.editForm.startDate);
      if (!isNaN(date.getTime())) {
        updateData.startDate = date.toISOString().slice(0, 19);
      }
    }

    if (this.editForm.endDate) {
      const date = new Date(this.editForm.endDate);
      if (!isNaN(date.getTime())) {
        updateData.endDate = date.toISOString().slice(0, 19);
      }
    }
    
    // Ajouter les données de localisation dans un objet imbriqué
    const localizationData: any = {};
    let hasLocalizationData = false;
    
    if (this.editForm.country) {
      localizationData.country = this.editForm.country;
      hasLocalizationData = true;
    }
    if (this.editForm.town) {
      localizationData.town = this.editForm.town;
      hasLocalizationData = true;
    }
    if (this.editForm.region !== null && this.editForm.region !== '') {
      localizationData.region = this.editForm.region;
      hasLocalizationData = true;
    }
    if (this.editForm.street !== null && this.editForm.street !== '') {
      localizationData.street = this.editForm.street;
      hasLocalizationData = true;
    }
    if (this.editForm.longitude !== null) {
      localizationData.longitude = this.editForm.longitude;
      hasLocalizationData = true;
    }
    if (this.editForm.latitude !== null) {
      localizationData.latitude = this.editForm.latitude;
      hasLocalizationData = true;
    }
    
    // Inclure les données de localisation seulement si au moins un champ est rempli
    if (hasLocalizationData) {
      updateData.localization = localizationData;
    }
    
    // Log the data being sent
    console.log('Prepared update data for volunteer campaign:', updateData);

    this.isLoading = true;
    this.errorMessage = '';

    // Appeler l'API pour mettre à jour la campagne
    this.campaignService.updateCampaign(updateData).subscribe({
      next: (response) => {
        console.log('Campagne de bénévolat mise à jour avec succès:', response);
        this.confirmationSuccess = true;
        this.confirmationMessage = 'Votre campagne de bénévolat a été modifiée avec succès !';
        this.showConfirmationModal = true;
        this.closeEditBenevolatModal();
        this.isLoading = false;
        // Recharger immédiatement avec un petit délai pour s'assurer que le backend a traité la mise à jour
        console.log('Reloading campaigns after successful volunteer campaign update...');
        setTimeout(() => {
          this.loadCampaigns();
          this.loadCampaignSummary();
        }, 500);
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          this.showConfirmationModal = false;
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.confirmationSuccess = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la modification de la campagne de bénévolat.';
        this.confirmationMessage = error.error?.message || 'Une erreur est survenue lors de la modification de la campagne de bénévolat.';
        this.showConfirmationModal = true;
        this.isLoading = false;
      }
    });
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

    // Navigation vers la page appropriée selon le type en utilisant l’événement viewChange
    if (type === 'investissement') {
      this.viewChange.emit('nouvelle-campagne');
    } else if (type === 'don') {
      this.viewChange.emit('nouvelle-campagne-don');
    } else if (type === 'benevolat') {
      this.viewChange.emit('nouvelle-campagne-benevolat');
    }
  }

  // Méthode pour recharger les campagnes
  refreshCampaigns() {
    this.loadCampaigns();
    this.loadCampaignSummary();
  }

  // Méthode pour gérer les erreurs
  clearError() {
    this.errorMessage = '';
  }
  
  // Fermer le modal de confirmation
  closeConfirmationModal() {
    this.showConfirmationModal = false;
    this.isConfirmationMode = false;
    this.pendingCloseCampaign = null;
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

  // Parser un nombre depuis une chaîne (ex: "100 FCFA" ou "100%" -> 100)
  private parseNumberFromString(value: string): number | null {
    if (!value) return null;
    try {
      // Extraire les chiffres de la chaîene (supporte les décimales)
      const match = value.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        return parseFloat(match[1]);
      }
      return null;
    } catch (error) {
      console.error('Erreur lors du parsing du nombre:', error);
      return null;
    }
  }


  // Valider la date de début de campagne par rapport à aujourd'hui
  validateCampaignStartDate() {
    if (this.editForm.startDate) {
      const campaignStartDate = new Date(this.editForm.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      campaignStartDate.setHours(0, 0, 0, 0);
      
      if (campaignStartDate < today) {
        this.errorMessage = 'La date de début ne peut pas être antérieure à aujourd\'hui.';
        return false;
      } else {
        // Réinitialiser l'erreur si la date est valide
        if (this.errorMessage && this.errorMessage.includes('date de début')) {
          this.errorMessage = '';
        }
      }
    }
    return true;
  }

  // Obtenir la date minimale (aujourd'hui) pour la date de début de campagne
  getMinStartDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
