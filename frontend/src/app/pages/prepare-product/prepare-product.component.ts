import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartItem } from '../../models/cart-item';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-prepare-product',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './prepare-product.component.html',
  styleUrl: './prepare-product.component.css'
})
export class PrepareProductComponent implements OnInit {

  product = new Product();
  found = false;
  quantity = 1;
  selectedColor = '';
  selectedService = '';
  printText = '';
  printImage = '';
  message = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null) {
      this.router.navigate(['/']);
      return;
    }

    let role = JSON.parse(storedUser).role;

    if (role != 'person' && role != 'company') {
      this.router.navigate(['/']);
      return;
    }

    this.productService.getProduct(this.route.snapshot.params['id']).subscribe((product) => {
      if (product != null) {
        this.product = product;
        this.selectedColor = product.colors[0] || 'Bela';
        this.found = true;
      }
    });
  }

  addToCart() {
    this.message = '';

    if (!Number.isInteger(this.quantity) || this.quantity <= 0) {
      this.message = 'Količina mora biti pozitivan ceo broj';
      return;
    }

    let quantityInCart = this.cartService.getItems()
      .filter((item) => item.productId == this.product._id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (quantityInCart + this.quantity > this.product.stock) {
      this.message = `Na lageru je dostupno ukupno ${this.product.stock} komada`;
      return;
    }

    let service = this.product.services.find((item) => item.type == this.selectedService);
    let cartItem = new CartItem();
    cartItem.productId = this.product._id;
    cartItem.productName = this.product.name;
    cartItem.printerId = this.product.printerId;
    cartItem.printerName = this.product.printerName;
    cartItem.city = this.product.city;
    cartItem.quantity = this.quantity;
    cartItem.color = this.selectedColor;
    cartItem.serviceType = service == null ? '' : service.type;
    cartItem.unitPrice = this.product.unitPrice;
    cartItem.additionalPrice = service == null ? 0 : service.additionalPrice;
    cartItem.printText = this.printText;
    cartItem.printImage = this.printImage;
    cartItem.availableStock = this.product.stock;

    this.cartService.addItem(cartItem);
    this.router.navigate(['/cart']);
  }

  totalPrice() {
    let service = this.product.services.find((item) => item.type == this.selectedService);
    let additionalPrice = service == null ? 0 : service.additionalPrice;
    return (this.product.unitPrice + additionalPrice) * this.quantity;
  }

  printImageSelected(event: Event) {
    let input = event.target as HTMLInputElement;

    if (input.files == null || input.files.length == 0) {
      return;
    }

    let file = input.files[0];
    let allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      this.message = 'Slika za štampu mora biti u JPG, PNG ili GIF formatu';
      input.value = '';
      return;
    }

    let reader = new FileReader();
    reader.onload = () => {
      this.printImage = reader.result as string;
      this.message = '';
    };
    reader.readAsDataURL(file);
  }

  resetPreparation() {
    this.quantity = 1;
    this.selectedColor = this.product.colors[0] || 'Bela';
    this.selectedService = '';
    this.printText = '';
    this.printImage = '';
    this.message = '';
  }
}
