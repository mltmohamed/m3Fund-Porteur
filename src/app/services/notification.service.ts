import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface NotificationResponse {
  id: number;
  type: 'CAMPAIGN' | 'PROJECT' | 'PAYMENT' | 'SYSTEM' | string;
  title: string;
  message?: string;
  content?: string;
  createdAt?: string;
  sentAt?: string;
  read?: boolean;
  isRead?: boolean;
  senderName?: string;
  actionUrl?: string;
}

export interface NotificationDisplay {
  id: number;
  sender: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupérer les notifications récentes (pour le header) - limité aux 3 dernières
  getRecentNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/notifications`).pipe(
      tap((notifications: NotificationResponse[]) => {
        const unreadCount = notifications.filter((n: NotificationResponse) => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
      }),
      // Trier par date décroissante et prendre les 3 premières
      map((notifications: NotificationResponse[]) => {
        return notifications.sort((a, b) => {
          const dateA = new Date(a.sentAt || a.createdAt || '');
          const dateB = new Date(b.sentAt || b.createdAt || '');
          return dateB.getTime() - dateA.getTime();
        }).slice(0, 3);
      })
    );
  }

  // Récupérer toutes les notifications
  getAllNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/notifications`);
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: number): Observable<void> {
    // Note: Cet endpoint n'existe peut-être pas encore dans le backend
    return this.http.patch<void>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead(): Observable<void> {
    // Note: Cet endpoint n'existe peut-être pas encore dans le backend
    return this.http.patch<void>(`${this.apiUrl}/notifications/read-all`, {});
  }

  // Transformer les notifications du backend en format d'affichage
  transformNotificationsForDisplay(notifications: NotificationResponse[]): NotificationDisplay[] {
    return notifications.map(notification => {
      const timeStr = (notification.sentAt || notification.createdAt || '');
      const msg = notification.message || notification.content || '';
      const read = (notification.read ?? notification.isRead ?? false);
      let date: Date;
      try {
        const normalized = typeof timeStr === 'string' && timeStr.includes('T') ? timeStr : String(timeStr).replace(' ', 'T');
        date = new Date(normalized);
      } catch {
        date = new Date();
      }
      return {
        id: notification.id,
        sender: notification.senderName || this.getSenderFromType(notification.type),
        message: msg,
        time: this.getTimeAgo(date),
        read,
        type: notification.type
      };
    });
  }

  // Permettre aux composants de synchroniser manuellement le compteur
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  // Obtenir le nom de l'expéditeur selon le type
  private getSenderFromType(type: string): string {
    const senderMap: { [key: string]: string } = {
      'CAMPAIGN': 'Campagne',
      'PROJECT': 'Projet',
      'PAYMENT': 'Paiement',
      'SYSTEM': 'Système'
    };
    return senderMap[type] || 'Notification';
  }

  // Calculer le temps écoulé
  private getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return '1 jour';
    if (days < 7) return `${days} jours`;
    
    return timestamp.toLocaleDateString('fr-FR');
  }

  // Données mock pour les tests
  private getMockNotifications(): NotificationResponse[] {
    return [
      {
        id: 1,
        type: 'CAMPAIGN',
        title: 'Nouvelle contribution',
        message: 'Vous avez reçu une contribution de 50,000 FCFA',
        createdAt: new Date(Date.now() - 2 * 60000).toISOString(), // 2 min ago
        read: false,
        actionUrl: '/campagnes'
      },
      {
        id: 2,
        type: 'PROJECT',
        title: 'Projet validé',
        message: 'Votre projet a été validé par l\'équipe m3Fund',
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 min ago
        read: false,
        actionUrl: '/projet'
      },
      {
        id: 3,
        type: 'PAYMENT',
        title: 'Paiement traité',
        message: 'Votre paiement de 100,000 FCFA a été traité',
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
        read: false,
        actionUrl: '/fonds'
      },
      {
        id: 4,
        type: 'SYSTEM',
        title: 'Mise à jour',
        message: 'Nouvelle version disponible avec de nouvelles fonctionnalités',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2h ago
        read: true
      },
      {
        id: 5,
        type: 'CAMPAIGN',
        title: 'Objectif atteint',
        message: 'Félicitations ! Votre campagne a atteint son objectif',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
        read: true,
        actionUrl: '/campagnes'
      }
    ];
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }
}

