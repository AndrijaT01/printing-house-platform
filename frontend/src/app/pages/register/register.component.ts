import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  user = new User();
  repeatedPassword = '';
  message = '';
  registrationSuccessful = false;

  constructor(private userService: UserService) { }

  imageSelected(event: Event) {
    let input = event.target as HTMLInputElement;

    if (input.files == null || input.files.length == 0) {
      return;
    }

    let file = input.files[0];
    let allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      this.message = 'Slika mora biti u JPG, PNG ili GIF formatu';
      input.value = '';
      return;
    }

    let reader = new FileReader();

    reader.onload = () => {
      let image = new Image();

      image.onload = () => {
        if (image.width < 100 || image.height < 100 || image.width > 250 || image.height > 250) {
          this.message = 'Dimenzije slike moraju biti između 100x100 i 250x250 px';
          input.value = '';
          return;
        }

        this.user.profileImage = reader.result as string;
        this.message = '';
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  register() {
    this.message = '';
    this.registrationSuccessful = false;

    if (this.user.username == '' || this.user.password == '' ||
        this.user.firstName == '' || this.user.lastName == '' ||
        this.user.phone == '' || this.user.email == '') {
      this.message = 'Popunite sva obavezna polja';
      return;
    }

    if (this.user.password != this.repeatedPassword) {
      this.message = 'Lozinke se ne poklapaju';
      return;
    }

    let passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/;

    if (!passwordRegex.test(this.user.password)) {
      this.message = 'Lozinka mora imati 8–12 karaktera, početi slovom i sadržati veliko slovo, broj i specijalni karakter';
      return;
    }

    if (this.user.role == 'company' || this.user.role == 'printer') {
      if (this.user.companyName == '' || this.user.address == '' || this.user.city == '' ||
          this.user.registrationNumber == '' || this.user.taxNumber == '') {
        this.message = 'Popunite sve podatke o instituciji';
        return;
      }

      if (!/^\d{8}$/.test(this.user.registrationNumber)) {
        this.message = 'Matični broj mora imati tačno 8 cifara';
        return;
      }

      if (!/^[1-9]\d{8}$/.test(this.user.taxNumber)) {
        this.message = 'PIB mora imati 9 cifara i ne sme počinjati nulom';
        return;
      }
    }

    this.userService.register(this.user).subscribe((response) => {
      this.message = response.message;

      if (response.message == 'Zahtev za registraciju je uspesno poslat') {
        this.registrationSuccessful = true;
        this.user = new User();
        this.repeatedPassword = '';
      }
    });
  }
}
