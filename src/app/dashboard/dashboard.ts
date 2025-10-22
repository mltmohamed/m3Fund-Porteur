import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { Projects } from './projects/projects';
import { Campaigns } from './campaigns/campaigns';
import { Projet } from './projet/projet';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Sidebar, Header, Projects, Campaigns, Projet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  currentView: string = 'dashboard';

  setView(view: string) {
    this.currentView = view;
  }
}
