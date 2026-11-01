import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private storageKey() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null) {
      return 'cart_guest';
    }

    let user = JSON.parse(storedUser);
    return `cart_${user._id}`;
  }

  getItems(): CartItem[] {
    let key = this.storageKey();
    let storedCart = localStorage.getItem(key);

    if (storedCart == null) {
      let oldCart = localStorage.getItem('cart');

      if (oldCart != null) {
        localStorage.setItem(key, oldCart);
        localStorage.removeItem('cart');
        storedCart = oldCart;
      }
    }

    return storedCart == null ? [] : JSON.parse(storedCart);
  }

  addItem(item: CartItem) {
    let items = this.getItems();
    let existingItem = items.find((currentItem) =>
      currentItem.productId == item.productId &&
      currentItem.color == item.color &&
      currentItem.serviceType == item.serviceType &&
      currentItem.printText == item.printText &&
      currentItem.printImage == item.printImage
    );

    if (existingItem == null) {
      items.push(item);
    } else {
      existingItem.quantity += item.quantity;
    }

    localStorage.setItem(this.storageKey(), JSON.stringify(items));
  }

  removeItem(index: number) {
    let items = this.getItems();
    items.splice(index, 1);
    localStorage.setItem(this.storageKey(), JSON.stringify(items));
  }

  clear() {
    localStorage.removeItem(this.storageKey());
  }
}
