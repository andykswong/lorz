import { Hero, Unlockable } from './config';

const DATA_KEY = 'andykswong/lowrezjam2021/save';

interface SaveData {
  coins: number;
  unlockedHeroes: Hero;
  unlockedUpgrades: Unlockable;
  hero: Hero;
  upgrades: Record<Hero, Unlockable>;
}

export class GameSave {
  private data: SaveData;

  public constructor() {
    this.data = {
      coins: 0,
      unlockedHeroes: Hero.KNIGHT,
      unlockedUpgrades: 0,
      hero: Hero.KNIGHT,
      upgrades: {},
    };

    try {
      if (window.localStorage) {
        const dataJson = window.localStorage.getItem(DATA_KEY);
        if (dataJson) {
          this.data = JSON.parse(dataJson);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  public get coins(): number {
    return this.data.coins;
  }
  
  public set coins(coins: number) {
    this.data.coins = coins;
    this.save();
  }

  public isHeroUnlocked(hero: Hero): boolean {
    return (this.data.unlockedHeroes & hero) === hero;
  }
  
  public unlockHero(hero: Hero): void {
    this.data.unlockedHeroes = this.data.unlockedHeroes | hero;
    this.save();
  }

  public isUnlocked(unlockables: Unlockable): boolean {
    return (this.data.unlockedUpgrades & unlockables) === unlockables;
  }

  public unlock(unlockable: Unlockable): void {
    this.data.unlockedUpgrades = this.data.unlockedUpgrades | unlockable;
    this.save();
  }
  
  public equippedFor(hero: Hero): Unlockable {
    return this.data.upgrades[hero] || 0;
  }

  public get hero(): Hero {
    return this.data.hero;
  }
  
  public set hero(hero: Hero) {
    this.data.hero = hero;
    this.save();
  }

  public get equipped(): Unlockable {
    return this.equippedFor(this.hero);
  }
  
  public set equipped(equipped: Unlockable) {
    this.data.upgrades[this.data.hero] = equipped;
    this.save();
  }

  private save(): void {
    try {
      window.localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn(e);
    }
  }
}
