import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { UserProfile, ProfileUpdateRequest, PasswordChangeRequest, ProfileStats } from '../../interfaces/profile.interface';

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css'
})
export class Profil implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    public profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s\-\(\)]{8,}$/)]],
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
    this.loadProfile();
    this.loadProfileStats();
  }

  // Charger le profil utilisateur
  loadProfile() {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getCurrentProfile().subscribe({
      next: (profile) => {
        this.userProfile = this.profileService.transformProfileData(profile);
        this.profileImageUrl = profile.profilePhoto || '';
        
        // Remplir le formulaire
        this.profileForm.patchValue({
          firstName: this.userProfile.firstName,
          lastName: this.userProfile.lastName,
          email: this.userProfile.email,
          phone: this.userProfile.phone,
          address: this.userProfile.address
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du profil';
        this.isLoading = false;
        console.error('Erreur:', error);
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
      this.selectedFile = file;
      
      // Aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Déclencher le sélecteur de fichier
  triggerFileInput() {
    const fileInput = document.getElementById('profile-photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
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
        profilePhoto: this.selectedFile || undefined,
        currentPassword: this.profileForm.value.currentPassword
      };

      this.profileService.updateProfile(updateData).subscribe({
        next: (response) => {
          this.isUpdating = false;
          this.successMessage = 'Profil mis à jour avec succès !';
          this.loadProfile(); // Recharger les données
        },
        error: (error) => {
          this.isUpdating = false;
          this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du profil';
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
          this.successMessage = 'Mot de passe changé avec succès !';
          this.passwordForm.reset();
        },
        error: (error) => {
          this.isChangingPassword = false;
          this.errorMessage = error.error?.message || 'Erreur lors du changement de mot de passe';
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
}

