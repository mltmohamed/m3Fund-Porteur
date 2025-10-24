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
}

@Injectable({
  providedIn: 'root'
})
export class FondsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyGifts(): Observable<GiftResponse[]> {
    return this.http.get<GiftResponse[]>(`${this.apiUrl}/projects/campaigns/my-gifts`);
  }

  // Méthode pour transformer les données du backend en format frontend
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
