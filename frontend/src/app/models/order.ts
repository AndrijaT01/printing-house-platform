export class OrderItem {
  productId = '';
  productName = '';
  quantity = 0;
  color = '';
  serviceType = '';
  unitPrice = 0;
  additionalPrice = 0;
  printText = '';
  printImage = '';
}

export class Order {
  _id = '';
  invoiceId = '';
  clientId = '';
  clientUsername = '';
  printerId = '';
  printerName = '';
  city = '';
  items: OrderItem[] = [];
  totalAmount = 0;
  status = '';
  orderDate = new Date();
}
