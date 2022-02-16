import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private storage: Storage, private apiService: ApiService) {}

  checkUser = async () => {
    try {
      await this.apiService.me((await this.storage.get('user')).id);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
}
