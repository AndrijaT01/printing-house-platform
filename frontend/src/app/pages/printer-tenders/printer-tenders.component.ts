import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Tender } from '../../models/tender';
import { User } from '../../models/user';
import { TenderService } from '../../services/tender.service';

@Component({
  selector: 'app-printer-tenders',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './printer-tenders.component.html',
  styleUrl: './printer-tenders.component.css'
})
export class PrinterTendersComponent implements OnInit, OnDestroy {

  user = new User();
  tenders: Tender[] = [];
  bidAmounts: { [key: string]: number } = {};
  message = '';
  now = Date.now();
  timerId: ReturnType<typeof setInterval> | undefined;

  constructor(private tenderService: TenderService, private router: Router) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null || JSON.parse(storedUser).role != 'printer') {
      this.router.navigate(['/']);
      return;
    }

    this.user = JSON.parse(storedUser);
    this.loadTenders();
    this.timerId = setInterval(() => this.now = Date.now(), 1000);
  }

  ngOnDestroy() {
    if (this.timerId != undefined) {
      clearInterval(this.timerId);
    }
  }

  loadTenders() {
    this.tenderService.getOpenTenders().subscribe((tenders) => {
      this.tenders = tenders;
    });
  }

  hasBid(tender: Tender) {
    return tender.bids.some((bid) => bid.printerId == this.user._id);
  }

  remainingTime(tender: Tender) {
    let seconds = Math.max(0, Math.floor((new Date(tender.expiresAt).getTime() - this.now) / 1000));
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  submitBid(tender: Tender) {
    this.message = '';
    let amount = Number(this.bidAmounts[tender._id]);

    if (isNaN(amount) || amount <= 0) {
      this.message = 'Unesite pozitivan ukupan iznos ponude';
      return;
    }

    this.tenderService.submitBid(
      tender._id,
      this.user._id,
      this.user.companyName,
      amount
    ).subscribe((response) => {
      this.message = response.message;
      this.loadTenders();
    });
  }
}
