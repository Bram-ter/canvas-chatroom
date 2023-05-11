import resizeCanvas from "./modules/canvasResizing.js";

const socket = io();
const canvas = document.querySelector('canvas');
let players = {};

// Draw all players on the canvas
function drawPlayers() {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in players) {
    const player = players[id];
    const color = player.color;

    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, 30, 30);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, 30, 30);
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
  // Define the range of coordinates on the screen
  const minX = 0;
  const maxX = 800;
  const minY = 0;
  const maxY = 600;

  const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

  // Assign the random coordinates to the new player
  players[id] = { x: randomX, y: randomY };
});

socket.on('connect', () => {
  const reconnectMessage = document.querySelector('body > p');
  if (reconnectMessage) {
    reconnectMessage.style.display = 'none';
  }
});

socket.io.on("reconnect_attempt", () => {
  const reconnectMessage = document.querySelector('body > p');
  reconnectMessage.style.display = 'block';
  reconnectMessage.textContent = 'Attempting to reconnect...';
});

socket.on('playerDisconnected', (id) => {
  delete players[id];
});

socket.on('playerColor', (color, socketId) => {
  players[socketId].color = color;
});

resizeCanvas();
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
