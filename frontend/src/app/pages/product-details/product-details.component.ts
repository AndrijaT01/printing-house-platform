import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  product = new Product();
  found = false;
  isClient = false;
  currentUserId = '';
  galleryImages: string[] = [];
  selectedImage = '';
  mapUrl: SafeResourceUrl | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser != null) {
      let currentUser = JSON.parse(storedUser);
      let role = currentUser.role;
      this.currentUserId = currentUser._id;
      this.isClient = role == 'person' || role == 'company';
    }

    let id = this.route.snapshot.params['id'];

    this.productService.getProduct(id).subscribe((product) => {
      if (product != null) {
        this.product = product;
        this.product.comments = product.comments || [];
        this.product.ratings = product.ratings || [];
        this.product.additionalImages = product.additionalImages || [];
        this.galleryImages = [product.image, ...this.product.additionalImages.slice(0, 3)]
          .filter((image) => image != '' && image.startsWith('data:image'));

        let savedIndex = Number(this.getCookie(`product_image_${product._id}`));

        if (isNaN(savedIndex) || savedIndex < 0 || savedIndex >= this.galleryImages.length) {
          savedIndex = 0;
        }

        this.selectedImage = this.galleryImages[savedIndex] || '';

        let mapQuery = encodeURIComponent(
          `${product.printerName}, ${product.printerAddress || ''}, ${product.city}`
        );
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.google.com/maps?q=${mapQuery}&output=embed`
        );
        this.found = true;
      }
    });
  }

  lastComments() {
    return [...this.product.comments]
      .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime())
      .slice(0, 5);
  }

  isMyComment(clientId: string) {
    return clientId == this.currentUserId;
  }

  selectImage(index: number) {
    this.selectedImage = this.galleryImages[index];
    document.cookie = `product_image_${this.product._id}=${index}; max-age=2592000; path=/`;
  }

  private getCookie(name: string) {
    let prefix = name + '=';
    let cookie = document.cookie.split(';').map((item) => item.trim())
      .find((item) => item.startsWith(prefix));
    return cookie == null ? '' : cookie.substring(prefix.length);
  }
}
