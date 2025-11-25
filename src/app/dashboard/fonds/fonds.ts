import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FondsService, Transaction } from '../../services/fonds.service';
import { ProfileService } from '../../services/profile.service';
import { ProfileResponse } from '../../interfaces/profile.interface';
import { CampaignService } from '../../services/campaign.service';
import { CampaignResponse } from '../../interfaces/campaign.interface';

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
  selectedSourceType: string = '';
  showTransactionModal: boolean = false;
  selectedTransaction: any = null;
  loading: boolean = false;
  error: string = '';
  totalFund: number = 0;
  totalFundDisplay: string = '';
  availableToDisburseTotal: number = 0;
  availableOM: string = '0 FCFA';
  availableMoov: string = '0 FCFA';
  availableCard: string = '0 FCFA';

  // Données des transactions
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  transactionsSuccess: Transaction[] = [];
  transactionsPending: Transaction[] = [];
  transactionsFailed: Transaction[] = [];

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
      transactionDate: '13/10/2025',
      transactionStatus: 'Envoyé',
      paymentMethodDetail: 'Orange Money',
      recipientNumber: '+22372001272',
      transactionReason: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      sourceType: 'CONTRIBUTION'
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
      transactionDate: '08/08/2025',
      transactionStatus: 'En attente',
      paymentMethodDetail: 'Carte Bancaire',
      recipientNumber: '*******9802',
      transactionReason: 'Construction d\'une école avec dispositifs intégrés pour le suivi pédagogique administratif des élèves.',
      sourceType: 'CONTRIBUTION'
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
      transactionDate: '21/10/2025',
      transactionStatus: 'Échoué',
      paymentMethodDetail: 'Orange Money',
      recipientNumber: '+22372001272',
      transactionReason: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      sourceType: 'CONTRIBUTION'
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
      transactionDate: '09/10/2025',
      transactionStatus: 'Échoué',
      paymentMethodDetail: 'Orange Money',
      recipientNumber: '+22372001272',
      transactionReason: 'Conception d\'une application mobile pour consultations médicales à distance avec suivi des patients.',
      sourceType: 'CONTRIBUTION'
    },
    {
      id: 5,
      paymentMethod: 'Virement Admin',
      status: 'success',
      statusIcon: 'fas fa-check-circle',
      project: 'Décaissement Admin - Projet Agriculture 15/11/2025',
      amount: '1,500,000 FCFA',
      date: '15/11/2025',
      time: '09:00',
      transactionDate: '15/11/2025',
      transactionStatus: 'Envoyé',
      paymentMethodDetail: 'Virement Admin',
      recipientNumber: 'Admin M3Fund',
      transactionReason: 'Décaissement de fonds validé par l\'administration pour le projet agricole.',
      sourceType: 'ADMIN'
    },
    {
      id: 6,
      paymentMethod: 'Virement Admin',
      status: 'success',
      statusIcon: 'fas fa-check-circle',
      project: 'Décaissement Admin - Campagne Santé 20/11/2025',
      amount: '800,000 FCFA',
      date: '20/11/2025',
      time: '14:00',
      transactionDate: '20/11/2025',
      transactionStatus: 'Envoyé',
      paymentMethodDetail: 'Virement Admin',
      recipientNumber: 'Admin M3Fund',
      transactionReason: 'Encaissement de fonds depuis l\'admin suite à validation de campagne.',
      sourceType: 'ADMIN'
    }
  ];

  constructor(private fondsService: FondsService, private profileService: ProfileService, private campaignService: CampaignService) {}

  ngOnInit() {
    this.loadUserFund();
    this.loadAvailableToDisburse();
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.error = '';
    
    // Charger le profil utilisateur d'abord pour vérifier les nouveaux décaissements admin
    this.profileService.getCurrentProfile().subscribe({
      next: (profile: ProfileResponse) => {
        // Créer les transactions admin basées sur les changements du fund
        const adminTransactions = this.buildAdminDisbursementTransactions(profile);
        
        // Charger les vraies campagnes pour extraire les contributions
        this.campaignService.getMyCampaigns().subscribe({      
          next: (campaigns) => {
            // Transformer les campagnes en transactions contributions
            const contributionTransactions = this.buildTransactionsFromCampaigns(campaigns);
            
            // Combiner les deux types de transactions
            this.transactions = [...contributionTransactions, ...adminTransactions];
            this.filteredTransactions = [...this.transactions];
            this.categorizeTransactions();
            this.loading = false;
            console.log('Transactions chargées (contributions + admin):', this.transactions);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des transactions:', error);
            // Même si les campagnes échouent, afficher les transactions admin
            this.transactions = adminTransactions;
            this.filteredTransactions = [...this.transactions];
            this.categorizeTransactions();
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.error = 'Erreur lors du chargement des transactions';
        // Utiliser les données de test en cas d'erreur
        this.transactions = this.mockTransactions;
        this.filteredTransactions = [...this.transactions];
        this.categorizeTransactions();
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

  sourceTypeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'CONTRIBUTION', label: 'Contributions' },
    { value: 'ADMIN', label: 'Encaissé depuis Admin' }
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

  onSourceTypeChange() {
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

    // Filtre par type de source
    if (this.selectedSourceType) {
      filtered = filtered.filter(transaction => transaction.sourceType === this.selectedSourceType);
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
    this.categorizeTransactions();
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

  private loadUserFund() {
    this.profileService.getCurrentProfile().subscribe({
      next: (profile: ProfileResponse) => {
        console.log('=== USER PROFILE DATA ===');
        console.log('Full profile:', profile);
        console.log('Fund value:', profile.fund);
        this.totalFund = Number(profile.fund || 0);
        this.totalFundDisplay = `${this.totalFund.toLocaleString('fr-FR')} FCFA`;
      },
      error: () => {
        this.totalFund = 0;
        this.totalFundDisplay = '0 FCFA';
      }
    });
  }

  private loadAvailableToDisburse() {
    this.campaignService.filterMyCampaignsByStatus('FINISHED').subscribe({
      next: (campaigns: CampaignResponse[]) => {
        const totalContributed = campaigns.reduce((sum, c) => sum + (c.currentFund || 0), 0);
        this.availableToDisburseTotal = Math.floor(totalContributed * 0.9);
        this.availableOM = `${this.availableToDisburseTotal.toLocaleString('fr-FR')} FCFA`;
        this.availableMoov = `${this.availableToDisburseTotal.toLocaleString('fr-FR')} FCFA`;
        this.availableCard = `${this.availableToDisburseTotal.toLocaleString('fr-FR')} FCFA`;
      },
      error: () => {
        this.availableToDisburseTotal = 0;
        this.availableOM = '0 FCFA';
        this.availableMoov = '0 FCFA';
        this.availableCard = '0 FCFA';
      }
    });
  }

  private categorizeTransactions() {
    this.transactionsSuccess = this.filteredTransactions.filter(t => t.status === 'success');
    this.transactionsPending = this.filteredTransactions.filter(t => t.status === 'pending');
    this.transactionsFailed = this.filteredTransactions.filter(t => t.status === 'failed');
  }

  private buildTransactionsFromCampaigns(campaigns: CampaignResponse[]): Transaction[] {
    const transactions: Transaction[] = [];
    
    campaigns.forEach(campaign => {
      // Si la campagne a des contributions (currentFund > 0), créer des transactions
      if (campaign.currentFund && campaign.currentFund > 0) {
        const date = new Date(campaign.startDate || campaign.createdAt || new Date());
        const formattedDate = date.toLocaleDateString('fr-FR');
        const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        // Créer une transaction pour cette contribution
        transactions.push({
          id: campaign.id,
          paymentMethod: 'Contribution',
          status: 'success',
          statusIcon: 'fas fa-check-circle',
          project: `${campaign.title || 'Campagne'} ${formattedDate}`,
          amount: `${(campaign.currentFund || 0).toLocaleString('fr-FR')} FCFA`,
          date: formattedDate,
          time: formattedTime,
          transactionDate: formattedDate,
          transactionStatus: 'Envoyé',
          paymentMethodDetail: 'Contribution',
          recipientNumber: 'Contributeurs',
          transactionReason: campaign.description || `Contributions à la campagne ${campaign.title}`,
          projectDomain: campaign.type || 'DONATION',
          sourceType: 'CONTRIBUTION'
        });
      }
    });
    
    return transactions;
  }

  private buildAdminDisbursementTransactions(profile: ProfileResponse): Transaction[] {
    const transactions: Transaction[] = [];
    const currentFund = Number(profile.fund || 0);
    
    console.log('=== TRACKING ADMIN DISBURSEMENTS ===');
    console.log('Current fund value:', currentFund);
    
    // Récupérer l'historique des fonds stocké dans localStorage
    const fundHistoryKey = `fund_history_${profile.id || 'user'}`;
    const storedHistory = localStorage.getItem(fundHistoryKey);
    let fundHistory: Array<{amount: number, date: string}> = [];
    
    if (storedHistory) {
      try {
        fundHistory = JSON.parse(storedHistory);
        console.log('Fund history from storage:', fundHistory);
      } catch (e) {
        console.error('Error parsing fund history:', e);
        fundHistory = [];
      }
    }
    
    // Si aucun historique n'existe et que le fund est > 0, créer l'historique initial
    if (fundHistory.length === 0 && currentFund > 0) {
      console.log('No history found but fund > 0. Creating initial entry for existing fund.');
      // Supposer que ce fund existe depuis hier (date approximative)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      fundHistory = [
        { amount: currentFund, date: yesterday.toISOString() }
      ];
      localStorage.setItem(fundHistoryKey, JSON.stringify(fundHistory));
      
      // Créer une transaction pour ce décaissement existant
      const formattedDate = yesterday.toLocaleDateString('fr-FR');
      const formattedTime = yesterday.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      transactions.push({
        id: Date.now(),
        paymentMethod: 'Virement Admin',
        status: 'success',
        statusIcon: 'fas fa-check-circle',
        project: `Décaissement Admin - ${formattedDate}`,
        amount: `${currentFund.toLocaleString('fr-FR')} FCFA`,
        date: formattedDate,
        time: formattedTime,
        transactionDate: formattedDate,
        transactionStatus: 'Envoyé',
        paymentMethodDetail: 'Virement Admin',
        recipientNumber: 'Admin M3Fund',
        transactionReason: `Encaissement de fonds depuis l'administration pour un montant de ${currentFund.toLocaleString('fr-FR')} FCFA`,
        sourceType: 'ADMIN'
      });
      
      console.log('✓ CREATED INITIAL DISBURSEMENT TRANSACTION for', currentFund, 'FCFA');
      return transactions;
    }
    
    // Vérifier si le fund a augmenté
    const lastRecordedFund = fundHistory.length > 0 ? fundHistory[fundHistory.length - 1].amount : 0;
    console.log('Last recorded fund:', lastRecordedFund);
    
    if (currentFund > lastRecordedFund) {
      const disbursementAmount = currentFund - lastRecordedFund;
      console.log('✓ NEW DISBURSEMENT DETECTED:', disbursementAmount, 'FCFA');
      
      // Ajouter le nouveau décaissement à l'historique
      const newEntry = {
        amount: currentFund,
        date: new Date().toISOString()
      };
      fundHistory.push(newEntry);
      
      // Sauvegarder l'historique mis à jour
      localStorage.setItem(fundHistoryKey, JSON.stringify(fundHistory));
      
      // Créer une transaction pour ce décaissement
      const date = new Date();
      const formattedDate = date.toLocaleDateString('fr-FR');
      const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      transactions.push({
        id: Date.now(),
        paymentMethod: 'Virement Admin',
        status: 'success',
        statusIcon: 'fas fa-check-circle',
        project: `Décaissement Admin - ${formattedDate}`,
        amount: `${disbursementAmount.toLocaleString('fr-FR')} FCFA`,
        date: formattedDate,
        time: formattedTime,
        transactionDate: formattedDate,
        transactionStatus: 'Envoyé',
        paymentMethodDetail: 'Virement Admin',
        recipientNumber: 'Admin M3Fund',
        transactionReason: `Encaissement de fonds depuis l'administration pour un montant de ${disbursementAmount.toLocaleString('fr-FR')} FCFA`,
        sourceType: 'ADMIN'
      });
    } else if (currentFund === lastRecordedFund) {
      console.log('No new disbursement detected');
    } else {
      console.log('Fund decreased or reset - updating baseline');
      // Si le fund a diminué, mettre à jour le baseline
      fundHistory = [{ amount: currentFund, date: new Date().toISOString() }];
      localStorage.setItem(fundHistoryKey, JSON.stringify(fundHistory));
    }
    
    // Charger toutes les transactions admin de l'historique
    fundHistory.forEach((entry, index) => {
      if (index === 0 && fundHistory.length === 1) {
        // Premier et seul entry - afficher comme décaissement initial
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('fr-FR');
        const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        transactions.push({
          id: Date.now() + index,
          paymentMethod: 'Virement Admin',
          status: 'success',
          statusIcon: 'fas fa-check-circle',
          project: `Décaissement Admin - ${formattedDate}`,
          amount: `${entry.amount.toLocaleString('fr-FR')} FCFA`,
          date: formattedDate,
          time: formattedTime,
          transactionDate: formattedDate,
          transactionStatus: 'Envoyé',
          paymentMethodDetail: 'Virement Admin',
          recipientNumber: 'Admin M3Fund',
          transactionReason: `Encaissement de fonds depuis l'administration pour un montant de ${entry.amount.toLocaleString('fr-FR')} FCFA`,
          sourceType: 'ADMIN'
        });
      } else if (index > 0) {
        // Entrées suivantes - calculer la différence
        const previousAmount = fundHistory[index - 1].amount;
        const disbursementAmount = entry.amount - previousAmount;
        
        if (disbursementAmount > 0) {
          const date = new Date(entry.date);
          const formattedDate = date.toLocaleDateString('fr-FR');
          const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          
          transactions.push({
            id: Date.now() + index,
            paymentMethod: 'Virement Admin',
            status: 'success',
            statusIcon: 'fas fa-check-circle',
            project: `Décaissement Admin - ${formattedDate}`,
            amount: `${disbursementAmount.toLocaleString('fr-FR')} FCFA`,
            date: formattedDate,
            time: formattedTime,
            transactionDate: formattedDate,
            transactionStatus: 'Envoyé',
            paymentMethodDetail: 'Virement Admin',
            recipientNumber: 'Admin M3Fund',
            transactionReason: `Encaissement de fonds depuis l'administration pour un montant de ${disbursementAmount.toLocaleString('fr-FR')} FCFA`,
            sourceType: 'ADMIN'
          });
        }
      }
    });
    
    console.log('=== ADMIN TRANSACTIONS CREATED:', transactions.length, '===');
    return transactions;
  }
}
