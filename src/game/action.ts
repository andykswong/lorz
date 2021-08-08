export enum Action {
  None = 0,
  Up = 1 << 0,
  Down = 1 << 1,
  Left = 1 << 2,
  Right = 1 << 3,
  Block = 1 << 4,
  Attack = 1 << 5,
  Jump = 1 << 6,
}

export function mapKeyToAction(key: string): Action {
  switch (key) {
    case 'ArrowUp': case 'w': return Action.Up;
    case 'ArrowDown': case 's': return Action.Down;
    case 'ArrowLeft': case 'a': return Action.Left;
    case 'ArrowRight': case 'd': return Action.Right;
    case 'q': return Action.Block;
    case 'Enter': case 'e': return Action.Attack;
    case ' ': return Action.Jump;
  }
  return Action.None;
}

export function mapGamepadActions(): Action {
  const THRESHOLD = 0.5;
  let action = Action.None;
  const gamepad = navigator.getGamepads?.()[0];
  if (gamepad) {
    const horizontal = gamepad.axes[0];
    if (horizontal < -THRESHOLD) {
      action = action | Action.Left;
    } else if (horizontal > THRESHOLD) {
      action = action | Action.Right;
    }
    const vertical = gamepad.axes[1];
    if (vertical < -THRESHOLD) {
      action = action | Action.Up;
    } else if (vertical > THRESHOLD) {
      action = action | Action.Down;
    }

    if (gamepad.buttons[0].pressed) {
      action = action | Action.Attack;
    }
    if (gamepad.buttons[1].pressed) {
      action = action | Action.Block;
    }
  }
  return action;
}
