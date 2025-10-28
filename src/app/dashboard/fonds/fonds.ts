import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FondsService, Transaction } from '../../services/fonds.service';

@Component({
  selector: 'app-fonds',
  imports: [CommonModule, FormsModule],
  templateUrl: './fonds.html',
  styleUrl: './fonds.css'
})
export class Fonds implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedPeriod: string = '';
  showTransactionModal: boolean = false;
  selectedTransaction: any = null;
  loading: boolean = false;
  error: string = '';

  // Données des transactions
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];

  // Données de test (à supprimer après intégration)
  mockTransactions: Transaction[] = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
      id: 4,
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

  constructor(private fondsService: FondsService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.error = '';
    
    this.fondsService.getMyTransactions().subscribe({
      next: (transactions) => {
        this.transactions = this.fondsService.transformTransactionsData(transactions);
        this.filteredTransactions = [...this.transactions];
        this.loading = false;
        console.log('Transactions chargées:', this.transactions);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des transactions:', error);
        this.error = 'Erreur lors du chargement des transactions';
        // Utiliser les données de test en cas d'erreur
        this.transactions = this.mockTransactions;
        this.filteredTransactions = [...this.transactions];
        this.loading = false;
      }
    });
  }

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
    this.applyFilters();
  }

  onStatusChange() {
    this.applyFilters();
  }

  onPeriodChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.transactions];

    // Filtre par terme de recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.project.toLowerCase().includes(searchLower) ||
        transaction.paymentMethod.toLowerCase().includes(searchLower) ||
        transaction.transactionReason.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par statut
    if (this.selectedStatus) {
      filtered = filtered.filter(transaction => transaction.status === this.selectedStatus);
    }

    // Filtre par période
    if (this.selectedPeriod) {
      const now = new Date();
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        
        switch (this.selectedPeriod) {
          case 'today':
            return transactionDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return transactionDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return transactionDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    this.filteredTransactions = filtered;
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

  refreshTransactions() {
    this.loadTransactions();
  }
}
