import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item';
import { Tender } from '../models/tender';

@Injectable({
  providedIn: 'root'
})
export class TenderService {

  uri = 'http://localhost:4000/tenders';

  constructor(private http: HttpClient) { }

  createTender(
    companyId: string,
    companyUsername: string,
    companyName: string,
    companyRole: string,
    items: CartItem[]
  ) {
    return this.http.post<{ message: string, tender: Tender | null }>(`${this.uri}/create`, {
      companyId: companyId,
      companyUsername: companyUsername,
      companyName: companyName,
      companyRole: companyRole,
      items: items
    });
  }

  getCompanyTenders(companyId: string) {
    return this.http.get<Tender[]>(`${this.uri}/company/${companyId}`);
  }

  getOpenTenders() {
    return this.http.get<Tender[]>(`${this.uri}/open`);
  }

  submitBid(tenderId: string, printerId: string, printerName: string, totalAmount: number) {
    return this.http.post<{ message: string }>(`${this.uri}/${tenderId}/bid`, {
      printerId: printerId,
      printerName: printerName,
      totalAmount: totalAmount
    });
  }
}
