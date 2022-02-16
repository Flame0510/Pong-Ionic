import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private storage: Storage,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.storage.create();

    this.router.navigate([
      (await this.authService.checkUser()) ? 'match' : 'sign-in',
    ]);
  }
}
