import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {

  user = new User();
  oldPassword = '';
  newPassword = '';
  repeatedPassword = '';
  message = '';
  success = false;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null) {
      this.router.navigate(['/']);
      return;
    }

    this.user = JSON.parse(storedUser);
  }

  changePassword() {
    this.message = '';
    this.success = false;

    if (this.newPassword != this.repeatedPassword) {
      this.message = 'Nove lozinke se ne poklapaju';
      return;
    }

    let passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/;

    if (!passwordRegex.test(this.newPassword)) {
      this.message = 'Nova lozinka mora imati 8–12 karaktera, početi slovom i sadržati veliko slovo, broj i specijalni karakter';
      return;
    }

    this.userService.changePassword(this.user._id, this.oldPassword, this.newPassword)
      .subscribe((response) => {
        this.message = response.message;
        this.success = response.message == 'Lozinka je uspesno promenjena';

        if (this.success) {
          localStorage.removeItem('currentUser');
        }
      });
  }
}
