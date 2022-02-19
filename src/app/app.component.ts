import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  socket = io(environment.apiLink);

  constructor(
    private router: Router,
    private storage: Storage,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.storage.create();

    this.socket.on('connect', () => console.log(this.socket.id));

    this.router.navigate([
      (await this.authService.checkUser()) ? 'matches' : 'sign-in',
    ]);
  }
}
