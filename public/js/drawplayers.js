// Connect to the Socket.io server
const socket = io();
const canvas = document.querySelector('canvas');
const playerColors = ['red', 'blue', 'green', 'yellow'];
let playerIndex;

// Get the 2D rendering context for the canvas
const ctx = canvas.getContext('2d');

// Set up the canvas and initial player position
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Store the positions of all players
let players = {};

// Draw all players on the canvas
function drawPlayers(players) {
  for (const id in players) {
    if (players.hasOwnProperty(id)) {
      const player = players[id];
      const color = player.color;

      ctx.fillStyle = color;
      ctx.fillRect(player.x, player.y, 20, 20);
    }
  }
}

// Redraw the canvas with updated player positions
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayers(players);
    requestAnimationFrame(redrawCanvas);
  }

// Listen for player index event from the server
socket.on('playerIndex', (index) => {
  playerIndex = index;
});

// Emit player movement events to the server when the player moves
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
  
    // Emit player movement event to the server
    socket.emit('playerMoved', { x, y });
    // console.log('playerMoved', { id: socket.id, x, y });
  });

// Listen for player movement events from the server
socket.on('playerMoved', ({ id, x, y }) => {
  players[id].x += x;
  players[id].y += y;
});

// Listen for all players event from the server
socket.on('allPlayers', (allPlayers) => {
  // Assign colors to the first 4 players
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
  // Assign a color to the new player
  const color = playerColors[Object.keys(players).length % 4];

  // Add new player to the players object with the assigned color
  players[id] = { x: 0, y: 0, color };

  // If this is the local player, set their playerIndex to the index of the new player
  if (id === socket.id) {
    playerIndex = Object.keys(players).length - 1;
  }
});

// Listen for player disconnected event from the server
socket.on('playerDisconnected', (id) => {
  delete players[id];
});

requestAnimationFrame(redrawCanvas);