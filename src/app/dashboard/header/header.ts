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
}
