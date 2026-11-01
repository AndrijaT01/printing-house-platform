import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Tender } from '../../models/tender';
import { User } from '../../models/user';
import { TenderService } from '../../services/tender.service';

@Component({
  selector: 'app-company-tenders',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './company-tenders.component.html',
  styleUrl: './company-tenders.component.css'
})
export class CompanyTendersComponent implements OnInit, OnDestroy {

  user = new User();
  tenders: Tender[] = [];
  message = '';
  now = Date.now();
  timerId: ReturnType<typeof setInterval> | undefined;

  constructor(private tenderService: TenderService, private router: Router) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null || JSON.parse(storedUser).role != 'company') {
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
    this.message = '';
    this.tenderService.getCompanyTenders(this.user._id).subscribe((tenders) => {
      this.tenders = tenders;
    });
  }

  remainingTime(tender: Tender) {
    let seconds = Math.max(0, Math.floor((new Date(tender.expiresAt).getTime() - this.now) / 1000));
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  statusName(status: string) {
    let names: { [key: string]: string } = {
      open: 'Otvorena',
      finished: 'Završena',
      no_offers: 'Završena bez važećih ponuda'
    };
    return names[status] || status;
  }

  printReport() {
    window.print();
  }
}
