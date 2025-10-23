import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectSummary, ProjectResponse } from '../../interfaces/project.interface';

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
    this.projectService.getProjectSummary().subscribe({
      next: (backendSummary) => {
        this.summaryCards = this.projectService.transformSummaryData(backendSummary);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
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

  openEditModal(project: Project) {
    this.selectedProject = project;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedProject = null;
  }

  onSubmitEdit() {
    if (this.selectedProject) {
      // Ici vous pouvez implémenter la logique de mise à jour
      console.log('Modification soumise pour:', this.selectedProject);
      this.closeEditModal();
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
