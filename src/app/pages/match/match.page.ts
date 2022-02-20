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
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from 'src/app/models/player';
import { Points } from 'src/app/models/points';

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

  //@ViewChild('countdown', { static: true }) countdown: ElementRef;

  socket = io(environment.apiLink);

  userData: any;

  prevTime: number = 0;

  player2WaitVisibility: boolean = false;

  countdown: number;
  countdownVisibility: boolean = false;

  gameOverVisibility: boolean = false;

  isWinner: boolean;

  matchId: string;

  status: string = 'pre_start';

  isPlayer1: boolean;

  player1Data: Player;
  player2Data: Player;

  points: Points = { player1: 0, player2: 0 };

  lastPoint: Player;
  lastPointVisibility: boolean = true;

  windowWidth: number = 300;
  windowHeight: number = 500;

  mouseDown: boolean = false;
  playerWidth = 100;
  playerHeight = 20;

  player1Position: number = 100;
  player1ServerPosition: number = 100;

  player2Position: number = 100;
  player2Direction = 1;

  ballStartPosition = { x: 150, y: 250 };
  ballPosition = this.ballStartPosition;

  ballXDirection = 1;
  ballYDirection = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
    private apiService: ApiService,
    private storage: Storage
  ) {}

  ngOnInit() {
    //GET MATCH ID
    this.matchId = this.route.snapshot.paramMap.get('id');

    this.getUserData();
    this.getMatchData();

    !this.isPlayer1 && !this.player2Data && this.joinMatch();

    this.socket.emit('join-match', this.matchId);

    this.setPlayer1Position();

    //this.player2StartMatch();

    this.socket.on('player2-join', () => {
      this.getMatchData();
      this.player2WaitVisibility = false;
      this.startCountdown();
    });

    this.socket.on(
      'player-1-win',
      () => (
        (this.isWinner = this.isPlayer1 ? true : false),
        (this.gameOverVisibility = true)
      )
    );

    this.socket.on(
      'player-2-win',
      () => (
        (this.isWinner = this.isPlayer1 ? false : true),
        (this.gameOverVisibility = true)
      )
    );

    this.socket.on('playerMoved', () => this.getMatchData());

    this.socket.on('point', (player) => {
      this.lastPoint = player;
      this.point();
    });

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
      console.log(this.status);

      //this.status === 'in_progress' && this.getMatchData();
      //this.status === 'in_progress' && this.setPositions();

      this.getMatchData();
      this.setPositions();
    }, 100);

    setInterval(() => {
      //this.ballMoving();
      //this.player2AutoMoving();
    }, 10);
  }

  getUserData = async () => (this.userData = await this.storage.get('user'));

  joinMatch = async () => {
    try {
      console.log('JOIN: ', await this.apiService.joinMatch(this.matchId));

      this.status === 'pre_start' && !this.player2Data && this.startCountdown();
    } catch (error) {
      console.log(error);

      this.player2WaitVisibility = true;
    }
  };

  startCountdown = () => {
    this.countdownVisibility = true;

    this.countdown = 3;

    setTimeout(() => {
      this.countdown = 2;
    }, 1000);

    setTimeout(() => {
      this.countdown = 1;
    }, 2000);

    setTimeout(() => {
      this.countdownVisibility = false;

      this.play();
    }, 3000);
  };

  play = async () => await this.apiService.play(this.matchId);

  point = () => {
    this.lastPointVisibility = true;

    this.renderer.setStyle(
      this.player1.nativeElement,
      'background',
      `lightblue`
    );

    this.renderer.setStyle(this.player2.nativeElement, 'background', `red`);

    this.renderer.setStyle(this.ball.nativeElement, 'transition', `0`);

    //this.pause();

    setTimeout(() => {
      this.lastPointVisibility = false;

      this.renderer.setStyle(this.player1.nativeElement, 'background', `#fff`);

      this.renderer.setStyle(this.player2.nativeElement, 'background', `#fff`);

      this.play();

      this.renderer.setStyle(this.ball.nativeElement, 'transition', `0.1s`);
    }, 1000);
  };

  pause = async () => await this.apiService.status(this.matchId, 'pause');

  finish = async () => await this.apiService.status(this.matchId, 'finished');

  logout = async () => {
    await this.storage.remove('user');
    this.router.navigate(['sign-in']);
  };

  setPlayer1Position = () => {
    this.renderer.setStyle(
      this.player1.nativeElement,
      'left',
      `${this.player1Position - 2}px`
    );
  };

  setPositions = () => {
    //PLAYER 2
    this.renderer.setStyle(
      this.player2.nativeElement,
      'left',
      `${this.player2Position - 2}px`
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
        player2,
        player2Position,
        points,
        lastPoint,
        status,
        ballPosition,
        ballXDirection,
        ballYDirection,
      } = (await this.apiService.getMatch(this.matchId)) as any;

      this.player1Data = player1;
      this.player2Data = player2;

      this.points = points;

      //this.lastPointVisibility = this.lastPoint === lastPoint ? false : true;

      //this.lastPoint && this.lastPoint.id !== lastPoint.id && this.point();

      //this.lastPoint = lastPoint;

      /* console.log(this.lastPoint);
      console.log(this.lastPointVisibility); */

      this.status = status;

      /* console.log(ballPosition);

      console.log(status); */

      //this.status === 'pause' && this.pause();

      this.isPlayer1 = player1.id === this.userData.userId ? true : false;

      if (this.status === 'in_progress') {
        if (this.isPlayer1) {
          this.player2Position = player2Position;
          this.ballPosition = ballPosition;
          this.ballXDirection = ballXDirection;
          this.ballYDirection = ballYDirection;
        } else {
          this.player2Position =
            this.windowWidth - player1Position - this.playerWidth;
          this.ballPosition = {
            x: this.windowWidth - ballPosition.x - 20,
            y: this.windowHeight - ballPosition.y - 20,
          };
          this.ballXDirection = ballXDirection * -1;
          this.ballYDirection = ballYDirection * -1;
        }

        this.player1ServerPosition = player1Position;
      }
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
      const { player1Position, player2Position } =
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
          (this.isPlayer1
            ? player1Position
            : this.windowWidth - player2Position - this.playerWidth) - 2
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

  @HostListener('mouseup', ['$event'])
  onMouseup(event: MouseEvent) {
    this.mouseDown = false;
  }

  @HostListener('mousemove', ['$event'])
  onMousedmove(event: MouseEvent) {
    if (this.mouseDown) {
      this.player1Position =
        event.pageX - (window.innerWidth - this.windowWidth) / 2 - 50;

      this.movePlayer(this.player1Position);
    }
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event: MouseEvent) {
    this.mouseDown = true;

    this.player1Position =
      event.pageX - (window.innerWidth - this.windowWidth) / 2 - 50;

    this.movePlayer(this.player1Position);
  }

  @HostListener('touchmove', ['$event'])
  onTouchmove(event: MouseEvent) {
    this.mouseDown = true;

    this.player1Position =
      event.pageX - (window.innerWidth - this.windowWidth) / 2 - 50;

    this.movePlayer(this.player1Position);
  }
}
