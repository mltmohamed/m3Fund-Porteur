import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css'
})
export class Profil {
  // Données du profil utilisateur
  nom: string = 'Dupont';
  prenom: string = 'Marie';
  email: string = 'marie.dupont@email.com';
  telephone: string = '+223 70 12 34 56';
  motDePasse: string = '';

  onSubmit() {
    console.log('Modification du profil soumise');
    console.log('Nom:', this.nom);
    console.log('Prénom:', this.prenom);
    console.log('Email:', this.email);
    console.log('Téléphone:', this.telephone);
    console.log('Mot de passe confirmé:', this.motDePasse);
  }

  onImageChange() {
    console.log('Changement d\'image de profil');
    // Ici vous pouvez implémenter la logique de changement d'image
  }
}

