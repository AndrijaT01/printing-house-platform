import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {

  username = '';
  password = '';
  message = '';

  constructor(private userService: UserService, private router: Router) { }

  login() {
    if (this.username == '' || this.password == '') {
      this.message = 'Unesite korisničko ime i lozinku';
      return;
    }

    this.userService.adminLogin(this.username, this.password).subscribe((user) => {
      if (user == null) {
        this.message = 'Pogrešni podaci za administratora';
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      this.router.navigate(['/admin/users']);
    });
  }
}
