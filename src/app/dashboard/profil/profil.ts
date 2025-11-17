import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { UserProfile, ProfileUpdateRequest, PasswordChangeRequest, ProfileStats } from '../../interfaces/profile.interface';
import { PasswordConfirmModal } from './password-confirm-modal/password-confirm-modal';

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PasswordConfirmModal],
  templateUrl: './profil.html',
  styleUrl: './profil.css'
})
export class Profil implements OnInit, OnDestroy, OnChanges {
  @Input() currentView: string = '';
  @Output() profileImageUpdated = new EventEmitter<string>();
  
  // Formulaire réactif
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  // Données du profil
  userProfile: UserProfile | null = null;
  profileStats: ProfileStats | null = null;
  
  // États
  isLoading = false;
  isUpdating = false;
  isChangingPassword = false;
  errorMessage = '';
  successMessage = '';
  
  // Gestion des fichiers
  selectedFile: File | null = null;
  profileImageUrl: string = '';
  
  // Modal de confirmation
  showPasswordModal = false;
  showSuccessModal = false;
  successModalMessage = '';
  showErrorModal = false;
  errorModalMessage = '';
  
  // Listener pour les événements de changement de vue
  private viewChangeListener?: EventListener;

  constructor(
    private fb: FormBuilder,
    public profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{1,3}[- ]?\d{6,14}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      currentPassword: ['', [Validators.required]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    console.log('=== PROFIL COMPONENT INIT ===');
    this.loadProfile();
    this.loadProfileStats();
    
    // Écouter les événements de changement de vue pour recharger les données
    this.viewChangeListener = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newView = customEvent.detail;
      console.log('=== PROFIL - Événement viewChanged reçu ===');
      console.log('Nouvelle vue:', newView);
      
      // Recharger les données quand on revient sur la page profil
      if (newView === 'profil') {
        console.log('✅ Retour sur la page profil - rechargement des données');
        // Ajouter un petit délai pour s'assurer que le composant est visible
        setTimeout(() => {
          this.loadProfile();
          this.loadProfileStats();
        }, 100);
      }
    };
    
    // Ajouter le listener pour les événements de changement de vue
    document.addEventListener('viewChanged', this.viewChangeListener);
    console.log('Listener viewChanged ajouté au composant profil');
  }
  
  ngOnChanges(changes: SimpleChanges) {
    console.log('=== PROFIL - ngOnChanges ===');
    console.log('Changements détectés:', changes);
    
    if (changes['currentView'] && changes['currentView'].currentValue === 'profil') {
      console.log('✅ Changement vers la vue profil détecté - rechargement des données');
      // Recharger les données quand on revient sur la page profil
      setTimeout(() => {
        this.loadProfile();
        this.loadProfileStats();
      }, 100);
    }
  }
  
  ngOnDestroy() {
    // Nettoyer le listener pour éviter les fuites mémoire
    if (this.viewChangeListener) {
      document.removeEventListener('viewChanged', this.viewChangeListener);
    }
  }
  

