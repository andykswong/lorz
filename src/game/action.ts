export enum Action {
  None   = 0,
  Up     = 1 << 0,
  Down   = 1 << 1,
  Left   = 1 << 2,
  Right  = 1 << 3,
  Block  = 1 << 4,
  Attack = 1 << 5,
  Jump   = 1 << 6,
}

export function mapKeyToAction(key: string): Action {
  switch (key) {
    case 'ArrowUp': case 'w': return Action.Up;
    case 'ArrowDown': case 's': return Action.Down;
    case 'ArrowLeft': case 'a': return Action.Left;
    case 'ArrowRight': case 'd': return Action.Right;
    case 'Control': return Action.Block;
    case 'Enter': return Action.Attack;
    case ' ': return Action.Jump;
  }
  return Action.None;
}
