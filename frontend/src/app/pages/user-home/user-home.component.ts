import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.css'
})
export class UserHomeComponent implements OnInit {

  user = new User();

  constructor(private router: Router) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null) {
      this.router.navigate(['/']);
      return;
    }

    this.user = JSON.parse(storedUser);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }

  roleName() {
    let names: { [key: string]: string } = {
      person: 'fizičko lice',
      company: 'pravno lice',
      printer: 'štamparija'
    };
    return names[this.user.role] || this.user.role;
  }
}
