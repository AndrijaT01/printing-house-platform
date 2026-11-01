import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css'
})
export class AdminCategoriesComponent implements OnInit {

  categories: Category[] = [];
  categoryName = '';
  selectedCategoryId = '';
  subcategoryName = '';
  message = '';

  constructor(private categoryService: CategoryService, private router: Router) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null || JSON.parse(storedUser).role != 'admin') {
      this.router.navigate(['/admin-login']);
      return;
    }

    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe((categories) => {
      this.categories = categories;

      if (this.selectedCategoryId == '' && categories.length > 0) {
        this.selectedCategoryId = categories[0]._id;
      }
    });
  }

  addCategory() {
    this.categoryService.addCategory(this.categoryName).subscribe((response) => {
      this.message = response.message;

      if (response.message == 'Kategorija je uspesno dodata') {
        this.categoryName = '';
        this.loadCategories();
      }
    });
  }

  addSubcategory() {
    if (this.selectedCategoryId == '') {
      this.message = 'Prvo izaberite kategoriju';
      return;
    }

    this.categoryService.addSubcategory(this.selectedCategoryId, this.subcategoryName)
      .subscribe((response) => {
        this.message = response.message;

        if (response.message == 'Potkategorija je uspesno dodata') {
          this.subcategoryName = '';
          this.loadCategories();
        }
      });
  }
}
