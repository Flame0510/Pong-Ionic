import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  checkUser = async () => {
    try {
      await this.apiService.token();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
}
