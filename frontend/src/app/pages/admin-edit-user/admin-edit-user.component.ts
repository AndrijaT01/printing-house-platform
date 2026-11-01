import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-edit-user',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-edit-user.component.html',
  styleUrl: './admin-edit-user.component.css'
})
export class AdminEditUserComponent implements OnInit {

  user = new User();
  message = '';
  updateSuccessful = false;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null || JSON.parse(storedUser).role != 'admin') {
      this.router.navigate(['/admin-login']);
      return;
    }

    let id = this.route.snapshot.params['id'];

    this.userService.getUser(id).subscribe((user) => {
      if (user == null) {
        this.router.navigate(['/admin/users']);
        return;
      }

      this.user = user;
    });
  }

  updateUser() {
    this.message = '';
    this.updateSuccessful = false;

    if (this.user.firstName == '' || this.user.lastName == '' ||
        this.user.phone == '' || this.user.email == '') {
      this.message = 'Popunite sva obavezna polja';
      return;
    }

    this.userService.updateProfile(this.user).subscribe((response) => {
      this.message = response.message;
      this.updateSuccessful = response.message == 'Podaci su uspesno azurirani';
    });
  }
}
