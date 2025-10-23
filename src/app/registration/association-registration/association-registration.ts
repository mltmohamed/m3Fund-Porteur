import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AssociationRegistrationRequest } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-association-registration',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './association-registration.html',
  styleUrl: './association-registration.css'
})
export class AssociationRegistration {
  registrationForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      associationName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s\-\(\)]{8,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      associationStatus: [null, [Validators.required]],
      bankStatement: [null],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  // Gestion de la sélection de fichiers
  onFileSelected(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      this.registrationForm.get(fieldName)?.setValue(file);
    }
  }

  // Soumission du formulaire
  onSubmit() {
    if (this.registrationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData: AssociationRegistrationRequest = {
        associationName: this.registrationForm.value.associationName,
        phone: this.registrationForm.value.phone,
        email: this.registrationForm.value.email,
        address: this.registrationForm.value.address,
        associationStatus: this.registrationForm.value.associationStatus,
        bankStatement: this.registrationForm.value.bankStatement,
        password: this.registrationForm.value.password,
        confirmPassword: this.registrationForm.value.confirmPassword
      };

      this.authService.registerAssociation(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
          setTimeout(() => {
            this.router.navigate(['/connexion']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'inscription.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched() {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Navigation vers la page précédente
  goBack() {
    this.router.navigate(['/homepage']);
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get associationName() { return this.registrationForm.get('associationName'); }
  get phone() { return this.registrationForm.get('phone'); }
  get email() { return this.registrationForm.get('email'); }
  get address() { return this.registrationForm.get('address'); }
  get associationStatus() { return this.registrationForm.get('associationStatus'); }
  get bankStatement() { return this.registrationForm.get('bankStatement'); }
  get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }
}
