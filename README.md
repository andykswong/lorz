# DUNGEON OF LORZ - LOWREZJAM 2021 Submission
Dungeon of Lorz is a 64x64 infinite side-scroll action dungeon crawler. It is a submission to [LOWREZJAM 2021](https://itch.io/jam/lowrezjam-2021).
Lorz = low rez :)

![Screenshot 2](./screenshots/2.png) 
![Screenshot 0](./screenshots/0.png) 
![Screenshot 1](./screenshots/1.png) 
![Screenshot 3](./screenshots/3.png) 

Authenticity:
- LOWREZJAM 2021 requires 64x64 resolution. To fit the requirement, the game is rendered using WebGL with a 64x64 drawing buffer. The canvas is then upscaled to 256x256 using CSS, with style: ```image-rendering: crisp-edges; image-rendering: pixelated```;

Game Control
- WASD or arrow keys to move
- Q to block
- E or Enter to attack

Menu Control:
- E or Enter to start / restart
- WASD or arrow keys to select unlockables
- Q to buy or equip unlockables

Made possible by:
- [mugl](https://github.com/andykswong/mugl): Micro WebGL library.
- [munum](https://github.com/andykswong/munum): Micro Numerical library.
