import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  uri = 'http://localhost:4000/users';

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    let data = {
      username: username,
      password: password
    };

    return this.http.post<User | null>(`${this.uri}/login`, data);
  }

  adminLogin(username: string, password: string) {
    let data = {
      username: username,
      password: password
    };

    return this.http.post<User | null>(`${this.uri}/admin-login`, data);
  }

  register(user: User) {
    return this.http.post<{ message: string }>(`${this.uri}/register`, user);
  }

  getPendingUsers() {
    return this.http.get<User[]>(`${this.uri}/pending`);
  }

  changeRegistrationStatus(id: string, status: string) {
    let data = {
      status: status
    };

    return this.http.put<{ message: string }>(`${this.uri}/registration/${id}`, data);
  }

  getAllUsers() {
    return this.http.get<User[]>(`${this.uri}/all`);
  }

  getUser(id: string) {
    return this.http.get<User | null>(`${this.uri}/profile/${id}`);
  }

  updateProfile(user: User) {
    return this.http.put<{ message: string }>(`${this.uri}/profile/${user._id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete<{ message: string }>(`${this.uri}/${id}`);
  }

  countPrinters() {
    return this.http.get<{ count: number }>(`${this.uri}/printer-count`);
  }

  requestPasswordReset(identifier: string) {
    return this.http.post<{ message: string, resetLink: string }>(`${this.uri}/forgot-password`, {
      identifier: identifier
    });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<{ message: string }>(`${this.uri}/reset-password/${token}`, {
      password: password
    });
  }

  changePassword(userId: string, oldPassword: string, newPassword: string) {
    return this.http.put<{ message: string }>(`${this.uri}/change-password/${userId}`, {
      oldPassword: oldPassword,
      newPassword: newPassword
    });
  }
}
