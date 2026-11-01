import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  password = '';
  repeatedPassword = '';
  message = '';
  success = false;
  token = '';

  constructor(private userService: UserService, private route: ActivatedRoute) {
    this.token = this.route.snapshot.params['token'];
  }

  resetPassword() {
    this.message = '';
    this.success = false;

    if (this.password != this.repeatedPassword) {
      this.message = 'Lozinke se ne poklapaju';
      return;
    }

    let passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/;

    if (!passwordRegex.test(this.password)) {
      this.message = 'Lozinka mora imati 8–12 karaktera, početi slovom i sadržati veliko slovo, broj i specijalni karakter';
      return;
    }

    this.userService.resetPassword(this.token, this.password).subscribe((response) => {
      this.message = response.message;
      this.success = response.message == 'Lozinka je uspesno promenjena';
    });
  }
}
