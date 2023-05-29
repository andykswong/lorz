/** Returns the average of `iter` random numbers between 0 and 1. */
export function zrand(iter: number = 6): number {
  let rand = 0;
  for (let i = 0; i < iter; ++i) {
    rand += Math.random();
  }
  return rand / 6;
}

/** Returns the average of `iter` random numbers between start and end. */
export function zrandom(start: number, end: number, iter: number = 6): number {
  return Math.floor(start + zrand(iter) * (end - start + 1));
}
