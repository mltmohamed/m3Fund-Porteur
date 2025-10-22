import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fonds',
  imports: [CommonModule, FormsModule],
  templateUrl: './fonds.html',
  styleUrl: './fonds.css'
})
export class Fonds {
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedPeriod: string = '';
  showTransactionModal: boolean = false;
  selectedTransaction: any = null;

  // Données des transactions
  transactions = [
    {
      paymentMethod: 'Orange Money +22372****72',
      status: 'success',
      statusIcon: 'fas fa-check-circle',
      project: 'Plateforme de Télémédecine 09/10/2025',
      amount: '250,000 FCFA',
      date: '09/10/2025',
      time: '14:30',
      // Données détaillées pour le modal
      transactionDate: '13/10/2025',
      transactionStatus: 'Envoyé',
      paymentMethodDetail: 'Orange Money',
      recipientNumber: '+22372001272',
      transactionReason: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    },
    {
      paymentMethod: 'Carte Bancaire *******9802',
      status: 'pending',
      statusIcon: 'fas fa-hourglass-half',
      project: 'Construction d\'une Ecole 08/08/2025',
      amount: '500,000 FCFA',
      date: '08/08/2025',
      time: '10:15',
      // Données détaillées pour le modal
      transactionDate: '08/08/2025',
      transactionStatus: 'En attente',
      paymentMethodDetail: 'Carte Bancaire',
      recipientNumber: '*******9802',
      transactionReason: 'Construction d\'une école avec dispositifs intégrés pour le suivi pédagogique administratif des élèves.'
    },
    {
      paymentMethod: 'Orange Money +22372****72',
      status: 'failed',
      statusIcon: 'fas fa-times',
      project: 'Plateforme de Télémédecine 21/10/2025',
      amount: '100,000 FCFA',
      date: '21/10/2025',
      time: '16:45',
      // Données détaillées pour le modal
      transactionDate: '21/10/2025',
      transactionStatus: 'Échoué',
      paymentMethodDetail: 'Orange Money',
      recipientNumber: '+22372001272',
      transactionReason: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    },
    {
      paymentMethod: 'Orange Money +22372****72',
      status: 'failed',
      statusIcon: 'fas fa-times',
      project: 'Plateforme de Télémédecine 09/10/2025',
      amount: '75,000 FCFA',
      date: '09/10/2025',
      time: '11:20',
      // Données détaillées pour le modal
      transactionDate: '09/10/2025',
      transactionStatus: 'Échoué',
      paymentMethodDetail: 'Orange Money',
      recipientNumber: '+22372001272',
      transactionReason: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.'
    }
  ];

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'success', label: 'Réussi' },
    { value: 'pending', label: 'En attente' },
    { value: 'failed', label: 'Échoué' }
  ];

  periodOptions = [
    { value: '', label: 'Toutes les périodes' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' }
  ];

  onSearch() {
    console.log('Recherche:', this.searchTerm);
  }

  onStatusChange() {
    console.log('Statut sélectionné:', this.selectedStatus);
  }

  onPeriodChange() {
    console.log('Période sélectionnée:', this.selectedPeriod);
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'success': return 'status-success';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  }

  getStatusIcon(status: string) {
    switch(status) {
      case 'success': return 'fas fa-check-circle';
      case 'pending': return 'fas fa-hourglass-half';
      case 'failed': return 'fas fa-times';
      default: return '';
    }
  }

  openTransactionModal(transaction: any) {
    this.selectedTransaction = transaction;
    this.showTransactionModal = true;
  }

  closeTransactionModal() {
    this.showTransactionModal = false;
    this.selectedTransaction = null;
  }

  downloadReport() {
    console.log('Téléchargement du rapport pour:', this.selectedTransaction);
    // Ici vous pouvez implémenter la logique de téléchargement
  }
}
