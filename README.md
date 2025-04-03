# Asteroid Shooter Game

A simple 2D shooter game built using HTML5 Canvas and JavaScript. The game features a player-controlled spaceship that can move and shoot projectiles to destroy asteroids. As you progress, your score increases, and new asteroids spawn. The game also includes high score tracking using the browser's local storage.

## Features

- **Player Movement**: Move the spaceship up, down, left, and right using the arrow keys.
- **Rotation**: Rotate the spaceship with the Z and C keys.
- **Projectile Shooting**: Shoot projectiles using the X key (maximum of 3 projectiles at a time).
- **Asteroids**: Asteroids spawn at random positions and move towards the player.
- **Collisions**: The player can destroy asteroids by hitting them with projectiles. The player can also collide with asteroids, losing lives.
- **Lives & Score**: The player starts with 3 lives and can earn additional lives after reaching certain score milestones.
- **Game Over**: When the player loses all lives, the game ends, and the player can enter their name to save their score in the high scores table.
- **High Scores**: The top 5 high scores are stored in the browser's local storage and displayed when the game ends.

## Controls

- **Arrow Keys**: Move the spaceship.
- **Z**: Rotate the spaceship left.
- **C**: Rotate the spaceship right.
- **X**: Shoot projectiles (up to 3 at a time).
- **Escape**: Restart the game after a Game Over (if prompted).

