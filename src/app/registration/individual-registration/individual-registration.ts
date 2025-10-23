import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { IndividualRegistrationRequest } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-individual-registration',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './individual-registration.html',
  styleUrl: './individual-registration.css'
})
export class IndividualRegistrationComponent {
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
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s\-\(\)]{8,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      annualIncome: [0, [Validators.required, Validators.min(0)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      biometricCard: [null],
      residenceCertificate: [null],
      bankStatement: [null],
      profilePhoto: [null]
    }, { validators: this.passwordMatchValidator });
  }

  // Validateur pour vérifier que les mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // Gestion des fichiers
  onFileSelected(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      this.registrationForm.patchValue({ [fieldName]: file });
    }
  }

  // Soumission du formulaire
  onSubmit() {
    if (this.registrationForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData: IndividualRegistrationRequest = {
        firstName: this.registrationForm.value.firstName,
        lastName: this.registrationForm.value.lastName,
        phone: this.registrationForm.value.phone,
        email: this.registrationForm.value.email,
        address: this.registrationForm.value.address,
        annualIncome: this.registrationForm.value.annualIncome,
        password: this.registrationForm.value.password,
        confirmPassword: this.registrationForm.value.confirmPassword,
        biometricCard: this.registrationForm.value.biometricCard,
        residenceCertificate: this.registrationForm.value.residenceCertificate,
        bankStatement: this.registrationForm.value.bankStatement,
        profilePhoto: this.registrationForm.value.profilePhoto
      };

      this.authService.registerIndividual(formData).subscribe({
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
          console.error('Erreur d\'inscription:', error);
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

  // Déclencher l'input file pour la photo de profil
  triggerFileInput() {
    const fileInput = document.getElementById('photo-profil') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get firstName() { return this.registrationForm.get('firstName'); }
  get lastName() { return this.registrationForm.get('lastName'); }
  get phone() { return this.registrationForm.get('phone'); }
  get email() { return this.registrationForm.get('email'); }
  get address() { return this.registrationForm.get('address'); }
  get annualIncome() { return this.registrationForm.get('annualIncome'); }
  get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }
}
