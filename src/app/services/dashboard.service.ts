import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, DashboardSummary, RecentActivity, DashboardData } from '../interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Récupérer les statistiques du dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/dashboard/stats`);
  }

  // Récupérer les données complètes du dashboard
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.API_URL}/dashboard`);
  }

  // Récupérer les activités récentes
  getRecentActivities(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.API_URL}/dashboard/activities`);
  }

  // Récupérer les projets les plus populaires
  getTopProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/dashboard/top-projects`);
  }

  // Récupérer les campagnes les plus populaires
  getTopCampaigns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/dashboard/top-campaigns`);
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
}
