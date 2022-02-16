import { environment } from './../../../environments/environment';
import { ApiService } from './../../services/api.service';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { Storage } from '@ionic/storage-angular';

import { io } from 'socket.io-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss'],
})
export class MatchPage implements OnInit {
  @ViewChild('playground') playground: ElementRef;
  @ViewChild('player1', { static: true }) player1: ElementRef;
  @ViewChild('player2', { static: true }) player2: ElementRef;
  @ViewChild('ball', { static: true }) ball: ElementRef;

  socket = io(environment.apiLink);

  userData: any;

  prevTime: number = 0;

  matchId: string = '1';

  isPlayer1: boolean;

  windowWidth: number = 300;
  windowHeight: number = 500;

  mouseDown: boolean = false;
  playerWidth = 100;
  playerHeight = 20;

  player1Position: number;
  player1ServerPosition: number;

  player2Position: number;
  player2Direction = 1;

  ballPosition = { x: 0, y: 0 };

  ballXDirection = 1;
  ballYDirection = 1;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private apiService: ApiService,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.socket.on('connect', () => console.log(this.socket.id));

    this.getUserData();
    this.getMatchData();

    this.socket.on('playerMoved', () => this.getMatchData());

    this.socket.on('sendData', () => {
      console.log('SEND DATA');

      /* console.log('BEFORE: ', this.prevTime);

      const transition = new Date().getTime() - this.prevTime;

      this.prevTime = new Date().getTime();

      console.log('AFTER: ', this.prevTime);

      console.log('TRANSITION: ', transition / 1000 + 's');

      this.renderer.setStyle(
        this.ball.nativeElement,
        'transition',
        `${transition / 1000}s`
      ); */

      this.getMatchData();
    });

    setInterval(() => {
      this.getMatchData();
    }, 100);

    setInterval(() => {
      //this.ballMoving();
      //this.player2AutoMoving();
    }, 10);
  }

  getUserData = async () => (
    (this.userData = await this.storage.get('user')), console.log('GET DATA')
  );

  play = async () => {
    console.log('PLAY: ', await this.apiService.play(this.matchId));
  };

  pause = async () => await this.apiService.stop(this.matchId);

  logout = async () => {
    await this.storage.remove('user');
    this.router.navigate(['sign-in']);
  };

  setPositions = () => {
    //PLAYER 2
    this.renderer.setStyle(
      this.player2.nativeElement,
      'left',
      `${this.player2Position}px`
    );

    //BALL POSITION
    this.renderer.setStyle(
      this.ball.nativeElement,
      'left',
      `${this.ballPosition.x}px`
    );
    this.renderer.setStyle(
      this.ball.nativeElement,
      'top',
      `${this.ballPosition.y}px`
    );
  };

  getMatchData = async () => {
    try {
      const {
        player1,
        player1Position,
        player2Position,
        ballPosition,
        ballXDirection,
        ballYDirection,
      } = (await this.apiService.getMatch(this.matchId)) as any;

      this.isPlayer1 = player1 === this.userData.userId ? true : false;

      if (this.isPlayer1) {
        this.player2Position = player2Position;
        this.ballPosition = ballPosition;
        this.ballXDirection = ballXDirection;
        this.ballYDirection = ballYDirection;
      } else {
        this.player2Position = player1Position;
        this.ballPosition = {
          x: this.windowWidth - ballPosition.x - 20,
          y: this.windowHeight - ballPosition.y - 20,
        };
        this.ballXDirection = ballXDirection * -1;
        this.ballYDirection = ballYDirection * -1;
      }

      this.player1ServerPosition = player1Position;

      this.setPositions();
    } catch (error) {
      console.log(error);
    }
  };

  ballMoving = () => {
    const position = {
      x:
        this.ballXDirection > 0
          ? this.ballPosition.x < this.windowWidth - 20
            ? this.ballPosition.x++
            : (this.ballXDirection = -1)
          : this.ballPosition.x-- > 0
          ? this.ballPosition.x--
          : (this.ballXDirection = 1),
      y:
        this.ballYDirection > 0
          ? this.ballPosition.y >
              this.windowHeight - (this.playerHeight + 30) &&
            this.ballPosition.x > this.player1Position &&
            this.ballPosition.x < this.player1Position + this.playerWidth
            ? (this.ballYDirection = -1)
            : this.ballPosition.y++ < this.windowHeight - 20
            ? this.ballPosition.y++
            : (this.ballYDirection = -1)
          : this.ballPosition.y-- < this.playerHeight + 20 &&
            this.ballPosition.x > this.player2Position &&
            this.ballPosition.x < this.player2Position + this.playerWidth
          ? (this.ballYDirection = 1)
          : this.ballPosition.y-- > 0
          ? this.ballPosition.y--
          : (this.ballYDirection = 1),
    };

    this.renderer.setStyle(
      this.ball.nativeElement,
      'left',
      `${this.isPlayer1 ? position.x : this.windowWidth - position.x - 20}px`
    );
    this.renderer.setStyle(
      this.ball.nativeElement,
      'top',
      `${this.isPlayer1 ? position.y : this.windowHeight - position.y - 20}px`
    );
  };

  player2AutoMoving = () => {
    const position =
      this.player2Direction > 0
        ? this.player2Position + this.playerWidth < this.windowWidth
          ? this.player2Position++
          : (this.player2Direction = -1)
        : this.player2Position-- > 0
        ? this.player2Position--
        : (this.player2Direction = 1);

    this.renderer.setStyle(this.player2.nativeElement, 'left', `${position}px`);
  };

  sendPosition = async () => {
    try {
      const { player1, player1Position, player2, player2Position } =
        (await this.apiService.setPlayerPosition(
          this.matchId,
          this.userData.userId,
          this.isPlayer1
            ? this.player1Position
            : this.windowWidth - this.player1Position - this.playerWidth
        )) as any;

      this.renderer.setStyle(
        this.player1.nativeElement,
        'left',
        `${
          this.isPlayer1
            ? player1Position
            : this.windowWidth - player2Position - this.playerWidth
        }px`
      );

      this.getMatchData();
    } catch (err) {
      console.log('SET POS ERROR: ', err);
    }
  };

  movePlayer = (x: number) => {
    const position =
      x < 0
        ? 0
        : x > this.windowWidth - this.playerWidth
        ? this.windowWidth - this.playerWidth
        : x;

    this.player1Position = position;

    console.log(this.player1Position);

    this.sendPosition();
  };

  @HostListener('mousedown', ['$event'])
  @HostListener('touchmove', ['$event'])
  onMousedown(event: MouseEvent) {
    this.mouseDown = true;

    this.player1Position =
      event.pageX - (window.innerWidth - this.windowWidth) / 2 - 50;

    this.movePlayer(this.player1Position);
  }

  move = () => console.log('MOVE');
}
