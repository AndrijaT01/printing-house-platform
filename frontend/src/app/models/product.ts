export class PrintOption {
  serviceId = '';
  type = '';
  additionalPrice = 0;
  maxWidth = 0;
  maxHeight = 0;
}

export class ProductRating {
  clientId = '';
  value = '';
}

export class ProductComment {
  clientId = '';
  username = '';
  text = '';
  date = new Date();
}

export class Product {
  _id = '';
  code = '';
  name = '';
  description = '';
  category = '';
  subcategory = '';
  unitPrice = 0;
  stock = 0;
  colors: string[] = [];
  image = '';
  additionalImages: string[] = [];
  services: PrintOption[] = [];
  printerId = '';
  printerName = '';
  city = '';
  printerAddress = '';
  likes = 0;
  dislikes = 0;
  ratings: ProductRating[] = [];
  comments: ProductComment[] = [];
}
