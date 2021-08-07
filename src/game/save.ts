import { Hero, Unlockable } from "./config";

const STORAGE_PREFIX = 'andykswong/lowrezjam2021/'
const COINS = STORAGE_PREFIX + 'coins';
const HEROS = STORAGE_PREFIX + 'heros';
const UNLOCKABLES = STORAGE_PREFIX + 'unlockables';

export class SaveData {
  private _coins: number = 0;
  private _hero: number = 1;
  private _unlock: number = 0;

  public constructor() {
    if (window.localStorage) {
      try {
        const coins = window.localStorage.getItem(COINS);
        this.coins = (coins && parseInt(coins)) || this._coins;

        const hero = window.localStorage.getItem(HEROS);
        this._hero = (hero && parseInt(hero)) || this._hero;

        const unlock = window.localStorage.getItem(UNLOCKABLES);
        this._unlock = (unlock && parseInt(unlock)) || this._unlock;
      } catch (e) {
        console.warn(e);
      }
    }
  }

  public get coins(): number {
    return this._coins;
  }
  
  public set coins(coins: number) {
    this._coins = coins;
    this.save(COINS, coins.toString());
  }

  public isHeroUnlocked(hero: Hero): boolean {
    return (this._hero & hero) === hero;
  }
  
  public isUnlocked(unlockables: Unlockable): boolean {
    return (this._unlock & unlockables) === unlockables;
  }

  public unlockHero(hero: Hero): void {
    this._hero = this._hero | hero;
    this.save(HEROS, this._hero.toString());
  }
  
  public unlock(unlockable: Unlockable): void {
    this._unlock = this._unlock | unlockable;
    this.save(UNLOCKABLES, this._unlock.toString());
  }

  private save(key: string, data: string): void {
    if (window.localStorage) {
      try {
        window.localStorage.setItem(key, data);
      } catch (e) {
        console.warn(e);
      }
    }
  }
}
