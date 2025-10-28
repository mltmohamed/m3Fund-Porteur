import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth';
import { NotificationService, NotificationDisplay } from '../../services/notification.service';
import { LogoutModal } from './logout-modal/logout-modal';

@Component({
  selector: 'app-header',
  imports: [CommonModule, LogoutModal],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  @Output() viewChange = new EventEmitter<string>();
  showNotifications = false;
  showCampaignModal = false;
  showLogoutModal = false;
  profileImageUrl: string = '';
  isLoading = false;
  unreadNotificationCount = 0;

  notifications: NotificationDisplay[] = [];

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadProfileImage();
    this.loadNotifications();
    
    // Écouter les changements de photo de profil
    document.addEventListener('profileImageUpdated', (event: any) => {
      console.log('Header - Événement profileImageUpdated reçu:', event.detail);
      this.profileImageUrl = event.detail;
      // Recharger l'image au cas où
      setTimeout(() => {
        this.loadProfileImage();
      }, 500);
    });
    
    // Écouter les changements de vue pour rafraîchir la photo
    document.addEventListener('viewChanged', (event: any) => {
      if (event.detail === 'profil') {
        // Rafraîchir la photo quand l'utilisateur va sur la page de profil
        setTimeout(() => {
          this.loadProfileImage();
        }, 1000);
      }
    });

    // S'abonner au nombre de notifications non lues
    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadNotificationCount = count;
    });
  }

  loadNotifications() {
    this.notificationService.getRecentNotifications().subscribe({
      next: (notifications) => {
        this.notifications = this.notificationService.transformNotificationsForDisplay(notifications);
        console.log('Notifications chargées:', this.notifications);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    });
  }

  loadProfileImage() {
    this.isLoading = true;
    this.profileService.getCurrentProfile().subscribe({
      next: (profile: any) => {
        console.log('=== HEADER - Chargement de l\'image ===');
        console.log('Profil reçu dans header:', JSON.stringify(profile, null, 2));
        
        // Vérifier tous les champs possibles
        console.log('profilePictureUrl:', profile.profilePictureUrl);
        console.log('profilePhoto:', profile.profilePhoto);
        console.log('profilePicture:', profile.profilePicture);
        
        // Le backend retourne profilePictureUrl
        let photoUrl = profile.profilePictureUrl;
        
        console.log('URL de photo du backend:', photoUrl);
        
        // Vérifier si la photo existe et est valide
        if (photoUrl && photoUrl.trim() !== '') {
          // Si c'est un chemin relatif, ajouter l'URL du backend
          if (!photoUrl.startsWith('http')) {
            // Gérer les cas où l'URL commence ou non par /
            if (!photoUrl.startsWith('/')) {
              photoUrl = '/' + photoUrl;
            }
            photoUrl = 'http://localhost:7878' + photoUrl;
          }
          
          console.log('URL de photo complète dans header:', photoUrl);
          this.profileImageUrl = photoUrl;
        } else {
          console.log('Aucune photo disponible, utilisation de l\'image par défaut');
          this.profileImageUrl = this.getDefaultProfileImage();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la photo de profil:', error);
        this.profileImageUrl = this.getDefaultProfileImage();
        this.isLoading = false;
      }
    });
  }

  getDefaultProfileImage(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIxdjJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo8L3N2Zz4K';
  }

  // Rafraîchir la photo de profil
  refreshProfileImage() {
    this.loadProfileImage();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      // Recharger les notifications à chaque ouverture
      this.loadNotifications();
    }
  }

  goToNewProject() {
    this.viewChange.emit('nouveau-projet');
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

    // Navigation vers la page appropriée selon le type
    if (type === 'investissement') {
      this.viewChange.emit('nouvelle-campagne');
    } else if (type === 'don') {
      this.viewChange.emit('nouvelle-campagne-don');
    } else if (type === 'benevolat') {
      this.viewChange.emit('nouvelle-campagne-benevolat');
    }
  }

  goToProfil() {
    this.viewChange.emit('profil');
  }

  logout() {
    this.showLogoutModal = true;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    // Utiliser le service d'authentification pour se déconnecter
    this.authService.logout();
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }
}
