const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const startGameElement = document.getElementById('startGame');
const newGameBtn = document.getElementById('newGameBtn');

// Audio Elements
const shotSound = document.getElementById('shotSound');
const startSound = document.getElementById('startSound');
const gameOverSound = document.getElementById('gameOverSound');
const fakeNewsSound = document.getElementById('fakeNewsSound');

let player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 80,
  height: 50,
}; // Increased width of player gun
let bullets = [];
let enemies = [];
let score = 0;
let level = 1;
let gameInterval;
let gameStarted = false; // Tracks if the game has started or if waiting to start next level
let gameOver = true; // Initially set to true to wait for spacebar press
let keyState = {};

// Font settings for rendering MAGA text
const fontSize = 24;
ctx.font = `${fontSize}px Arial`;

// Draw background and initial text
function drawBackground() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text "SAVE THE WORLD FROM TRUMP!"
  ctx.fillStyle = '#fff';
  ctx.font = '36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    'SAVE THE WORLD FROM TRUMP!',
    canvas.width / 2,
    canvas.height / 2 - 50
  );
}

document.addEventListener('keydown', (e) => {
  keyState[e.key] = true;
  if (e.key === ' ' && !gameStarted) {
    if (gameOver) {
      startGame();
    } else {
      startNextLevel();
    }
  }
});

document.addEventListener('keyup', (e) => {
  keyState[e.key] = false;
});

canvas.addEventListener('click', () => {
  if (!gameOver && gameStarted) {
    bullets.push({
      x: player.x + player.width / 2 - 5,
      y: player.y,
      width: 10,
      height: 20,
    });
  }
});

newGameBtn.addEventListener('click', () => {
  if (gameOver) {
    startGame();
  }
});

function startGame() {
  startSound.play(); // Play the start game sound
  startGameElement.style.display = 'none';
  gameOverElement.style.display = 'none';
  newGameBtn.style.display = 'none';
  score = 0;
  level = 1;
  gameOver = false;
  gameStarted = true;
  player.x = canvas.width / 2 - 40; // Adjusted starting position of player gun
  bullets = [];
  enemies = [];
  scoreElement.textContent = 'Score: 0';
  gameInterval = setInterval(updateGame, 1000 / 60);
  setTimeout(spawnEnemies, 1000); // Delay enemy spawning by 1 second for the blank screen
  playFakeNewsSound(); // Start playing fake news sound randomly
}

function spawnEnemies() {
  const baseSpeed = 1 + (level - 1) * 0.5; // Start with a slower base speed

  setInterval(() => {
    if (!gameOver && gameStarted) {
      const size = Math.random() < 0.5 ? 30 : 50;
      const speed = baseSpeed;
      const points = size === 30 ? 10 : 50;
      const xPos = Math.random() * (canvas.width - size);
      enemies.push({
        x: xPos,
        y: 0,
        width: size,
        height: size,
        speed: speed,
        points: points,
      });
    }
  }, 1000);
}

function updateGame() {
  if (keyState['ArrowLeft'] && player.x > 0) player.x -= 5;
  if (keyState['ArrowRight'] && player.x < canvas.width - player.width)
    player.x += 5;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background with text
  drawBackground();

  // Draw player gun DEM
  ctx.fillStyle = 'blue';
  ctx.fillText('DEM', player.x, player.y + fontSize);

  bullets = bullets.filter((bullet) => bullet.y > 0);
  bullets.forEach((bullet) => {
    bullet.y -= 10;
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;

    // Render MAGA text instead of rectangles
    ctx.fillStyle = 'red'; // Make all MAGA red
    ctx.fillText('MAGA', enemy.x, enemy.y + fontSize, enemy.width); // Render MAGA with enemy width

    if (enemy.y + enemy.height >= canvas.height) {
      gameOver = true;
    }

    bullets.forEach((bullet, bulletIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        score += enemy.points;
        scoreElement.textContent = `Score: ${score}`;
        shotSound.play(); // Play the shot sound
        bullets.splice(bulletIndex, 1);
        enemies.splice(index, 1);

        // Check if level is won
        if (score >= 450) {
          gameStarted = false; // Stop game until next level starts
          level++;
          clearInterval(gameInterval);
          setTimeout(() => {
            flashText('Well done!', 1000, () => {
              flashText('Dump That Trump', 1000, () => {
                flashText('Next Level', 1000, () => {
                  startNextLevel(); // Automatically start next level
                });
              });
            });
          }, 1000);
        }
      }
    });
  });

  if (gameOver) {
    clearInterval(gameInterval);
    gameOverElement.style.display = 'block';
    gameOverSound.play(); // Play the game over sound
    newGameBtn.textContent = 'New Game';
    newGameBtn.style.display = 'block';
  }
}

function startNextLevel() {
  score = 0; // Reset score for next level
  scoreElement.textContent = `Score: ${score}`;
  bullets = [];
  enemies = [];
  newGameBtn.style.display = 'none';
  gameInterval = setInterval(updateGame, 1000 / 60);
  setTimeout(spawnEnemies, 1000); // Delay enemy spawning by 1 second for the blank screen
  gameOver = false;
  gameStarted = true;
}

function flashText(text, duration, callback) {
  gameOverElement.textContent = text;
  gameOverElement.style.display = 'block';
  setTimeout(() => {
    gameOverElement.style.display = 'none';
    callback();
  }, duration);
}

// Function to play "You Are Fake News" sound randomly during the game
function playFakeNewsSound() {
  const randomTime = Math.random() * 30000 + 10000; // Random time between 10 and 40 seconds
  setTimeout(() => {
    if (gameStarted && !gameOver) {
      fakeNewsSound.play();
      playFakeNewsSound(); // Schedule the next random sound
    }
  }, randomTime);
}
