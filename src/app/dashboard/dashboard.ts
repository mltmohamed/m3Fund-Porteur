import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { Projects } from './projects/projects';
import { Campaigns } from './campaigns/campaigns';
import { Projet } from './projet/projet';
import { Fonds } from './fonds/fonds';
import { NouveauProjet } from './nouveau-projet/nouveau-projet';
import { NouvelleCampagne } from './nouvelle-campagne/nouvelle-campagne';
import { NouvelleCampagneDon } from './nouvelle-campagne-don/nouvelle-campagne-don';
import { NouvelleCampagneBenevolat } from './nouvelle-campagne-benevolat/nouvelle-campagne-benevolat';
import { Campagnes } from './campagnes/campagnes';
import { Profil } from './profil/profil';
import { Parametres } from './parametres/parametres';
import { Message } from './message/message';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Sidebar, Header, Projects, Campaigns, Projet, Fonds, NouveauProjet, NouvelleCampagne, NouvelleCampagneDon, NouvelleCampagneBenevolat, Campagnes, Profil, Parametres, Message],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  currentView: string = 'dashboard';

  setView(view: string) {
    this.currentView = view;
  }
}
