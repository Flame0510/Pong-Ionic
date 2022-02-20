import { Match } from './../../models/match';
import { User } from 'src/app/models/user';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

import { Storage } from '@ionic/storage-angular';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.page.html',
  styleUrls: ['./matches.page.scss'],
})
export class MatchesPage implements OnInit {
  socket = io(environment.apiLink);

  matches: any;

  userData: User;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private actionSheetController: ActionSheetController,
    private storage: Storage
  ) {}

  async ngOnInit() {
    this.getMatches();

    this.socket.on('refreshMatches', () => this.getMatches());

    this.userData = await this.storage.get('user');
  }

  async createMatchActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Do you want create a new match?',
      buttons: [
        {
          text: 'Yes',
          icon: 'checkmark',
          handler: () => this.createMatch(),
        },
        {
          text: 'No',
          icon: 'close',
          role: 'close',
        },
      ],
    });

    await actionSheet.present();
  }

  getMatches = async () => {
    try {
      this.matches = ((await this.apiService.getMatches()) as Match[]).filter(
        ({ player1, player2, status }) =>
          player1.id !== this.userData.userId &&
          player2 === null &&
          status === 'pre_start'
      );
    } catch (error) {
      console.log(error);
    }
  };

  createMatch = async () => {
    const { id } = (await this.apiService.createMatch()) as Match;

    this.getMatches();

    this.router.navigate(['match/' + id]);
  };
}
