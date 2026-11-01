import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { User } from './models/user';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  title = 'Printing House';

  private storageHandler = (event: StorageEvent) => {
    if (event.key == 'currentUser') {
      window.location.assign('/');
    }
  };

  constructor(private router: Router) { }

  ngOnInit() {
    window.addEventListener('storage', this.storageHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.storageHandler);
  }

  get currentUser(): User | null {
    let storedUser = localStorage.getItem('currentUser');
    return storedUser == null ? null : JSON.parse(storedUser);
  }

  dashboardLink() {
    if (this.currentUser?.role == 'admin') {
      return '/admin/users';
    }

    return this.currentUser?.role == 'printer' ? '/printer' : '/client';
  }

  roleName(role: string) {
    let names: { [key: string]: string } = {
      person: 'fizičko lice',
      company: 'pravno lice',
      printer: 'štamparija',
      admin: 'administrator'
    };
    return names[role] || role;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }
}
