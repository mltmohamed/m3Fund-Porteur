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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s\-\(\)]{8,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      rccm: [null, [Validators.required]],
      bankStatement: [null],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
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
      this.registrationForm.get(fieldName)?.setValue(file);
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
        rccm: this.registrationForm.value.rccm,
        bankStatement: this.registrationForm.value.bankStatement,
        password: this.registrationForm.value.password,
        confirmPassword: this.registrationForm.value.confirmPassword
      };

      this.authService.registerCompany(formData).subscribe({
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
  get rccm() { return this.registrationForm.get('rccm'); }
  get bankStatement() { return this.registrationForm.get('bankStatement'); }
  get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }
}