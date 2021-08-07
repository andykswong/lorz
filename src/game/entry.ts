import { Game } from '../core';
import { HEIGHT, Hero, Unlockable, WIDTH } from './config';
import { GameScreen } from './game';
import { SaveData } from './save';
import { StartScreen } from './start';

export class LowRezJam2021Game extends Game {
  public save: SaveData = new SaveData();
  public selectedHero: Hero = Hero.KNIGHT;
  public selectedUnlocks: Unlockable = 0;
  private readonly startScreen = new StartScreen(this);
  private readonly gameScreen = new GameScreen(this);

  public constructor() {
    super(document.getElementById('game')!, WIDTH, HEIGHT);
  }

  public start(): void {
    super.start();
    this.restart();
    //this.startGame();
  }

  public restart(): void {
    this.setScreen(this.startScreen);
  }

  public startGame(): void {
    this.setScreen(this.gameScreen);
  }
}
