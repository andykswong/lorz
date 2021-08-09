export const Sound = {
  Game: new Audio('./bg.mp3'),
  Victory: new Audio('./victory.mp3'),
  Lost: new Audio('./lost.mp3'),

  Footstep: new Audio('./footstep.ogg'),
  Coin: new Audio('./coin.wav'),

  Cut: new Audio('./cut.ogg'),
  Hit: new Audio('./hit.ogg'),
  Blast: new Audio('./blast.ogg'),
  Block: new Audio('./block.wav'),
} as const;

class AudioPool {
  readonly audio: HTMLAudioElement[] = [];
  index: number = 0;
}

const POOL_SIZE = 10;

const Pools = {
  Cut: new AudioPool(),
  Hit: new AudioPool(),
  Blast: new AudioPool(),
  Block: new AudioPool(),
};

export function playSound(audio: keyof typeof Sound): void {
  switch (audio) {
    case 'Game':
      Sound.Lost.pause();
      Sound.Victory.pause();
      Sound.Game.loop = true;
      Sound.Game.currentTime = 0;
      Sound.Game.volume = 0.2;
      Sound.Game.play();
      return;
    case 'Victory':
    case 'Lost':
      Sound.Game.pause();
      Sound[audio].currentTime = 0;
      Sound[audio].volume = 0.2;
      Sound[audio].play();
      return;
    case 'Footstep':
      Sound[audio].currentTime = 0;
      Sound[audio].volume = 0.1;
      Sound[audio].play();
      return;
    case 'Coin':
      Sound[audio].currentTime = 0;
      Sound[audio].volume = 0.2;
      Sound[audio].play();
      return;
  }

  const pool = Pools[audio];
  if (pool.audio.length < POOL_SIZE) {
    pool.audio.push(Sound[audio].cloneNode() as HTMLAudioElement)
  }

  const audioEle = pool.audio[pool.index];
  audioEle.currentTime = 0;
  audioEle.volume = 0.2;
  audioEle.play();

  pool.index = (pool.index + 1) % POOL_SIZE;
}
