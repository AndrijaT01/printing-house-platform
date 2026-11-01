import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArchiveItem } from '../../models/archive-item';
import { User } from '../../models/user';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-archive',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './product-archive.component.html',
  styleUrl: './product-archive.component.css'
})
export class ProductArchiveComponent implements OnInit {

  user = new User();
  items: ArchiveItem[] = [];
  comments: { [key: string]: string } = {};
  sortOption = 'date';
  message = '';
  success = false;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null) {
      this.router.navigate(['/']);
      return;
    }

    this.user = JSON.parse(storedUser);

    if (this.user.role != 'person' && this.user.role != 'company') {
      this.router.navigate(['/']);
      return;
    }

    this.loadArchive();
  }

  loadArchive() {
    this.orderService.getArchive(this.user._id).subscribe((items) => {
      this.items = items;
    });
  }

  sortedItems() {
    let result = [...this.items];

    if (this.sortOption == 'name') {
      return result.sort((first, second) => first.productName.localeCompare(second.productName));
    }

    if (this.sortOption == 'quantity') {
      return result.sort((first, second) => second.quantity - first.quantity);
    }

    if (this.sortOption == 'printer') {
      return result.sort((first, second) => first.printerName.localeCompare(second.printerName));
    }

    return result.sort((first, second) =>
      new Date(second.orderDate).getTime() - new Date(first.orderDate).getTime()
    );
  }

  orderGroups() {
    let sortedItems = this.sortedItems();
    let orderIds = [...new Set(sortedItems.map((item) => item.orderId))];

    return orderIds.map((orderId) => {
      let orderItems = sortedItems.filter((item) => item.orderId == orderId);
      return {
        orderId: orderId,
        invoiceId: orderItems[0].invoiceId,
        printerName: orderItems[0].printerName,
        city: orderItems[0].city,
        status: orderItems[0].status,
        orderDate: orderItems[0].orderDate,
        items: orderItems
      };
    });
  }

  confirmReceived(item: ArchiveItem) {
    this.orderService.changeStatus(item.orderId, 'received').subscribe((response) => {
      this.showMessage(response.message);
      this.loadArchive();
    });
  }

  rate(item: ArchiveItem, value: string) {
    this.productService.rateProduct(item.productId, this.user._id, value)
      .subscribe((response) => {
        this.showMessage(response.message);

        if (response.message == 'Ocena je sacuvana' ||
            response.message == 'Vec ste izabrali tu ocenu') {
          for (let archiveItem of this.items) {
            if (archiveItem.productId == item.productId) {
              archiveItem.userRating = value;
            }
          }
        }
      });
  }

  addComment(item: ArchiveItem) {
    let text = (this.comments[item.productId] || '').trim();

    if (text == '') {
      this.message = 'Komentar ne sme biti prazan';
      this.success = false;
      return;
    }

    this.productService.addComment(
      item.productId,
      this.user._id,
      this.user.username,
      text
    ).subscribe((response) => {
      this.showMessage(response.message);

      if (response.message == 'Komentar je dodat') {
        this.comments[item.productId] = '';
      }
    });
  }

  showMessage(message: string) {
    this.message = message;
    this.success = message == 'Status porudzbine je uspesno promenjen' ||
      message == 'Ocena je sacuvana' || message == 'Komentar je dodat';
  }
}
