import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FondsService, Transaction } from '../../services/fonds.service';
import { ProfileService } from '../../services/profile.service';
import { ProfileResponse } from '../../interfaces/profile.interface';
import { CampaignService } from '../../services/campaign.service';
import { CampaignResponse } from '../../interfaces/campaign.interface';
import { NotificationService, NotificationResponse } from '../../services/notification.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-fonds',
  imports: [CommonModule, FormsModule],
  templateUrl: './fonds.html',
  styleUrl: './fonds.css'
})
export class Fonds implements OnInit {
  searchTerm: string = '';
  selectedProject: string = '';
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
  
  // Liste des projets uniques pour le filtre
  projectOptions: Array<{value: string, label: string}> = [];

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

  constructor(private fondsService: FondsService, private profileService: ProfileService, private campaignService: CampaignService, private notificationService: NotificationService) {}

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
        
        // Charger les notifications pour extraire les contributions détaillées
        this.notificationService.getAllNotifications().subscribe({
          next: (notifications) => {
            // Transformer les notifications en transactions contributions
            const contributionTransactions = this.buildTransactionsFromNotifications(notifications);
            
            // Combiner les deux types de transactions
            this.transactions = [...contributionTransactions, ...adminTransactions];
            
            // Trier par date décroissante (les plus récentes en premier)
            this.sortTransactionsByDate();
            
            this.filteredTransactions = [...this.transactions];
            
            // Extraire les projets uniques pour le filtre
            this.buildProjectOptions();
            
            this.categorizeTransactions();
            this.loading = false;
            console.log('Transactions chargées (contributions + admin):', this.transactions);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des notifications:', error);
            // Même si les notifications échouent, afficher les transactions admin
            this.transactions = adminTransactions;
            this.sortTransactionsByDate();
            this.filteredTransactions = [...this.transactions];
            this.buildProjectOptions();
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
        this.sortTransactionsByDate();
        this.filteredTransactions = [...this.transactions];
        this.buildProjectOptions();
        this.categorizeTransactions();
        this.loading = false;
      }
    });
  }

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

  onProjectChange() {
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

    // Filtre par projet
    if (this.selectedProject) {
      filtered = filtered.filter(transaction => {
        const projectName = this.extractProjectName(transaction.project);
        return projectName === this.selectedProject;
      });
    }

    // Filtre par type de source
    if (this.selectedSourceType) {
      filtered = filtered.filter(transaction => transaction.sourceType === this.selectedSourceType);
    }

    // Filtre par période
    if (this.selectedPeriod) {
      const now = new Date();
      filtered = filtered.filter(transaction => {
        // Parser la date au format français (jj/mm/aaaa)
        const dateParts = transaction.date.split('/');
        if (dateParts.length !== 3) return false;
        
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Les mois commencent à 0 en JavaScript
        const year = parseInt(dateParts[2], 10);
        const transactionDate = new Date(year, month, day);
        
        switch (this.selectedPeriod) {
          case 'today':
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            return transactionDate >= todayStart && transactionDate <= todayEnd;
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
    if (!this.selectedTransaction) {
      console.error('Aucune transaction sélectionnée');
      return;
    }

    console.log('Génération du rapport PDF pour:', this.selectedTransaction);

    // Créer un nouveau document PDF
    const doc = new jsPDF();
    
    // Configurer les couleurs
    const primaryColor: [number, number, number] = [6, 166, 100]; // Vert M3Fund
    const darkGray: [number, number, number] = [51, 51, 51];
    const lightGray: [number, number, number] = [128, 128, 128];
    
    let yPosition = 20;
    
    // En-tête du rapport
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DE TRANSACTION', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('M3FUND', 105, 22, { align: 'center' });
    
    yPosition = 45;
    
    // Informations de base
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID Transaction: ${this.selectedTransaction.id}`, 20, yPosition);
    doc.text(`Date: ${this.selectedTransaction.transactionDate}`, 120, yPosition);
    yPosition += 6;
    doc.text(`Heure: ${this.selectedTransaction.time}`, 120, yPosition);
    
    yPosition += 15;
    
    // Section: Informations de la transaction
    this.addSectionTitle(doc, 'INFORMATIONS DE LA TRANSACTION', yPosition, primaryColor);
    yPosition += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Projet/Campagne:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    const projectLines = doc.splitTextToSize(this.selectedTransaction.project, 170);
    doc.text(projectLines, 25, yPosition);
    yPosition += projectLines.length * 6 + 4;
    
    if (this.selectedTransaction.projectDomain) {
      doc.setFont('helvetica', 'bold');
      doc.text('Type:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.selectedTransaction.projectDomain, 40, yPosition);
      yPosition += 8;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Montant:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(this.selectedTransaction.amount, 45, yPosition);
    doc.setFontSize(10);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    yPosition += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Statut:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 150, 0);
    doc.text(this.selectedTransaction.transactionStatus, 40, yPosition);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    yPosition += 15;
    
    // Section: Détails du paiement
    this.addSectionTitle(doc, 'DÉTAILS DU PAIEMENT', yPosition, primaryColor);
    yPosition += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Moyen de paiement:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    doc.text(this.selectedTransaction.paymentMethodDetail, 25, yPosition);
    yPosition += 8;
    
    if (this.selectedTransaction.contributorName) {
      doc.setFont('helvetica', 'bold');
      doc.text('Contributeur:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 6;
      doc.text(this.selectedTransaction.contributorName, 25, yPosition);
      yPosition += 8;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Destinataire:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    doc.text(this.selectedTransaction.recipientNumber, 25, yPosition);
    yPosition += 15;
    
    // Section: Description
    this.addSectionTitle(doc, 'DESCRIPTION', yPosition, primaryColor);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    const reasonLines = doc.splitTextToSize(this.selectedTransaction.transactionReason, 170);
    doc.text(reasonLines, 20, yPosition);
    yPosition += reasonLines.length * 6 + 15;
    
    // Pied de page
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFontSize(8);
    const generatedDate = `Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
    doc.text(generatedDate, 105, 280, { align: 'center' });
    
    // Télécharger le PDF
    const fileName = `Rapport_Transaction_${this.selectedTransaction.id}_${this.selectedTransaction.date.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    
    console.log('✓ Rapport PDF téléchargé:', fileName);
  }

  private addSectionTitle(doc: jsPDF, title: string, yPosition: number, color: [number, number, number]) {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(15, yPosition - 5, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPosition);
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  }

  getCategoryClass(domain: string): string {
    // Retourner une classe CSS en fonction du domaine
    const domainLower = domain.toLowerCase();
    if (domainLower.includes('contribution') || domainLower.includes('donation')) {
      return 'category-contribution';
    }
    if (domainLower.includes('admin') || domainLower.includes('encaissement')) {
      return 'category-admin';
    }
    if (domainLower.includes('investment') || domainLower.includes('investissement')) {
      return 'category-investment';
    }
    if (domainLower.includes('volunteer') || domainLower.includes('volontariat')) {
      return 'category-volunteer';
    }
    return 'category-default';
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

  private sortTransactionsByDate() {
    this.transactions.sort((a, b) => {
      // Parser les dates au format français (jj/mm/aaaa)
      const parseDate = (dateStr: string): Date => {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return new Date(0);
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      };
      
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      
      // Si les dates sont égales, trier par heure
      if (dateA.getTime() === dateB.getTime()) {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeB.localeCompare(timeA); // Ordre décroissant
      }
      
      // Trier par date décroissante (les plus récentes en premier)
      return dateB.getTime() - dateA.getTime();
    });
  }

  private buildProjectOptions() {
    // Extraire tous les noms de projets uniques
    const projectNames = new Set<string>();
    
    this.transactions.forEach(transaction => {
      const projectName = this.extractProjectName(transaction.project);
      if (projectName) {
        projectNames.add(projectName);
      }
    });
    
    // Créer les options de filtre
    this.projectOptions = [
      { value: '', label: 'Tous les projets' },
      ...Array.from(projectNames).map(name => ({
        value: name,
        label: name
      }))
    ];
  }

  private extractProjectName(projectText: string): string {
    // Extraire le nom du projet en enlevant la date et l'heure
    // Format attendu: "Nom du Projet - 24/11/2025 à 16:24" ou "Nom du Projet 24/11/2025"
    const match = projectText.match(/^(.+?)\s*[-–]?\s*\d{2}\/\d{2}\/\d{4}/);
    return match ? match[1].trim() : projectText.split(' - ')[0].trim();
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

  private buildTransactionsFromNotifications(notifications: NotificationResponse[]): Transaction[] {
    const transactions: Transaction[] = [];
    
    console.log('=== PARSING CONTRIBUTION NOTIFICATIONS ===');
    console.log('Total notifications:', notifications.length);
    
    notifications.forEach(notification => {
      const content = notification.content || notification.message || '';
      const title = notification.title || '';
      const type = notification.type || '';
      
      console.log('---');
      console.log('Notification:', { id: notification.id, title, type, content });
      
      // Vérifier si c'est une notification de contribution
      if (type === 'NEW_CONTRIBUTION' || title.toLowerCase().includes('contribution')) {
        console.log('✓ FOUND CONTRIBUTION NOTIFICATION');
        
        // Extraire le nom du contributeur - Pattern: "Prénom Nom a contribué"
        // Essayer plusieurs patterns pour être plus flexible
        let contributorMatch = content.match(/^([A-Za-zÀ-ÿ]+\s+[A-Za-zÀ-ÿ]+)\s+a\s+contribué/i);
        if (!contributorMatch) {
          // Pattern alternatif si le format est différent
          contributorMatch = content.match(/([A-Za-zÀ-ÿ]+\s+[A-Za-zÀ-ÿ]+)/);
        }
        const contributorName = contributorMatch && contributorMatch[1] ? contributorMatch[1].trim() : 'Contributeur Anonyme';
        console.log('Extracted contributor name:', contributorName);
        console.log('Match result:', contributorMatch);
        
        // Calculer les initiales (première lettre du prénom + première lettre du nom)
        const nameParts = contributorName.split(' ').filter(p => p.length > 0);
        const initials = nameParts.length >= 2 
          ? `${nameParts[0].charAt(0).toUpperCase()}${nameParts[nameParts.length - 1].charAt(0).toUpperCase()}`
          : contributorName.substring(0, 2).toUpperCase();
        console.log('Initials:', initials);
        
        // Extraire le montant - Pattern: "XXXX FCFA" ou "XXXX.X FCFA"
        const amountMatch = content.match(/([\d,.]+)\s*FCFA/);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(/[,\s]/g, '')) : 0;
        console.log('Amount:', amount);
        
        // Extraire le nom du projet/campagne - Pattern: "dans votre projet XXX"
        const projectMatch = content.match(/dans votre projet\s+([^.]+)/i);
        const projectName = projectMatch ? projectMatch[1].trim() : 'Projet';
        console.log('Project name:', projectName);
        
        // Utiliser la date de la notification
        const date = new Date(notification.sentAt || notification.createdAt || new Date());
        const formattedDate = date.toLocaleDateString('fr-FR');
        const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        transactions.push({
          id: notification.id,
          paymentMethod: `${contributorName} - ${amount.toLocaleString('fr-FR')} FCFA`,
          status: 'success',
          statusIcon: 'fas fa-check-circle',
          project: `${projectName} - ${formattedDate} à ${formattedTime}`,
          amount: `${amount.toLocaleString('fr-FR')} FCFA`,
          date: formattedDate,
          time: formattedTime,
          transactionDate: formattedDate,
          transactionStatus: 'Envoyé',
          paymentMethodDetail: `Contribution de ${contributorName}`,
          recipientNumber: contributorName,
          transactionReason: content,
          sourceType: 'CONTRIBUTION',
          contributorName: contributorName,
          contributorInitials: initials,
          projectDomain: 'Contribution' // Sera mis à jour quand on aura l'info du domaine
        });
        
        console.log('✓ Created contribution transaction with name:', contributorName, 'and initials:', initials);
      }
    });
    
    console.log('=== CONTRIBUTION TRANSACTIONS CREATED:', transactions.length, '===');
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
        sourceType: 'ADMIN',
        projectDomain: 'Encaissement Admin'
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
            sourceType: 'ADMIN',
            projectDomain: 'Encaissement Admin'
          });
        }
      }
    });
    
    console.log('=== ADMIN TRANSACTIONS CREATED:', transactions.length, '===');
    return transactions;
  }
}
