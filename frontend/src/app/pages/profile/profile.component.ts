import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Order } from '../../models/order';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  user = new User();
  message = '';
  updateSuccessful = false;
  orders: Order[] = [];
  orderSort = 'date';

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit() {
    let storedUser = localStorage.getItem('currentUser');

    if (storedUser == null) {
      this.router.navigate(['/']);
      return;
    }

    let currentUser: User = JSON.parse(storedUser);

    this.userService.getUser(currentUser._id).subscribe((user) => {
      if (user == null) {
        this.router.navigate(['/']);
        return;
      }

      this.user = user;

      if (user.role == 'person' || user.role == 'company') {
        this.loadOrders();
      }
    });
  }

  loadOrders() {
    this.orderService.getClientOrders(this.user._id).subscribe((orders) => {
      this.orders = orders;
    });
  }

  confirmReceived(order: Order) {
    this.orderService.changeStatus(order._id, 'received').subscribe((response) => {
      this.message = response.message;
      this.updateSuccessful = response.message == 'Status porudzbine je uspesno promenjen';
      this.loadOrders();
    });
  }

  cancelOrder(order: Order) {
    if (!confirm('Da li sigurno želite da otkažete ovu porudžbinu?')) {
      return;
    }

    this.orderService.cancelOrder(order._id, this.user._id).subscribe((response) => {
      this.message = response.message;
      this.updateSuccessful = response.message.startsWith('Porudzbina je otkazana');
      this.loadOrders();
    });
  }

  sortedOrders() {
    let result = [...this.orders];

    if (this.orderSort == 'printer') {
      return result.sort((first, second) => first.printerName.localeCompare(second.printerName));
    }

    if (this.orderSort == 'amount') {
      return result.sort((first, second) => second.totalAmount - first.totalAmount);
    }

    if (this.orderSort == 'status') {
      return result.sort((first, second) => first.status.localeCompare(second.status));
    }

    return result.sort((first, second) =>
      new Date(second.orderDate).getTime() - new Date(first.orderDate).getTime()
    );
  }

  statusName(status: string) {
    let names: { [key: string]: string } = {
      ordered: 'Naručeno',
      printing: 'U štampi',
      delivered: 'Isporučeno',
      received: 'Primljeno',
      cancelled: 'Otkazano'
    };
    return names[status] || status;
  }

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

  updateProfile() {
    this.message = '';
    this.updateSuccessful = false;

    if (this.user.firstName == '' || this.user.lastName == '' ||
        this.user.phone == '' || this.user.email == '') {
      this.message = 'Popunite sva obavezna polja';
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

    this.userService.updateProfile(this.user).subscribe((response) => {
      this.message = response.message;

      if (response.message == 'Podaci su uspesno azurirani') {
        this.updateSuccessful = true;

        this.userService.getUser(this.user._id).subscribe((updatedUser) => {
          if (updatedUser != null) {
            this.user = updatedUser;
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
        });
      }
    });
  }
}
