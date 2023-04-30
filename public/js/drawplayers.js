const socket = io();
const canvas = document.querySelector('canvas');
const playerColors = ['red', 'blue', 'green', 'yellow'];

let players = {};
let playerIndex;

// Set up the canvas and initial player position
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Draw all players on the canvas
function drawPlayers(players) {
  for (const id in players) {
    if (players.hasOwnProperty(id)) {
      const player = players[id];
      const color = player.color;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = color;
      ctx.fillRect(player.x, player.y, 20, 20);
    }
  }
}

// Redraw the canvas with updated player positions
function redrawCanvas() {
  const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayers(players);
    requestAnimationFrame(redrawCanvas);
}

document.addEventListener('keydown', (event) => {
    let x = 0;
    let y = 0;
  
    if (event.key === 'ArrowUp') {
    console.log('up')
      y = -10;
    } else if (event.key === 'ArrowDown') {
    console.log('down')
      y = 10;
    } else if (event.key === 'ArrowLeft') {
    console.log('left')
      x = -10;
    } else if (event.key === 'ArrowRight') {
    console.log('right')
      x = 10;
    }
  
    socket.emit('playerMoved', { x, y });
    // console.log('playerMoved', { id: socket.id, x, y });
  });

socket.on('playerIndex', (index) => {
  playerIndex = index;
});

socket.on('playerMoved', ({ id, x, y }) => {
  players[id].x += x;
  players[id].y += y;
});

socket.on('allPlayers', (allPlayers) => {
  let i = 0;
  for (const id in allPlayers) {
    if (allPlayers.hasOwnProperty(id)) {
      allPlayers[id].color = playerColors[i];
      i++;
      if (i >= 4) {
        break;
      }
    }
  }
  players = allPlayers;
});

socket.on('newPlayer', (id) => {
  const color = playerColors[Object.keys(players).length % 4];
  players[id] = { x: 0, y: 0, color };

  if (id === socket.id) {
    playerIndex = Object.keys(players).length - 1;
  }
});

socket.on('playerDisconnected', (id) => {
  delete players[id];
});

requestAnimationFrame(redrawCanvas);
