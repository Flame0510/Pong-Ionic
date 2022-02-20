import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  form = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),
  });

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  //TOASTS
  async successToast() {
    const toast = await this.toastController.create({
      message: 'Registrazione effettuata!',
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }

  async errorToast() {
    const toast = await this.toastController.create({
      message: 'Errore, riprova',
      duration: 2000,
      color: 'light',
    });
    toast.present();
  }

  async emptyFieldsToast() {
    const toast = await this.toastController.create({
      message: 'Ci sono campi vuoti',
      duration: 2000,
      color: 'danger',
    });
    toast.present();
  }

  //LOADER
  async loading() {
    const loading = await this.loadingController.create({
      cssClass: 'radius',
      duration: 500,
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }

  signUp = async () => {
    if (this.form.valid) {
      try {
        await this.loading();
        await this.apiService.signUp(
          this.form.controls.username.value,
          this.form.controls.password.value
        );

        await this.successToast();

        this.router.navigate(['sign-in']);
      } catch (error) {
        await this.errorToast();
      }
    } else {
      await this.emptyFieldsToast();
    }
  };
}
