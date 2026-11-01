import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartItem } from '../../models/cart-item';
import { User } from '../../models/user';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { TenderService } from '../../services/tender.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  items: CartItem[] = [];
  user = new User();
  message = '';
  success = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private tenderService: TenderService,
    private router: Router
  ) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null) {
      this.router.navigate(['/']);
      return;
    }

    this.user = JSON.parse(storedUser);
    this.items = this.cartService.getItems();
  }

  groups() {
    let printerIds = [...new Set(this.items.map((item) => item.printerId))];

    return printerIds.map((printerId) => {
      let groupItems = this.items.filter((item) => item.printerId == printerId);
      return {
        printerId: printerId,
        printerName: groupItems[0].printerName,
        city: groupItems[0].city,
        items: groupItems,
        total: groupItems.reduce((sum, item) =>
          sum + (item.unitPrice + item.additionalPrice) * item.quantity, 0)
      };
    });
  }

  removeItem(item: CartItem) {
    let index = this.items.indexOf(item);
    this.cartService.removeItem(index);
    this.items = this.cartService.getItems();
  }

  total() {
    return this.items.reduce((sum, item) =>
      sum + (item.unitPrice + item.additionalPrice) * item.quantity, 0);
  }

  confirmOrder() {
    this.message = '';
    this.success = false;

    if (this.user.role == 'company') {
      this.tenderService.createTender(
        this.user._id,
        this.user.username,
        this.user.companyName,
        this.user.role,
        this.items
      ).subscribe((response) => {
        this.message = response.message;

        if (response.tender != null) {
          this.success = true;
          this.cartService.clear();
          this.items = [];
        }
      });
      return;
    }

    this.orderService.createOrders(
      this.user._id,
      this.user.username,
      this.user.role,
      this.items
    ).subscribe((response) => {
      this.message = response.message;

      if (response.orders.length > 0) {
        this.success = true;
        this.cartService.clear();
        this.items = [];
      }
    });
  }
}
