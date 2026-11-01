import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Order } from '../../models/order';
import { User } from '../../models/user';
import { OrderService } from '../../services/order.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-printer-orders',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './printer-orders.component.html',
  styleUrl: './printer-orders.component.css'
})
export class PrinterOrdersComponent implements OnInit {

  user = new User();
  orders: Order[] = [];
  message = '';

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null || JSON.parse(storedUser).role != 'printer') {
      this.router.navigate(['/']);
      return;
    }

    this.user = JSON.parse(storedUser);
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getPrinterOrders(this.user._id).subscribe((orders) => {
      this.orders = orders;
    });
  }

  changeStatus(order: Order, status: string) {
    this.orderService.changeStatus(order._id, status).subscribe((response) => {
      this.message = response.message;
      this.loadOrders();
    });
  }

  statusName(status: string) {
    let names: { [key: string]: string } = {
      ordered: 'Naručeno',
      printing: 'U štampi',
      delivered: 'Isporučeno',
      received: 'Primljeno'
    };
    return names[status] || status;
  }
}
