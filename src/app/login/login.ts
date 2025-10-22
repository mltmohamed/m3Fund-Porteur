import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    // Logique de connexion à implémenter
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    
    // Redirection vers le dashboard après connexion
    this.router.navigate(['/dashboard']);
  }
}
