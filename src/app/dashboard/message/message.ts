import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message',
  imports: [CommonModule, FormsModule],
  templateUrl: './message.html',
  styleUrl: './message.css'
})
export class Message {
  searchTerm: string = '';
  newMessage: string = '';
  selectedConversation: any = null;

  // Données des conversations
  conversations = [
    {
      id: 1,
      title: 'Plateforme de Télémédecine',
      date: '10/10/2025',
      time: '9H00',
      snippet: 'Bonsoir, je voudrais investir dans votre projet, mais avant il me faudrait votre business plan.',
      sender: {
        name: 'Aminata Coulibaly',
        avatar: '/profil.jpg',
        role: 'Investisseur'
      },
      timestamp: 'Il y\'a 5 min',
      section: 'today'
    },
    {
      id: 2,
      title: 'Construction d\'une Ecole',
      date: '10/10/2025',
      time: '9H00',
      snippet: 'Bonsoir, je voudrais investir dans votre projet, mais avant il me faudrait votre business plan.',
      sender: {
        name: 'Aminata Coulibaly',
        avatar: '/profil.jpg',
        role: 'Donateur'
      },
      timestamp: 'Il y\'a 3 jours',
      section: 'yesterday'
    },
    {
      id: 3,
      title: 'Plateforme de Télémédecine',
      date: '10/10/2025',
      time: '9H00',
      snippet: 'Bonsoir, je voudrais investir dans votre projet, mais avant il me faudrait votre business plan.',
      sender: {
        name: 'Aminata Coulibaly',
        avatar: '/profil.jpg',
        role: 'Bénévole'
      },
      timestamp: 'Il y\'a 3 jours',
      section: 'yesterday'
    }
  ];

  // Messages de la conversation sélectionnée
  messages = [
    {
      id: 1,
      sender: 'Aminata Coulibaly',
      content: 'Bonsoir, je voudrais investir dans votre projet, mais avant il me faudrait votre business plan.',
      timestamp: '9h: 18',
      isIncoming: true
    },
    {
      id: 2,
      sender: 'Vous',
      content: 'bonsoir, j\'espère que vous vous portez bien, d\'accord je vous l\'envoi sous peu.',
      timestamp: '9h: 50',
      isIncoming: false
    }
  ];

  onSearch() {
    console.log('Recherche:', this.searchTerm);
  }

  selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    console.log('Conversation sélectionnée:', conversation);
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const message = {
        id: this.messages.length + 1,
        sender: 'Vous',
        content: this.newMessage,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isIncoming: false
      };
      
      this.messages.push(message);
      this.newMessage = '';
      console.log('Message envoyé:', message);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}

