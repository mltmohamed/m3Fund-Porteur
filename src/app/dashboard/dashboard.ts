import { Component } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { Projects } from './projects/projects';
import { Campaigns } from './campaigns/campaigns';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Header, Projects, Campaigns],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

}
