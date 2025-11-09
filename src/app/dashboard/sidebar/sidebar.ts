import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Output() viewChange = new EventEmitter<string>();
  currentView: string = 'dashboard';
  isMobileMenuOpen: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Fermer le menu mobile si on passe à un écran plus grand
    if (event.target.innerWidth > 768 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  setView(view: string) {
    this.currentView = view;
    this.viewChange.emit(view);
    // Fermer le menu mobile après sélection sur mobile
    if (window.innerWidth <= 768) {
      this.closeMobileMenu();
    }
  }
}
