import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-confirm-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-confirm-modal.html',
  styleUrl: './password-confirm-modal.css'
})
export class PasswordConfirmModal {
  @Input() isVisible = false;
  @Output() confirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  passwordForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required]]
    });
  }

  confirm() {
    if (this.passwordForm.valid) {
      const password = this.passwordForm.value.password;
      this.confirmed.emit(password);
      this.passwordForm.reset();
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Veuillez entrer votre mot de passe';
    }
  }

  cancel() {
    this.passwordForm.reset();
    this.errorMessage = '';
    this.cancelled.emit();
  }

  closeOnBackdrop(event: Event) {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  get password() { return this.passwordForm.get('password'); }
}
