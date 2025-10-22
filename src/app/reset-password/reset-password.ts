import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  onSubmit() {
    // Logique de réinitialisation du mot de passe à implémenter
    console.log('Email:', this.email);
    console.log('New Password:', this.newPassword);
    console.log('Confirm Password:', this.confirmPassword);
  }
}
