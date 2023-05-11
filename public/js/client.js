const socket = io();
const canvas = document.querySelector('canvas');
let players = {};
let currentPlayerColor;

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
    const player = players[id];
    const color = player.color;

    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, 30, 30);
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
    y = -10;
  } else if (event.key === 'ArrowDown') {
    y = 10;
  } else if (event.key === 'ArrowLeft') {
    x = -10;
  } else if (event.key === 'ArrowRight') {
    x = 10;
  }

  socket.emit('playerMoved', { x, y });
});

socket.on('playerMoved', ({ id, x, y }) => {
  players[id].x += x;
  players[id].y += y;
});

socket.on('allPlayers', (allPlayers) => {
  players = allPlayers;
});

socket.on('newPlayer', (id) => {
  players[id] = { x: 0, y: 0 };
});

socket.on('disconnect', () => {
  const reconnectMessage = document.createElement('p');
  reconnectMessage.id = 'reconnectMessage';
  reconnectMessage.textContent = 'Attempting to reconnect...';
  reconnectMessage.style.display = 'block';
  document.body.appendChild(reconnectMessage);
});

socket.on('reconnect', () => {
  const reconnectMessage = document.querySelector('#reconnectMessage');
  if (reconnectMessage) {
    reconnectMessage.style.display = 'none';
  }
});

socket.on('playerDisconnected', (id) => {
  delete players[id];
});

socket.on('playerColor', (color, socketId) => {
  players[socketId].color = color;
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
