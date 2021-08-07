export const Sound = {
  Game: new Audio('./bg.mp3'),
  Victory: new Audio('./victory.mp3'),
  Lost: new Audio('./lost.mp3'),

  Footstep: new Audio('./footstep.ogg'),
  Cut: new Audio('./cut.ogg'),
  Hit: new Audio('./hit.ogg'),
  Blast: new Audio('./blast.ogg'),
  Block: new Audio('./block.wav'),
  Coin: new Audio('./coin.wav'),
} as const;

Sound.Game.loop = true;
Sound.Game.volume = 0.1;
Sound.Victory.volume = 0.1;
Sound.Lost.volume = 0.1;
Sound.Footstep.volume = 0.1;

export function playSound(audio: HTMLAudioElement): void {
  const a = audio.cloneNode() as HTMLAudioElement;
  a.volume = 0.2;
  a.play();
}
