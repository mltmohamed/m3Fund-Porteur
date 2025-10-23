import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-modal',
  imports: [CommonModule],
  templateUrl: './notification-modal.html',
  styleUrl: './notification-modal.css'
})
export class NotificationModal {
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
}
