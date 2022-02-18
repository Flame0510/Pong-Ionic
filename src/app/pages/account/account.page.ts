import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  account: any;
  session: any;

  token: string;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.getAccount();
  }

  getAccount = async () => {
    try {
      this.account = await this.apiService.me();
      //this.session = await this.apiService.session();
      this.token = await this.storage.get('accessToken');

      console.log(this.account);
    } catch (err) {
      console.log(err);
      await this.errorToast();
    }
  };

  async logoutActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Do you want to logout?',
      backdropDismiss: true,
      buttons: [
        {
          text: 'Yes',
          icon: 'exit',
          handler: () => {
            this.logout();
          },
        },

        {
          text: 'No',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role and data', role, data);
  }

  async successToast() {
    const toast = await this.toastController.create({
      message: 'Logout effettuato!',
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }

  async errorToast() {
    const toast = await this.toastController.create({
      message: 'Errore, riprova.',
      duration: 2000,
      color: 'danger',
    });
    toast.present();
  }

  logout = async () => {
    try {
      await this.storage.remove('id');
      await this.successToast();
      this.router.navigate(['sign-in']);
    } catch (err) {
      await this.errorToast();
    }
  };
}
