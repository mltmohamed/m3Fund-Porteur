import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, NotificationResponse } from '../../services/notification.service';

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'campaign' | 'project' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  
  // Filtres
  selectedFilter: string = 'all';
  showOnlyUnread: boolean = false;

  // Statistiques
  get totalNotifications(): number {
    return this.notifications.length;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get readCount(): number {
    return this.notifications.filter(n => n.read).length;
  }

  filterOptions = [
    { value: 'all', label: 'Toutes', icon: 'fas fa-inbox' },
    { value: 'campaign', label: 'Campagnes', icon: 'fas fa-bullhorn' },
    { value: 'project', label: 'Projets', icon: 'fas fa-project-diagram' },
    { value: 'payment', label: 'Paiements', icon: 'fas fa-dollar-sign' },
    { value: 'system', label: 'Système', icon: 'fas fa-cog' }
  ];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getAllNotifications().subscribe({
      next: (backendNotifications: NotificationResponse[]) => {
        this.notifications = this.transformBackendNotifications(backendNotifications);
        this.applyFilters();
        console.log('Notifications de la page chargées:', this.notifications);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notifications:', error);
        // En cas d'erreur, utiliser les données mock
        this.notifications = this.generateMockNotifications();
        this.applyFilters();
      }
    });
  }

  transformBackendNotifications(backendNotifications: NotificationResponse[]): Notification[] {
    return backendNotifications.map(n => {
      const typeMap: { [key: string]: 'campaign' | 'project' | 'payment' | 'system' } = {
        'CAMPAIGN': 'campaign',
        'PROJECT': 'project',
        'PAYMENT': 'payment',
        'SYSTEM': 'system'
      };

      const colorMap: { [key: string]: string } = {
        'CAMPAIGN': '#06A664',
        'PROJECT': '#4a90e2',
        'PAYMENT': '#0066cc',
        'SYSTEM': '#9c27b0'
      };

      const iconMap: { [key: string]: string } = {
        'CAMPAIGN': 'fas fa-bullhorn',
        'PROJECT': 'fas fa-project-diagram',
        'PAYMENT': 'fas fa-dollar-sign',
        'SYSTEM': 'fas fa-cog'
      };

      return {
        id: n.id,
        type: typeMap[n.type] || 'info',
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt),
        read: n.read,
        actionUrl: n.actionUrl,
        actionLabel: n.actionUrl ? 'Voir plus' : undefined,
        icon: iconMap[n.type] || 'fas fa-info-circle',
        color: colorMap[n.type] || '#666'
      };
    });
  }

  generateMockNotifications(): Notification[] {
    return [
      {
        id: 1,
        type: 'campaign',
        title: 'Nouvelle contribution reçue',
        message: 'Vous avez reçu une contribution de 50,000 FCFA sur votre campagne "Plateforme de Télémédecine"',
        timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        read: false,
        actionUrl: '/campagnes',
        actionLabel: 'Voir la campagne',
        icon: 'fas fa-hand-holding-usd',
        color: '#06A664'
      },
      {
        id: 2,
        type: 'project',
        title: 'Projet validé',
        message: 'Votre projet "Construction d\'une École" a été validé par l\'équipe m3Fund',
        timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        read: false,
        actionUrl: '/projet',
        actionLabel: 'Voir le projet',
        icon: 'fas fa-check-circle',
        color: '#28a745'
      },
      {
        id: 3,
        type: 'payment',
        title: 'Paiement traité',
        message: 'Votre paiement de 100,000 FCFA a été traité avec succès',
        timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
        read: true,
        actionUrl: '/fonds',
        actionLabel: 'Voir les transactions',
        icon: 'fas fa-receipt',
        color: '#0066cc'
      },
      {
        id: 4,
        type: 'campaign',
        title: 'Campagne bientôt terminée',
        message: 'Votre campagne "Plateforme E-commerce" se termine dans 3 jours',
        timestamp: new Date(Date.now() - 5 * 3600000), // 5 hours ago
        read: true,
        actionUrl: '/campagnes',
        actionLabel: 'Voir la campagne',
        icon: 'fas fa-hourglass-end',
        color: '#ff9800'
      },
      {
        id: 5,
        type: 'system',
        title: 'Mise à jour de la plateforme',
        message: 'Une nouvelle version de m3Fund est disponible avec de nouvelles fonctionnalités',
        timestamp: new Date(Date.now() - 24 * 3600000), // 1 day ago
        read: true,
        actionUrl: undefined,
        actionLabel: undefined,
        icon: 'fas fa-sync-alt',
        color: '#9c27b0'
      },
      {
        id: 6,
        type: 'project',
        title: 'Nouveau commentaire',
        message: 'Un utilisateur a commenté votre projet "Application Mobile"',
        timestamp: new Date(Date.now() - 2 * 24 * 3600000), // 2 days ago
        read: true,
        actionUrl: '/projet',
        actionLabel: 'Voir le commentaire',
        icon: 'fas fa-comment',
        color: '#4a90e2'
      },
      {
        id: 7,
        type: 'payment',
        title: 'Paiement en attente',
        message: 'Votre paiement de 75,000 FCFA est en attente de validation',
        timestamp: new Date(Date.now() - 3 * 24 * 3600000), // 3 days ago
        read: true,
        actionUrl: '/fonds',
        actionLabel: 'Voir le détail',
        icon: 'fas fa-clock',
        color: '#ff9800'
      },
      {
        id: 8,
        type: 'campaign',
        title: 'Objectif atteint !',
        message: 'Félicitations ! Votre campagne "Plateforme de Télémédecine" a atteint son objectif de financement',
        timestamp: new Date(Date.now() - 5 * 24 * 3600000), // 5 days ago
        read: true,
        actionUrl: '/campagnes',
        actionLabel: 'Voir les détails',
        icon: 'fas fa-trophy',
        color: '#FFD700'
      }
    ];
  }

  applyFilters() {
    let filtered = [...this.notifications];

    // Filtre par type
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(n => n.type === this.selectedFilter);
    }

    // Filtre par statut de lecture
    if (this.showOnlyUnread) {
      filtered = filtered.filter(n => !n.read);
    }

    this.filteredNotifications = filtered;
    this.notificationService.updateUnreadCount(this.unreadCount);
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  toggleUnreadFilter() {
    this.showOnlyUnread = !this.showOnlyUnread;
    this.applyFilters();
  }

  markAsRead(notification: Notification) {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur lors du marquage comme lu:', error);
      }
    });
  }

  markAsUnread(notification: Notification) {
    // TODO: Implémenter l'appel API pour marquer comme non lu
    notification.read = false;
    this.applyFilters();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur lors du marquage de toutes les notifications:', error);
      }
    });
  }

  deleteNotification(notification: Notification) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.applyFilters();
    }
    // TODO: Appel API pour supprimer
  }

  deleteAllRead() {
    this.notifications = this.notifications.filter(n => !n.read);
    this.applyFilters();
    // TODO: Appel API pour supprimer toutes les notifications lues
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    
    return timestamp.toLocaleDateString('fr-FR');
  }

  handleAction(notification: Notification) {
    this.markAsRead(notification);
    if (notification.actionUrl) {
      // TODO: Navigation vers l'URL
      console.log('Navigation vers:', notification.actionUrl);
    }
  }
}

