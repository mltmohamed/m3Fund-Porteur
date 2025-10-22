import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  @Output() viewChange = new EventEmitter<string>();
  showNotifications = false;
  showCampaignModal = false;

  notifications = [
    {
      sender: 'admin campagne',
      message: 'votre demande de campagne a été accepter.',
      time: '2 min'
    },
    {
      sender: 'admin campagne',
      message: 'votre demande de campagne a été accepter.',
      time: '10 min'
    },
    {
      sender: 'admin campagne',
      message: 'votre demande de campagne a été accepter.',
      time: '30 min'
    }
  ];

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  goToNewProject() {
    this.viewChange.emit('nouveau-projet');
  }

  toggleCampaignModal() {
    this.showCampaignModal = !this.showCampaignModal;
  }

  closeCampaignModal() {
    this.showCampaignModal = false;
  }

  selectCampaignType(type: string) {
    console.log('Type de campagne sélectionné:', type);
    this.closeCampaignModal();

    // Navigation vers la page appropriée selon le type
    if (type === 'investissement') {
      this.viewChange.emit('nouvelle-campagne');
    } else if (type === 'don') {
      this.viewChange.emit('nouvelle-campagne-don');
    } else if (type === 'benevolat') {
      this.viewChange.emit('nouvelle-campagne-benevolat');
    }
  }

  goToProfil() {
    this.viewChange.emit('profil');
  }
}
