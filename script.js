const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const colors = {
  'T': '#FF00FF',
  'O': '#FFFF00',
  'L': '#FFA500',
  'J': '#0000FF',
  'I': '#00FFFF',
  'S': '#00FF00',
  'Z': '#FF0000'
};

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T': return [[0, type, 0], [type, type, type], [0, 0, 0]];
    case 'O': return [[type, type], [type, type]];
    case 'L': return [[0, 0, type], [type, type, type], [0, 0, 0]];
    case 'J': return [[type, 0, 0], [type, type, type], [0, 0, 0]];
    case 'I': return [[0, 0, 0, 0], [type, type, type, type], [0, 0, 0, 0], [0, 0, 0, 0]];
    case 'S': return [[0, type, type], [type, type, 0], [0, 0, 0]];
    case 'Z': return [[type, type, 0], [0, type, type], [0, 0, 0]];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function sweepArena() {
  outer: for (let y = arena.length - 1; y >= 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    sweepArena();
    playerReset();
  }
  dropCounter = 0;
}

function playerReset() {
  const pieces = 'TJLOSZI';
  const type = pieces[Math.floor(Math.random() * pieces.length)];
  player.matrix = createPiece(type);
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);

  if (collide(arena, player)) {
    alert('Гра закінчена!');
    arena.forEach(row => row.fill(0));
  }
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

let dropCounter = 0;
let dropInterval = 450;
let lastTime = 0;
let isPaused = true;

function update(time = 0) {
  if (isPaused) return;
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
  if (isPaused) return;
  if (event.key === 'ArrowLeft') {
    player.pos.x--;
    if (collide(arena, player)) player.pos.x++;
  } else if (event.key === 'ArrowRight') {
    player.pos.x++;
    if (collide(arena, player)) player.pos.x--;
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  }
});

// Кнопки
document.getElementById('startBtn').addEventListener('click', () => {
  if (isPaused) {
    isPaused = false;
    update();
  }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  isPaused = true;
});

const arena = createMatrix(12, 20);
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
};

playerReset();
draw();