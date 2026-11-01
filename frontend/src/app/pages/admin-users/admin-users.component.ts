import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {

  pendingUsers: User[] = [];
  users: User[] = [];
  message = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null || JSON.parse(storedUser).role != 'admin') {
      this.router.navigate(['/admin-login']);
      return;
    }

    this.loadUsers();
  }

  loadUsers() {
    this.userService.getPendingUsers().subscribe((users) => {
      this.pendingUsers = users;
    });

    this.userService.getAllUsers().subscribe((users) => {
      this.users = users;
    });
  }

  changeStatus(user: User, status: string) {
    this.userService.changeRegistrationStatus(user._id, status).subscribe((response) => {
      this.message = response.message;
      this.loadUsers();
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Da li želite da obrišete korisnika ${user.username}?`)) {
      return;
    }

    this.userService.deleteUser(user._id).subscribe((response) => {
      this.message = response.message;
      this.loadUsers();
    });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/admin-login']);
  }
}