  // Charger le profil utilisateur
  loadProfile() {
    console.log('=== PROFIL - loadProfile() appelée ===');
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getCurrentProfile().subscribe({
      next: (profile: any) => {
        console.log('=== CHARGEMENT DU PROFIL ===');
        console.log('Profil brut du backend:', JSON.stringify(profile, null, 2));
        
        // Vérifier tous les champs possibles
        console.log('profilePictureUrl:', profile.profilePictureUrl);
        console.log('profilePhoto:', profile.profilePhoto);
        console.log('profilePicture:', profile.profilePicture);
        
        this.userProfile = this.profileService.transformProfileData(profile);
        
        console.log('Profil transformé:', this.userProfile);
        
        // Construire l'URL complète de la photo de profil
        // Le backend retourne profilePictureUrl dans IndividualProjectOwnerResponse
        let photoUrl = profile.profilePictureUrl;
        
        console.log('URL de la photo du backend:', photoUrl);
        
        if (photoUrl && photoUrl.trim() !== '') {
          // Convertir le chemin en URL HTTP via l'endpoint /public/download
          photoUrl = this.convertFilePathToUrl(photoUrl);
          this.profileImageUrl = photoUrl;
          console.log('URL complète de l\'image de profil:', this.profileImageUrl);
        } else {
          this.profileImageUrl = '';
          console.log('⚠️ Aucune photo de profil disponible dans la réponse du backend');
        }
        
        // Remplir le formulaire avec les données disponibles
        const firstName = this.userProfile.firstName || '';
        const lastName = this.userProfile.lastName || '';
        
        this.profileForm.patchValue({
          firstName: firstName,
          lastName: lastName,
          email: this.userProfile.email,
          phone: this.userProfile.phone,
          address: this.userProfile.address
        });
        
        console.log('Données du formulaire:', this.profileForm.value);
        console.log('=== FIN DU CHARGEMENT ===');
        this.isLoading = false;
        
        // Émettre un événement pour mettre à jour le header après le chargement
        if (this.profileImageUrl) {
          console.log('Émission de l\'événement profileImageUpdated avec:', this.profileImageUrl);
          const event = new CustomEvent('profileImageUpdated', { detail: this.profileImageUrl });
          document.dispatchEvent(event);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        
        // Gestion spécifique des erreurs d'authentification
        if (error.status === 401) {
          this.errorMessage = 'Session expirée. Vous allez être redirigé vers la page de connexion.';
          // Ne pas afficher le spinner d'erreur pour les erreurs 401
          this.isLoading = false;
        } else {
          this.errorMessage = 'Erreur lors du chargement du profil';
          this.isLoading = false;
        }
      }
    });
  }

  // Charger les statistiques du profil
  loadProfileStats() {
    this.profileService.getProfileStats().subscribe({
      next: (stats) => {
        this.profileStats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  // Validation de correspondance des mots de passe
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  // Gestion du changement d'image
  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Veuillez sélectionner un fichier image valide';
        return;
      }
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'La taille du fichier ne doit pas dépasser 5MB';
        return;
      }
      
      this.selectedFile = file;
      
      // Aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Afficher le modal de confirmation de mot de passe
      this.showPasswordModal = true;
    }
  }

  // Déclencher le sélecteur de fichier
  triggerFileInput() {
    const fileInput = document.getElementById('profile-photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Gestion du modal de confirmation
  onPasswordConfirmed(password: string) {
    this.showPasswordModal = false;
    this.updateProfilePhoto(password);
  }

  onPasswordCancelled() {
    this.showPasswordModal = false;
    // Réinitialiser la sélection de fichier
    this.selectedFile = null;
    // Recharger l'image d'origine
    this.loadProfile();
  }

  // Mettre à jour la photo de profil
  updateProfilePhoto(password: string) {
    if (!this.selectedFile) {
      this.errorMessage = 'Aucun fichier sélectionné';
      return;
    }

    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: ProfileUpdateRequest = {
      profilePhoto: this.selectedFile,
      currentPassword: password
    };

    this.profileService.updateProfile(updateData).subscribe({
      next: (response) => {
        console.log('Photo mise à jour avec succès, réponse:', response);
        this.isUpdating = false;
        this.selectedFile = null;
        
        // Afficher le modal de succès
        this.successModalMessage = 'Photo de profil mise à jour avec succès !';
        this.showSuccessModal = true;
        
        // Attendre un peu que le backend sauvegarde
        setTimeout(() => {
          // Recharger le profil pour récupérer la nouvelle URL
          this.loadProfile();
        }, 1000);
      },
             error: (error) => {
         console.error('Erreur lors de la mise à jour de la photo:', error);
         this.isUpdating = false;
         
         // Déterminer le message d'erreur
         let errorMsg = '';
         if (error.status === 401 || error.status === 403) {
           errorMsg = 'Mot de passe incorrect. Veuillez réessayer.';
         } else {
           errorMsg = error.error?.message || 'Erreur lors de la mise à jour de la photo de profil.';
         }
         
         // Afficher le modal d'erreur
         this.errorModalMessage = errorMsg;
         this.showErrorModal = true;
         
         // Réinitialiser la sélection de fichier
         this.selectedFile = null;
         // Recharger l'image originale
         this.loadProfile();
       }
    });
  }

  // Soumettre les modifications du profil
  onSubmit() {
    if (this.profileForm.valid) {
      this.isUpdating = true;
      this.errorMessage = '';
      this.successMessage = '';

      const updateData: ProfileUpdateRequest = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        email: this.profileForm.value.email,
        phone: this.profileForm.value.phone,
        address: this.profileForm.value.address,
        currentPassword: this.profileForm.value.currentPassword
      };

      this.profileService.updateProfile(updateData).subscribe({
        next: (response) => {
          this.isUpdating = false;
          this.loadProfile(); // Recharger les données
          
          // Afficher le modal de succès
          this.successModalMessage = 'Profil mis à jour avec succès !';
          this.showSuccessModal = true;
        },
               error: (error) => {
         this.isUpdating = false;
         
         // Déterminer le message d'erreur
         let errorMsg = '';
         if (error.status === 401 || error.status === 403) {
           errorMsg = 'Mot de passe incorrect. Veuillez réessayer.';
         } else {
           errorMsg = error.error?.message || 'Erreur lors de la mise à jour du profil';
         }
         
         // Afficher le modal d'erreur
         this.errorModalMessage = errorMsg;
         this.showErrorModal = true;
         
         console.error('Erreur lors de la mise à jour du profil:', error);
       }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Changer le mot de passe
  onChangePassword() {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      this.errorMessage = '';
      this.successMessage = '';

      const passwordData: PasswordChangeRequest = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword,
        confirmPassword: this.passwordForm.value.confirmPassword
      };

      this.profileService.changePassword(passwordData).subscribe({
        next: (response) => {
          this.isChangingPassword = false;
          this.passwordForm.reset();
          
          // Afficher le modal de succès
          this.successModalMessage = 'Mot de passe changé avec succès !';
          this.showSuccessModal = true;
        },
        error: (error) => {
          this.isChangingPassword = false;
          
          // Déterminer le message d'erreur
          let errorMsg = '';
          if (error.status === 401 || error.status === 403) {
            errorMsg = 'Mot de passe actuel incorrect. Veuillez réessayer.';
          } else {
            errorMsg = error.error?.message || 'Erreur lors du changement de mot de passe';
          }
          
          // Afficher le modal d'erreur
          this.errorModalMessage = errorMsg;
          this.showErrorModal = true;
          
          console.error('Erreur lors du changement de mot de passe:', error);
        }
      });
    } else {
      this.markPasswordFormTouched();
    }
  }

  // Marquer tous les champs comme touchés
  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  private markPasswordFormTouched() {
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      control?.markAsTouched();
    });
  }

  // Effacer les messages
  clearError() {
    this.errorMessage = '';
  }

  clearSuccess() {
    this.successMessage = '';
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.successModalMessage = '';
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.errorModalMessage = '';
  }

  // Getters pour les contrôles du formulaire
  get firstName() { return this.profileForm.get('firstName'); }
  get lastName() { return this.profileForm.get('lastName'); }
  get email() { return this.profileForm.get('email'); }
  get phone() { return this.profileForm.get('phone'); }
  get address() { return this.profileForm.get('address'); }
  get currentPassword() { return this.profileForm.get('currentPassword'); }

  // Getters pour le formulaire de mot de passe
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }

  private convertFilePathToUrl(filePath: string): string {
    // Si c'est déjà une URL HTTP/HTTPS, la retourner telle quelle
    if (/^https?:\/\//i.test(filePath)) {
      return filePath;
    }
    
    // Si c'est un chemin absolu Windows (commence par C:\ ou D:\ etc.) ou Unix (/)
    // Le convertir en URL via l'endpoint /public/download
    if (/^[A-Za-z]:\\/.test(filePath) || /^\/[^\/]/.test(filePath)) {
      const encodedPath = encodeURIComponent(filePath);
      return `https://m3fund-api.onrender.com/api/v1/public/download?absolutePath=${encodedPath}`;
    }
    
    // Si c'est un chemin relatif, essayer de construire l'URL
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `https://m3fund-api.onrender.com/${normalizedPath}`;
  }
}

