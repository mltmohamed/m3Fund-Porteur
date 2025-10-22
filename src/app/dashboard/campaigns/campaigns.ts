import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-campaigns',
  imports: [],
  templateUrl: './campaigns.html',
  styleUrl: './campaigns.css'
})
export class Campaigns {
  @Output() viewChange = new EventEmitter<string>();

  goToCampaigns() {
    this.viewChange.emit('campagnes');
  }
}
