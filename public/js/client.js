const socket = io();
const canvas = document.querySelector('canvas');
const playerColors = ['red', 'blue', 'green', 'yellow'];

let players = {};
let playerIndex;

// ********** 
  // Client side game code 
// **********

// Set up the canvas and initial player position
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Draw all players on the canvas
function drawPlayers(players) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

// ********** 
  // Chat functionality
// **********

const chat = document.querySelector('form');
const messageInput = document.getElementById('message');
const messageList = document.querySelector('ul');
const usernameInput = document.getElementById('username');

chat.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  const username = usernameInput.value;
  socket.emit('chat message', { username, message });
  messageInput.value = '';
});

socket.on('chat message', (msg) => {
  const messageElement = document.createElement('li');
  messageElement.textContent = `${msg.username}: ${msg.message}`;
  messageList.appendChild(messageElement);
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    messageInput.focus();
  }
});

messageInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    chat.submit();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    const chatWindow = document.querySelector('body main section');
    chatWindow.classList.toggle('show');
    messageInput.focus();
  }
});
