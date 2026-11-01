import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  username = '';
  password = '';
  message = '';
  printerCount = 0;
  topProducts: Product[] = [];
  products: Product[] = [];
  categories: string[] = [];
  searchName = '';
  searchCategory = '';
  sortAscending = true;

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userService.countPrinters().subscribe((response) => {
      this.printerCount = response.count;
    });

    this.productService.getTopFive().subscribe((products) => {
      this.topProducts = products;
    });

    this.productService.getActiveCategories().subscribe((categories) => {
      this.categories = categories;
    });

    this.search();
  }

  login() {
    this.message = '';

    if (this.username == '' || this.password == '') {
      this.message = 'Unesite korisničko ime i lozinku';
      return;
    }

    this.userService.login(this.username, this.password).subscribe((user) => {
      if (user == null) {
        this.message = 'Pogrešno korisničko ime ili lozinka, ili nalog nije aktivan';
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(user));

      if (user.role == 'printer') {
        this.router.navigate(['/printer']);
      } else {
        this.router.navigate(['/client']);
      }
    });
  }

  search() {
    this.productService.search(this.searchName, this.searchCategory).subscribe((products) => {
      this.products = products;
    });
  }

  sortByName() {
    this.products.sort((first, second) => {
      let result = first.name.localeCompare(second.name);
      return this.sortAscending ? result : -result;
    });

    this.sortAscending = !this.sortAscending;
  }
}
