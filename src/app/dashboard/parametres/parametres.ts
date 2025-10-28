import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-parametres',
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.html',
  styleUrl: './parametres.css'
})
export class Parametres implements OnInit {
  // Section active
  activeSection: string = 'compte';

  // Thème
  selectedTheme: string = 'light';

  // Informations du compte
  accountInfo = {
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  };

  // Changer le mot de passe
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Notifications
  notifications = {
    emailNotifications: true,
    campaignUpdates: true,
    projectUpdates: false,
    marketingEmails: false,
    securityAlerts: true
  };

  // Langue
  selectedLanguage: string = 'fr';
  languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  // Confidentialité
  privacy = {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true
  };

  // Sécurité
  security = {
    twoFactorEnabled: false,
    loginNotifications: true
  };

  // Messages
  successMessage: string = '';
  errorMessage: string = '';
  showDeleteModal: boolean = false;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadThemePreference();
  }

  loadUserProfile() {
    this.profileService.getCurrentProfile().subscribe({
      next: (profile: any) => {
        this.accountInfo.email = profile.email || '';
        this.accountInfo.firstName = profile.firstName || '';
        this.accountInfo.lastName = profile.lastName || '';
        this.accountInfo.phone = profile.phone || '';
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
      }
    });
  }

  loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.selectedTheme = savedTheme;
    this.applyTheme(savedTheme);
  }

  selectSection(section: string) {
    this.activeSection = section;
    this.clearMessages();
  }

  selectTheme(theme: string) {
    this.selectedTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
    this.showSuccess('Thème modifié avec succès');
  }

  applyTheme(theme: string) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  updatePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.showError('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.showError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // TODO: Implémenter l'appel API pour changer le mot de passe
    this.showSuccess('Mot de passe modifié avec succès');
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  saveNotifications() {
    // TODO: Implémenter l'appel API pour sauvegarder les préférences de notifications
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.showSuccess('Préférences de notifications sauvegardées');
  }

  selectLanguage(langCode: string) {
    this.selectedLanguage = langCode;
    localStorage.setItem('language', langCode);
    this.showSuccess('Langue modifiée avec succès');
    // TODO: Implémenter le changement de langue dans l'application
  }

  savePrivacy() {
    // TODO: Implémenter l'appel API pour sauvegarder les paramètres de confidentialité
    localStorage.setItem('privacy', JSON.stringify(this.privacy));
    this.showSuccess('Paramètres de confidentialité sauvegardés');
  }

  toggleTwoFactor() {
    this.security.twoFactorEnabled = !this.security.twoFactorEnabled;
    // TODO: Implémenter l'activation/désactivation de l'authentification à deux facteurs
    const message = this.security.twoFactorEnabled 
      ? 'Authentification à deux facteurs activée' 
      : 'Authentification à deux facteurs désactivée';
    this.showSuccess(message);
  }

  saveSecurity() {
    // TODO: Implémenter l'appel API pour sauvegarder les paramètres de sécurité
    localStorage.setItem('security', JSON.stringify(this.security));
    this.showSuccess('Paramètres de sécurité sauvegardés');
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDeleteAccount() {
    // TODO: Implémenter la suppression du compte
    console.log('Suppression du compte...');
    this.closeDeleteModal();
    this.authService.logout();
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
