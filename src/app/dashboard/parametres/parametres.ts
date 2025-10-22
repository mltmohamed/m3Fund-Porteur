import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parametres',
  imports: [CommonModule],
  templateUrl: './parametres.html',
  styleUrl: './parametres.css'
})
export class Parametres {
  selectedTheme: string = 'light'; // 'light' ou 'dark'

  selectTheme(theme: string) {
    this.selectedTheme = theme;
    console.log('Thème sélectionné:', theme);
    
    // Ici vous pouvez implémenter la logique de changement de thème
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
}

