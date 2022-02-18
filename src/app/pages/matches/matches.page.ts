import { User } from 'src/app/models/user';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.page.html',
  styleUrls: ['./matches.page.scss'],
})
export class MatchesPage implements OnInit {
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

    this.userData = await this.storage.get('user');
  }

  async createMatchActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Do you want create a snew match?',
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
      this.matches = await this.apiService.getMatches();
    } catch (error) {
      console.log(error);
    }
  };

  createMatch = () => (this.apiService.createMatch(), this.getMatches());

  goToMatch = (matchId: string) => this.router.navigate(['match/' + matchId]);
}
