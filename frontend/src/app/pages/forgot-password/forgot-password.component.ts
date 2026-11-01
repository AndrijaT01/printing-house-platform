import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  identifier = '';
  message = '';
  resetLink = '';

  constructor(private userService: UserService) { }

  requestReset() {
    this.message = '';
    this.resetLink = '';

    if (this.identifier.trim() == '') {
      this.message = 'Unesite korisničko ime ili email adresu';
      return;
    }

    this.userService.requestPasswordReset(this.identifier.trim()).subscribe((response) => {
      this.message = response.message;
      this.resetLink = response.resetLink;
    });
  }
}
