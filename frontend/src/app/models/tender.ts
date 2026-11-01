export class TenderItem {
  productName = '';
  quantity = 0;
  color = '';
  serviceType = '';
  printText = '';
  printImage = '';
}

export class TenderBid {
  printerId = '';
  printerName = '';
  totalAmount = 0;
  offeredAt = new Date();
}

export class Tender {
  _id = '';
  tenderCode = '';
  companyId = '';
  companyUsername = '';
  companyName = '';
  items: TenderItem[] = [];
  createdAt = new Date();
  expiresAt = new Date();
  status = '';
  bids: TenderBid[] = [];
  winnerPrinterId = '';
  winnerPrinterName = '';
  winningAmount = 0;
  orderId = '';
}
