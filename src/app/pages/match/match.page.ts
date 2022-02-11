import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss'],
})
export class MatchPage implements OnInit {
  @ViewChild('player1', { static: true }) player1: ElementRef;
  @ViewChild('player2', { static: true }) player2: ElementRef;
  @ViewChild('ball', { static: true }) ball: ElementRef;

  windowsWidth: number = window.innerWidth;
  windowsHeight: number = window.innerHeight;

  mouseDown: boolean = false;
  playerWidth = 100;
  playerHeight = 20;

  player1Position = { x: 0, y: this.windowsHeight - 30 };

  player2Position = { x: 50, y: 40 };
  player2Direction = 1;

  ballPosition = { x: 100, y: 500 };
  ballDirection = 'right';

  ballXDirection = 1;
  ballYDirection = 1;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    setInterval(() => {
      this.ballMoving();
      this.player2AutoMoving();
    }, 10);
  }

  ballMoving = () => {
    const position = {
      x:
        this.ballXDirection > 0
          ? this.ballPosition.x++ < this.windowsWidth - 20
            ? this.ballPosition.x++
            : (this.ballXDirection = -1)
          : this.ballPosition.x-- > 0
          ? this.ballPosition.x--
          : (this.ballXDirection = 1),
      y:
        this.ballYDirection > 0
          ? this.ballPosition.y++ >
              this.windowsHeight - (this.playerHeight + 30) &&
            this.ballPosition.x > this.player1Position.x &&
            this.ballPosition.x < this.player1Position.x + 100
            ? (this.ballYDirection = -1)
            : this.ballPosition.y++ < this.windowsHeight - 20
            ? this.ballPosition.y++
            : (this.ballYDirection = -1)
          : this.ballPosition.y-- < this.playerHeight + 40 &&
            this.ballPosition.x > this.player2Position.x &&
            this.ballPosition.x < this.player2Position.x + this.playerWidth
          ? (this.ballYDirection = 1)
          : this.ballPosition.y-- > 0
          ? this.ballPosition.y--
          : (this.ballYDirection = 1),
    };

    this.renderer.setStyle(this.ball.nativeElement, 'left', `${position.x}px`);
    this.renderer.setStyle(this.ball.nativeElement, 'top', `${position.y}px`);
  };

  player2AutoMoving = () => {
    const position = {
      x:
        this.player2Direction > 0
          ? this.player2Position.x + this.playerWidth < this.windowsWidth
            ? this.player2Position.x++
            : (this.player2Direction = -1)
          : this.player2Position.x-- > 0
          ? this.player2Position.x--
          : (this.player2Direction = 1),
      y: this.player2Position.y,
    };

    this.renderer.setStyle(
      this.player2.nativeElement,
      'left',
      `${position.x}px`
    );
  };

  movePlayer = (x: number) => {
    const position =
      x < 0 ? 0 : x > this.windowsWidth - 100 ? this.windowsWidth - 100 : x;

    this.player1Position.x = position;

    this.renderer.setStyle(this.player1.nativeElement, 'left', `${position}px`);
  };

  @HostListener('mouseup', ['$event'])
  onMouseup() {
    this.mouseDown = false;
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    if (this.mouseDown) {
      this.player1Position.x = event.pageX;

      this.movePlayer(this.player1Position.x);
    }
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event) {
    this.mouseDown = true;
    this.player1Position.x = event.pageX;

    this.movePlayer(this.player1Position.x);
  }
}
