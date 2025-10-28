import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { DashboardStats, DashboardSummary, RecentActivity, DashboardData } from '../interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:7878/api/v1';

  constructor(private http: HttpClient) {}

  // Récupérer les statistiques du dashboard
  getDashboardStats(): Observable<DashboardStats> {
    // Utiliser les endpoints existants pour construire les statistiques
    return new Observable(observer => {
      forkJoin({
        projects: this.http.get<any[]>(`${this.API_URL}/public/projects`),
        campaigns: this.http.get<any[]>(`${this.API_URL}/public/campaigns`)
      }).subscribe({
        next: (data) => {
          const stats: DashboardStats = {
            totalProjects: data.projects.length,
            totalCampaigns: data.campaigns.length,
            totalFunds: this.calculateTotalFunds(data.projects, data.campaigns),
            totalUsers: 1, // L'utilisateur connecté
            activeProjects: data.projects.filter(p => p.isValidated === true).length,
            activeCampaigns: data.campaigns.filter(c => c.state === 'ACTIVE').length,
            completedProjects: data.projects.filter(p => !p.isValidated).length,
            completedCampaigns: data.campaigns.filter(c => c.state === 'COMPLETED').length
          };
          observer.next(stats);
          observer.complete();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des statistiques:', error);
          // Retourner les statistiques par défaut
          observer.next({
            totalProjects: 0,
            totalCampaigns: 0,
            totalFunds: 0,
            totalUsers: 0,
            activeProjects: 0,
            activeCampaigns: 0,
            completedProjects: 0,
            completedCampaigns: 0
          });
          observer.complete();
        }
      });
    });
  }

  // Récupérer les données complètes du dashboard
  getDashboardData(): Observable<DashboardData> {
    // Utiliser les endpoints existants pour construire les données du dashboard
    return new Observable(observer => {
      // Appeler les endpoints existants en parallèle
      forkJoin({
        projects: this.http.get<any[]>(`${this.API_URL}/public/projects`),
        campaigns: this.http.get<any[]>(`${this.API_URL}/public/campaigns`),
        user: this.http.get<any>(`${this.API_URL}/users/me`)
      }).subscribe({
        next: (data) => {
          // Construire les données du dashboard à partir des réponses
          const dashboardData: DashboardData = {
            stats: {
              totalProjects: data.projects.length,
              totalCampaigns: data.campaigns.length,
              totalFunds: this.calculateTotalFunds(data.projects, data.campaigns),
              totalUsers: 1, // L'utilisateur connecté
              activeProjects: data.projects.filter(p => p.isValidated === true).length,
              activeCampaigns: data.campaigns.filter(c => c.state === 'ACTIVE').length,
              completedProjects: data.projects.filter(p => !p.isValidated).length,
              completedCampaigns: data.campaigns.filter(c => c.state === 'COMPLETED').length
            },
            recentActivities: this.buildRecentActivities(data.projects, data.campaigns),
            topProjects: data.projects.slice(0, 3),
            topCampaigns: data.campaigns.slice(0, 3)
          };
          observer.next(dashboardData);
          observer.complete();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des données:', error);
          // Retourner les données par défaut en cas d'erreur
          observer.next(this.getDefaultDashboardData());
          observer.complete();
        }
      });
    });
  }

  // Récupérer les activités récentes
  getRecentActivities(): Observable<RecentActivity[]> {
    return new Observable(observer => {
      forkJoin({
        projects: this.http.get<any[]>(`${this.API_URL}/public/projects`),
        campaigns: this.http.get<any[]>(`${this.API_URL}/public/campaigns`)
      }).subscribe({
        next: (data) => {
          const activities = this.buildRecentActivities(data.projects, data.campaigns);
          observer.next(activities);
          observer.complete();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des activités:', error);
          observer.next([]);
          observer.complete();
        }
      });
    });
  }

  // Récupérer les projets les plus populaires
  getTopProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/public/projects`);
  }

  // Récupérer les campagnes les plus populaires
  getTopCampaigns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/public/campaigns`);
  }

  // Transformer les statistiques en cartes de résumé
  transformStatsToSummary(stats: DashboardStats): DashboardSummary[] {
    return [
      {
        title: 'Total Projets',
        value: stats.totalProjects.toString(),
        icon: 'fas fa-project-diagram',
        color: '#3B82F6',
        trend: {
          value: 12,
          direction: 'up'
        }
      },
      {
        title: 'Total Campagnes',
        value: stats.totalCampaigns.toString(),
        icon: 'fas fa-bullhorn',
        color: '#10B981',
        trend: {
          value: 8,
          direction: 'up'
        }
      },
      {
        title: 'Fonds Collectés',
        value: `${(stats.totalFunds / 1000000).toFixed(1)}M FCFA`,
        icon: 'fas fa-coins',
        color: '#F59E0B',
        trend: {
          value: 15,
          direction: 'up'
        }
      },
      {
        title: 'Utilisateurs Actifs',
        value: stats.totalUsers.toString(),
        icon: 'fas fa-users',
        color: '#8B5CF6',
        trend: {
          value: 5,
          direction: 'up'
        }
      }
    ];
  }

  // Transformer les activités récentes
  transformActivities(activities: RecentActivity[]): RecentActivity[] {
    return activities.map(activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  }

  // Obtenir les données par défaut en cas d'erreur
  getDefaultDashboardData(): DashboardData {
    return {
      stats: {
        totalProjects: 0,
        totalCampaigns: 0,
        totalFunds: 0,
        totalUsers: 0,
        activeProjects: 0,
        activeCampaigns: 0,
        completedProjects: 0,
        completedCampaigns: 0
      },
      recentActivities: [],
      topProjects: [],
      topCampaigns: []
    };
  }

  // Obtenir les cartes de résumé par défaut
  getDefaultSummaryCards(): DashboardSummary[] {
    return [
      {
        title: 'Total Projets',
        value: '0',
        icon: 'fas fa-project-diagram',
        color: '#3B82F6'
      },
      {
        title: 'Total Campagnes',
        value: '0',
        icon: 'fas fa-bullhorn',
        color: '#10B981'
      },
      {
        title: 'Fonds Collectés',
        value: '0 FCFA',
        icon: 'fas fa-coins',
        color: '#F59E0B'
      },
      {
        title: 'Utilisateurs Actifs',
        value: '0',
        icon: 'fas fa-users',
        color: '#8B5CF6'
      }
    ];
  }

  // Calculer le total des fonds collectés
  private calculateTotalFunds(projects: any[], campaigns: any[]): number {
    // Calculer les fonds des campagnes basés sur le targetBudget
    const projectFunds = projects.reduce((total, project) => {
      // Si le projet a des fonds directement
      return total + (project.fundsRaised || 0);
    }, 0);
    
    const campaignFunds = campaigns.reduce((total, campaign) => {
      // Utiliser le budget cible comme estimation des fonds
      return total + (campaign.targetBudget || 0);
    }, 0);
    
    return projectFunds + campaignFunds;
  }

  // Construire les activités récentes
  private buildRecentActivities(projects: any[], campaigns: any[]): RecentActivity[] {
    const activities: RecentActivity[] = [];
    
    // Ajouter les projets récents
    projects.slice(0, 3).forEach(project => {
      activities.push({
        id: project.id,
        type: 'project',
        title: `Nouveau projet: ${project.name}`,
        description: `Le projet "${project.name}" a été créé`,
        timestamp: project.createdAt || new Date().toISOString(),
        status: project.isValidated ? 'validated' : 'pending',
        icon: 'fas fa-lightbulb'
      });
    });

    // Ajouter les campagnes récentes
    campaigns.slice(0, 3).forEach(campaign => {
      activities.push({
        id: campaign.id,
        type: 'campaign',
        title: `Nouvelle campagne pour: ${campaign.projectResponse?.name || 'Projet'}`,
        description: `Une campagne de type ${campaign.type} a été lancée`,
        timestamp: campaign.launchedAt || new Date().toISOString(),
        status: campaign.state,
        icon: 'fas fa-bullhorn'
      });
    });

    // Trier par date (plus récent en premier)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
