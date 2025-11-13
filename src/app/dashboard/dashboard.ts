import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { Projects } from './projects/projects';
import { Campaigns } from './campaigns/campaigns';
import { Projet } from './projet/projet';
import { Fonds } from './fonds/fonds';
import { NouveauProjet } from './nouveau-projet/nouveau-projet';
import { NouvelleCampagne } from './nouvelle-campagne/nouvelle-campagne';
import { NouvelleCampagneDon } from './nouvelle-campagne-don/nouvelle-campagne-don';
import { NouvelleCampagneBenevolat } from './nouvelle-campagne-benevolat/nouvelle-campagne-benevolat';
import { Campagnes } from './campagnes/campagnes';
import { Profil } from './profil/profil';
import { Parametres } from './parametres/parametres';
import { Message } from './message/message';
import { DashboardService } from '../services/dashboard.service';
import { DashboardData, DashboardSummary } from '../interfaces/dashboard.interface';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Sidebar, Header, Projects, Campaigns, Projet, Fonds, NouveauProjet, NouvelleCampagne, NouvelleCampagneDon, NouvelleCampagneBenevolat, Campagnes, Profil, Parametres, Message],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  currentView: string = 'dashboard';
  isLoading = false;
  errorMessage = '';
  dashboardData: DashboardData | null = null;
  summaryCards: DashboardSummary[] = [];
  private viewChangeListener?: (event: Event) => void;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
    
    // Écouter les événements viewChanged émis par les composants enfants
    this.viewChangeListener = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newView = customEvent.detail;
      console.log('Dashboard - Événement viewChanged reçu:', newView);
      this.setView(newView);
    };
    
    document.addEventListener('viewChanged', this.viewChangeListener);
  }

  ngOnDestroy() {
    // Nettoyer le listener lors de la destruction du composant
    if (this.viewChangeListener) {
      document.removeEventListener('viewChanged', this.viewChangeListener);
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.summaryCards = this.dashboardService.transformStatsToSummary(data.stats);
        this.isLoading = false;
        console.log('Données du dashboard chargées:', data);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du dashboard:', error);
        this.errorMessage = 'Erreur lors du chargement des données';
        this.isLoading = false;
        // Utiliser les données par défaut
        this.dashboardData = this.dashboardService.getDefaultDashboardData();
        this.summaryCards = this.dashboardService.getDefaultSummaryCards();
      }
    });
  }

  setView(view: string) {
    this.currentView = view;
    // Émettre l'événement de changement de vue
    const event = new CustomEvent('viewChanged', { detail: view });
    document.dispatchEvent(event);
  }

  refreshDashboard() {
    this.loadDashboardData();
  }

  clearError() {
    this.errorMessage = '';
  }
}
