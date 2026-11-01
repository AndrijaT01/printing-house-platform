import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../models/category';
import { PrintOption, Product } from '../../models/product';
import { User } from '../../models/user';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-printer-products',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './printer-products.component.html',
  styleUrl: './printer-products.component.css'
})
export class PrinterProductsComponent implements OnInit {

  currentUser = new User();
  product = new Product();
  newService = new PrintOption();
  colorsText = '';
  categories: Category[] = [];
  products: Product[] = [];
  jsonData: unknown = null;
  jsonFileName = '';
  message = '';
  success = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null || JSON.parse(storedUser).role != 'printer') {
      this.router.navigate(['/']);
      return;
    }

    this.currentUser = JSON.parse(storedUser);

    this.categoryService.getAll().subscribe((categories) => {
      this.categories = categories;

      if (categories.length > 0) {
        this.product.category = categories[0].name;
        this.categoryChanged();
      }
    });

    this.loadProducts();
  }

  loadProducts() {
    this.productService.getPrinterProducts(this.currentUser._id).subscribe((products) => {
      this.products = products;
    });
  }

  getSubcategories() {
    let category = this.categories.find((item) => item.name == this.product.category);
    return category == null ? [] : category.subcategories;
  }

  categoryChanged() {
    let subcategories = this.getSubcategories();
    this.product.subcategory = subcategories.length > 0 ? subcategories[0] : '';
  }

  imageSelected(event: Event) {
    let input = event.target as HTMLInputElement;

    if (input.files == null || input.files.length == 0) {
      return;
    }

    let file = input.files[0];
    let allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      this.message = 'Slika mora biti u JPG, PNG ili GIF formatu';
      input.value = '';
      return;
    }

    let reader = new FileReader();

    reader.onload = () => {
      this.product.image = reader.result as string;
      this.message = '';
    };

    reader.readAsDataURL(file);
  }

  additionalImagesSelected(event: Event) {
    let input = event.target as HTMLInputElement;
    this.readAdditionalImages(input, (images) => {
      this.product.additionalImages = images;
      this.message = `Izabrano dodatnih slika: ${images.length}`;
      this.success = true;
    });
  }

  jsonFileSelected(event: Event) {
    let input = event.target as HTMLInputElement;

    if (input.files == null || input.files.length == 0) {
      return;
    }

    let file = input.files[0];
    let reader = new FileReader();

    reader.onload = () => {
      try {
        let content = reader.result as string;
        content = content.replace(/^\uFEFF/, '').trim();

        let firstBrace = content.indexOf('{');
        let lastBrace = content.lastIndexOf('}');

        if (firstBrace >= 0 && lastBrace >= firstBrace) {
          content = content.substring(firstBrace, lastBrace + 1);
        }

        this.jsonData = JSON.parse(content);
        this.jsonFileName = file.name;
        this.message = 'JSON fajl je uspešno učitan';
        this.success = true;
      } catch (error) {
        this.jsonData = null;
        this.jsonFileName = '';
        let reason = error instanceof Error ? error.message : '';
        this.message = `Izabrani fajl nije ispravan JSON. ${reason}`;
        this.success = false;
        console.log(error);
        input.value = '';
      }
    };

    reader.readAsText(file, 'UTF-8');
  }

  importJson() {
    if (this.jsonData == null) {
      this.message = 'Prvo izaberite JSON fajl';
      this.success = false;
      return;
    }

    this.productService.importProducts(
      this.jsonData,
      this.currentUser._id,
      this.currentUser.companyName,
      this.currentUser.city,
      this.currentUser.address
    ).subscribe((response) => {
      this.message = response.message;
      this.success = response.message.startsWith('Uspesno');

      if (this.success) {
        this.jsonData = null;
        this.jsonFileName = '';
        this.loadProducts();
      }
    });
  }

  productImageSelected(event: Event, product: Product) {
    let input = event.target as HTMLInputElement;

    if (input.files == null || input.files.length == 0) {
      return;
    }

    let file = input.files[0];
    let allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      this.message = 'Slika mora biti u JPG, PNG ili GIF formatu';
      this.success = false;
      input.value = '';
      return;
    }

    let reader = new FileReader();

    reader.onload = () => {
      this.productService.updateImage(product._id, reader.result as string)
        .subscribe((response) => {
          this.message = response.message;
          this.success = response.message == 'Slika je uspesno dodata';
          this.loadProducts();
        });
    };

    reader.readAsDataURL(file);
  }

  productAdditionalImagesSelected(event: Event, product: Product) {
    let input = event.target as HTMLInputElement;
    this.readAdditionalImages(input, (images) => {
      this.productService.updateAdditionalImages(product._id, images)
        .subscribe((response) => {
          this.message = response.message;
          this.success = response.message == 'Dodatne slike su uspesno sacuvane';
          this.loadProducts();
        });
    });
  }

  private readAdditionalImages(input: HTMLInputElement, callback: (images: string[]) => void) {
    if (input.files == null || input.files.length == 0) {
      return;
    }

    if (input.files.length > 3) {
      this.message = 'Možete izabrati najviše tri dodatne slike';
      this.success = false;
      input.value = '';
      return;
    }

    let files = Array.from(input.files);
    let allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (files.some((file) => !allowedTypes.includes(file.type))) {
      this.message = 'Sve slike moraju biti u JPG, PNG ili GIF formatu';
      this.success = false;
      input.value = '';
      return;
    }

    let reading = files.map((file) => {
      return new Promise<string>((resolve) => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(reading).then((images) => callback(images));
  }

  addService() {
    if (this.newService.serviceId == '' || this.newService.type == '' ||
        this.newService.additionalPrice < 0 || this.newService.maxWidth <= 0 ||
        this.newService.maxHeight <= 0) {
      this.message = 'Popunite ispravno sva polja usluge';
      return;
    }

    let service = new PrintOption();
    service.serviceId = this.newService.serviceId;
    service.type = this.newService.type;
    service.additionalPrice = this.newService.additionalPrice;
    service.maxWidth = this.newService.maxWidth;
    service.maxHeight = this.newService.maxHeight;

    this.product.services.push(service);
    this.newService = new PrintOption();
    this.message = '';
  }

  removeService(index: number) {
    this.product.services.splice(index, 1);
  }

  addProduct() {
    this.message = '';
    this.success = false;

    if (this.product.code == '' || this.product.name == '' ||
        this.product.description == '' || this.product.category == '' ||
        this.product.subcategory == '') {
      this.message = 'Popunite sva obavezna polja proizvoda';
      return;
    }

    if (this.product.unitPrice <= 0 || this.product.stock < 0) {
      this.message = 'Cena mora biti veća od nule, a količina ne sme biti negativna';
      return;
    }

    this.product.colors = this.colorsText
      .split(',')
      .map((color) => color.trim())
      .filter((color) => color != '');

    if (this.product.colors.length == 0) {
      this.product.colors = ['Bela'];
    }

    this.product.printerId = this.currentUser._id;
    this.product.printerName = this.currentUser.companyName;
    this.product.city = this.currentUser.city;
    this.product.printerAddress = this.currentUser.address;

    this.productService.addProduct(this.product).subscribe((response) => {
      this.message = response.message;

      if (response.message == 'Proizvod je uspesno dodat') {
        this.success = true;
        this.product = new Product();
        this.colorsText = '';

        if (this.categories.length > 0) {
          this.product.category = this.categories[0].name;
          this.categoryChanged();
        }

        this.loadProducts();
      }
    });
  }

  updateStock(product: Product) {
    this.productService.updateStock(product._id, product.stock).subscribe((response) => {
      this.message = response.message;
      this.success = response.message == 'Kolicina je uspesno azurirana';
      this.loadProducts();
    });
  }
}
