import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentResponse {
  id: number;
  transactionId: string;
  type: 'ORANGE_MONEY' | 'MOOV_MONEY' | 'PAYPAL' | 'BANK_CARD';
  state: 'SUCCESS' | 'PENDING' | 'FAILED';
  madeAt: string;
  amount: number;
}

export interface GiftResponse {
  id: number;
  date: string;
  payment: PaymentResponse;
  campaignId: number;
}

export interface TransactionResponse {
  id: number;
  date: string;
  payment: PaymentResponse;
  campaignId: number;
  campaignTitle: string;
  projectName: string;
  projectDomain: string;
  projectDescription: string;
}

export interface Transaction {
  id: number;
  paymentMethod: string;
  status: 'success' | 'pending' | 'failed';
  statusIcon: string;
  project: string;
  amount: string;
  date: string;
  time: string;
  transactionDate: string;
  transactionStatus: string;
  paymentMethodDetail: string;
  recipientNumber: string;
  transactionReason: string;
  projectDomain?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FondsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Note: Ces endpoints n'existent pas encore dans le backend pour les project owners
  // Les gifts sont liés aux campagnes, donc ils peuvent être récupérés via les campagnes
  getMyGifts(): Observable<GiftResponse[]> {
    // TODO: Implémenter un endpoint dans le backend pour récupérer les gifts reçus par les project owners
    // Pour l'instant, retourner un tableau vide ou utiliser les campagnes
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  getMyTransactions(): Observable<TransactionResponse[]> {
    // TODO: Implémenter un endpoint dans le backend pour récupérer les transactions reçues par les project owners
    // Pour l'instant, retourner un tableau vide
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  // Méthode pour transformer les TransactionResponse en format frontend
  transformTransactionsData(transactions: TransactionResponse[]): Transaction[] {
    return transactions.map(transaction => {
      const payment = transaction.payment;
      const date = new Date(transaction.date);
      
      // Formater la date et l'heure
      const formattedDate = date.toLocaleDateString('fr-FR');
      const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      // Déterminer le statut basé sur l'état du paiement
      let status: 'success' | 'pending' | 'failed';
      let statusIcon: string;
      let transactionStatus: string;
      
      switch (payment.state) {
        case 'SUCCESS':
          status = 'success';
          statusIcon = 'fas fa-check-circle';
          transactionStatus = 'Envoyé';
          break;
        case 'PENDING':
          status = 'pending';
          statusIcon = 'fas fa-hourglass-half';
          transactionStatus = 'En attente';
          break;
        case 'FAILED':
          status = 'failed';
          statusIcon = 'fas fa-times';
          transactionStatus = 'Échoué';
          break;
        default:
          status = 'pending';
          statusIcon = 'fas fa-hourglass-half';
          transactionStatus = 'En attente';
      }

      // Formater le moyen de paiement
      let paymentMethod: string;
      let paymentMethodDetail: string;
      let recipientNumber: string;
      
      switch (payment.type) {
        case 'ORANGE_MONEY':
          paymentMethod = `Orange Money ${this.maskPhoneNumber(payment.transactionId || '')}`;
          paymentMethodDetail = 'Orange Money';
          recipientNumber = payment.transactionId || 'N/A';
          break;
        case 'MOOV_MONEY':
          paymentMethod = `Moov Money ${this.maskPhoneNumber(payment.transactionId || '')}`;
          paymentMethodDetail = 'Moov Money';
          recipientNumber = payment.transactionId || 'N/A';
          break;
        case 'BANK_CARD':
          paymentMethod = `Carte Bancaire ${this.maskCardNumber(payment.transactionId || '')}`;
          paymentMethodDetail = 'Carte Bancaire';
          recipientNumber = this.maskCardNumber(payment.transactionId || '');
          break;
        case 'PAYPAL':
          paymentMethod = `PayPal ${this.maskEmail(payment.transactionId || '')}`;
          paymentMethodDetail = 'PayPal';
          recipientNumber = this.maskEmail(payment.transactionId || '');
          break;
        default:
          paymentMethod = `Paiement ${payment.type}`;
          paymentMethodDetail = payment.type;
          recipientNumber = 'N/A';
      }

      return {
        id: transaction.id,
        paymentMethod,
        status,
        statusIcon,
        project: `${transaction.projectName} ${formattedDate}`,
        amount: `${payment.amount.toLocaleString('fr-FR')} FCFA`,
        date: formattedDate,
        time: formattedTime,
        transactionDate: formattedDate,
        transactionStatus,
        paymentMethodDetail,
        recipientNumber,
        transactionReason: transaction.projectDescription || `Contribution à ${transaction.campaignTitle}`,
        projectDomain: this.getDomainLabel(transaction.projectDomain)
      };
    });
  }

  // Méthode utilitaire pour masquer les numéros de téléphone
  private maskPhoneNumber(phone: string): string {
    if (phone.length < 8) return phone;
    return phone.substring(0, 6) + '****' + phone.substring(phone.length - 2);
  }

  // Méthode utilitaire pour masquer les numéros de carte
  private maskCardNumber(card: string): string {
    if (card.length < 8) return '*******' + card;
    return '*******' + card.substring(card.length - 4);
  }

  // Méthode utilitaire pour masquer les emails
  private maskEmail(email: string): string {
    if (!email.includes('@')) return '****@example.com';
    const parts = email.split('@');
    return '****@' + parts[1];
  }

  // Méthode pour convertir le domain enum en label français
  private getDomainLabel(domain: string): string {
    const domainMap: { [key: string]: string } = {
      'SANTE': 'SANTE',
      'EDUCATION': 'EDUCATION',
      'AGRICULTURE': 'AGRICULTURE',
      'TECHNOLOGIE': 'TECHNOLOGIE',
      'ENVIRONNEMENT': 'ENVIRONNEMENT',
      'ARTISANAT': 'ARTISANAT',
      'COMMERCE': 'COMMERCE',
      'INDUSTRIE': 'INDUSTRIE',
      'TOURISME': 'TOURISME',
      'CULTURE': 'CULTURE',
      'SPORT': 'SPORT'
    };
    return domainMap[domain] || domain;
  }

  // Méthode pour transformer les données du backend en format frontend (ancienne version)
  transformGiftsToTransactions(gifts: GiftResponse[]): Transaction[] {
    return gifts.map(gift => {
      const payment = gift.payment;
      const date = new Date(gift.date);
      
      // Formater la date et l'heure
      const formattedDate = date.toLocaleDateString('fr-FR');
      const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      // Déterminer le statut basé sur l'état du paiement
      let status: 'success' | 'pending' | 'failed';
      let statusIcon: string;
      let transactionStatus: string;
      
      switch (payment.state) {
        case 'SUCCESS':
          status = 'success';
          statusIcon = 'fas fa-check-circle';
          transactionStatus = 'Envoyé';
          break;
        case 'PENDING':
          status = 'pending';
          statusIcon = 'fas fa-hourglass-half';
          transactionStatus = 'En attente';
          break;
        case 'FAILED':
          status = 'failed';
          statusIcon = 'fas fa-times';
          transactionStatus = 'Échoué';
          break;
        default:
          status = 'pending';
          statusIcon = 'fas fa-hourglass-half';
          transactionStatus = 'En attente';
      }

      // Formater le moyen de paiement
      let paymentMethod: string;
      let paymentMethodDetail: string;
      let recipientNumber: string;
      
      switch (payment.type) {
        case 'ORANGE_MONEY':
          paymentMethod = `Orange Money +22372****72`;
          paymentMethodDetail = 'Orange Money';
          recipientNumber = '+22372001272';
          break;
        case 'MOOV_MONEY':
          paymentMethod = `Moov Money +22372****72`;
          paymentMethodDetail = 'Moov Money';
          recipientNumber = '+22372001272';
          break;
        case 'BANK_CARD':
          paymentMethod = `Carte Bancaire *******9802`;
          paymentMethodDetail = 'Carte Bancaire';
          recipientNumber = '*******9802';
          break;
        case 'PAYPAL':
          paymentMethod = `PayPal ****@example.com`;
          paymentMethodDetail = 'PayPal';
          recipientNumber = '****@example.com';
          break;
        default:
          paymentMethod = `Paiement ${payment.type}`;
          paymentMethodDetail = payment.type;
          recipientNumber = 'N/A';
      }

      return {
        id: gift.id,
        paymentMethod,
        status,
        statusIcon,
        project: `Campagne ${gift.campaignId} - ${formattedDate}`,
        amount: `${payment.amount.toLocaleString('fr-FR')} FCFA`,
        date: formattedDate,
        time: formattedTime,
        transactionDate: formattedDate,
        transactionStatus,
        paymentMethodDetail,
        recipientNumber,
        transactionReason: `Contribution à la campagne ${gift.campaignId}`
      };
    });
  }
}
