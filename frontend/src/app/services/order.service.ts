import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item';
import { Order } from '../models/order';
import { ArchiveItem } from '../models/archive-item';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  uri = 'http://localhost:4000/orders';

  constructor(private http: HttpClient) { }

  createOrders(clientId: string, clientUsername: string, clientRole: string, items: CartItem[]) {
    return this.http.post<{ message: string, orders: Order[] }>(`${this.uri}/create`, {
      clientId: clientId,
      clientUsername: clientUsername,
      clientRole: clientRole,
      items: items
    });
  }

  getClientOrders(clientId: string) {
    return this.http.get<Order[]>(`${this.uri}/client/${clientId}`);
  }

  getPrinterOrders(printerId: string) {
    return this.http.get<Order[]>(`${this.uri}/printer/${printerId}`);
  }

  changeStatus(orderId: string, status: string) {
    return this.http.put<{ message: string }>(`${this.uri}/status/${orderId}`, {
      status: status
    });
  }

  getArchive(clientId: string) {
    return this.http.get<ArchiveItem[]>(`${this.uri}/archive/${clientId}`);
  }

  cancelOrder(orderId: string, clientId: string) {
    return this.http.put<{ message: string }>(`${this.uri}/cancel/${orderId}`, {
      clientId: clientId
    });
  }
}
