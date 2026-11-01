import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  uri = 'http://localhost:4000/products';

  constructor(private http: HttpClient) { }

  addProduct(product: Product) {
    let data = {
      code: product.code,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      unitPrice: product.unitPrice,
      stock: product.stock,
      colors: product.colors,
      image: product.image,
      additionalImages: product.additionalImages,
      services: product.services,
      printerId: product.printerId,
      printerName: product.printerName,
      city: product.city,
      printerAddress: product.printerAddress,
      likes: product.likes,
      dislikes: product.dislikes
    };

    return this.http.post<{ message: string }>(`${this.uri}/add`, data);
  }

  importProducts(
    data: unknown,
    printerId: string,
    printerName: string,
    city: string,
    printerAddress: string
  ) {
    return this.http.post<{ message: string }>(`${this.uri}/import`, {
      data: data,
      printerId: printerId,
      printerName: printerName,
      city: city,
      printerAddress: printerAddress
    });
  }

  updateImage(productId: string, image: string) {
    return this.http.put<{ message: string }>(`${this.uri}/image/${productId}`, {
      image: image
    });
  }

  updateAdditionalImages(productId: string, images: string[]) {
    return this.http.put<{ message: string }>(`${this.uri}/additional-images/${productId}`, {
      images: images
    });
  }

  getPrinterProducts(printerId: string) {
    return this.http.get<Product[]>(`${this.uri}/printer/${printerId}`);
  }

  updateStock(productId: string, stock: number) {
    return this.http.put<{ message: string }>(`${this.uri}/stock/${productId}`, {
      stock: stock
    });
  }

  search(name: string, category: string) {
    let url = `${this.uri}/search?name=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}`;
    return this.http.get<Product[]>(url);
  }

  getTopFive() {
    return this.http.get<Product[]>(`${this.uri}/top-five`);
  }

  getActiveCategories() {
    return this.http.get<string[]>(`${this.uri}/active-categories`);
  }

  getProduct(id: string) {
    return this.http.get<Product | null>(`${this.uri}/${id}`);
  }

  rateProduct(productId: string, clientId: string, value: string) {
    return this.http.post<{ message: string }>(`${this.uri}/rate/${productId}`, {
      clientId: clientId,
      value: value
    });
  }

  addComment(productId: string, clientId: string, username: string, text: string) {
    return this.http.post<{ message: string }>(`${this.uri}/comment/${productId}`, {
      clientId: clientId,
      username: username,
      text: text
    });
  }
}
