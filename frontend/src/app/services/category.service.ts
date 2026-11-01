import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  uri = 'http://localhost:4000/categories';

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Category[]>(this.uri);
  }

  addCategory(name: string) {
    return this.http.post<{ message: string }>(`${this.uri}/add`, { name: name });
  }

  addSubcategory(categoryId: string, name: string) {
    return this.http.put<{ message: string }>(`${this.uri}/subcategory/${categoryId}`, {
      name: name
    });
  }
}
