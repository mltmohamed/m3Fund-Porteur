import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CompanyRegistrationRequest } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-company-registration',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './company-registration.html',
  styleUrl: './company-registration.css'
})
export class CompanyRegistrationComponent {
  registrationForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Variables pour les noms de fichiers
  rccmFileName = '';
  bankStatementFileName = '';
  profilePhotoPreview = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{1,3}[- ]?\d{6,14}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      annualIncome: [0, [Validators.required, Validators.min(0.01)]],
      shareCapital: [0, [Validators.required, Validators.min(0.01)]],
      rccm: [null, [Validators.required]],
      bankStatement: [null],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/)]],
      confirmPassword: ['', [Validators.required]],
      profilePhoto: [null]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onFileSelected(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      // Validation du type de fichier selon le champ
      let isValidType = false;
      let errorMessage = '';

      switch (fieldName) {
        case 'rccm':
          // Accepte: PDF, JPG, JPEG, PNG
          isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
          if (!isValidType) {
            errorMessage = 'Le RCCM doit être au format PDF, JPG ou PNG.';
          }
          break;
        case 'bankStatement':
          // Accepte: PDF uniquement
          isValidType = file.type === 'application/pdf';
          if (!isValidType) {
            errorMessage = 'Le relevé bancaire doit être au format PDF.';
          }
          break;
        case 'profilePhoto':
          // Accepte: JPG, JPEG, PNG uniquement
          isValidType = ['image/jpeg', 'image/png'].includes(file.type);
          if (!isValidType) {
            errorMessage = 'La photo de profil doit être au format JPG ou PNG. Le format AVIF et autres formats ne sont pas supportés.';
          }
          break;
      }

      if (!isValidType) {
        this.errorMessage = errorMessage;
        // Réinitialiser le champ
        event.target.value = '';
        this.registrationForm.patchValue({ [fieldName]: null });
        
        // Réinitialiser les variables d'affichage
        switch (fieldName) {
          case 'rccm':
            this.rccmFileName = '';
            break;
          case 'bankStatement':
            this.bankStatementFileName = '';
            break;
          case 'profilePhoto':
            this.profilePhotoPreview = '';
            break;
        }
        return;
      }

      // Si le type est valide, continuer le traitement
      this.errorMessage = '';
      this.registrationForm.get(fieldName)?.setValue(file);
      
      // Mettre à jour le nom du fichier affiché
      switch (fieldName) {
        case 'rccm':
          this.rccmFileName = file.name;
          break;
        case 'bankStatement':
          this.bankStatementFileName = file.name;
          break;
        case 'profilePhoto':
          // Créer une prévisualisation de l'image
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.profilePhotoPreview = e.target.result;
          };
          reader.readAsDataURL(file);
          break;
      }
    }
  }

  // Déclencher la sélection de fichier
  triggerFileInput(inputId: string) {
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData: CompanyRegistrationRequest = {
        companyName: this.registrationForm.value.companyName,
        phone: this.registrationForm.value.phone,
        email: this.registrationForm.value.email,
        address: this.registrationForm.value.address,
        annualIncome: this.registrationForm.value.annualIncome,
        shareCapital: this.registrationForm.value.shareCapital,
        rccm: this.registrationForm.value.rccm,
        bankStatement: this.registrationForm.value.bankStatement,
        password: this.registrationForm.value.password,
        confirmPassword: this.registrationForm.value.confirmPassword
      };

      this.authService.registerCompany(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Inscription réussie ! Votre compte est en attente de validation. Vous recevrez un email une fois votre compte validé.';
          setTimeout(() => {
            this.router.navigate(['/connexion']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur d\'inscription:', error);
          
          // Gestion des erreurs spécifiques
          if (error.status === 400) {
            this.errorMessage = error.error?.message || 'Les données fournies sont invalides.';
          } else if (error.status === 409) {
            this.errorMessage = 'Cet email ou ce numéro de téléphone est déjà utilisé.';
          } else if (error.status === 500) {
            // Afficher le message d'erreur spécifique du serveur si disponible
            const serverMessage = error.error?.message;
            if (serverMessage && serverMessage.includes('Type de fichier non pris en charge')) {
              this.errorMessage = serverMessage + ' Veuillez utiliser uniquement les formats JPG, PNG ou PDF selon le type de document.';
            } else {
              this.errorMessage = serverMessage || 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
            }
          } else {
            this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'inscription.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/homepage']);
  }

  get companyName() { return this.registrationForm.get('companyName'); }
  get phone() { return this.registrationForm.get('phone'); }
  get email() { return this.registrationForm.get('email'); }
  get address() { return this.registrationForm.get('address'); }
  get annualIncome() { return this.registrationForm.get('annualIncome'); }
  get shareCapital() { return this.registrationForm.get('shareCapital'); }
  get rccm() { return this.registrationForm.get('rccm'); }
  get bankStatement() { return this.registrationForm.get('bankStatement'); }
  get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }
}