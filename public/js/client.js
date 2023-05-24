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

    const playerName = player.name;
    const nameWidth = ctx.measureText(playerName).width;
    const nameX = player.x + (30 - nameWidth) / 2;

    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, 30, 30);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, 30, 30);

    ctx.fillStyle = 'black';
    ctx.font = '12px Roboto';
    ctx.fillText(playerName, nameX, player.y - 5);
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

socket.on('playerColor', (color, socketId) => {
  players[socketId].color = color;
});

socket.on('playerNameUpdated', ({ playerId, name }) => {
  players[playerId].name = name;
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

socket.on('chat message', (msg) => {
  const messageElement = document.createElement('li');
  messageElement.textContent = `${msg.username}: ${msg.message}`;
  messageList.appendChild(messageElement);
});

// ********** 
  // Chat functionality
// **********

const chat = document.querySelector('form');
const messageInput = document.getElementById('message');
const messageList = document.getElementById('messages');
const invisibleSpan = document.getElementById('username');
const changeNameButton = document.getElementById('change-name');
const closeButton = document.getElementById('close-button');
const chatWindow = document.querySelector('body main section');
const storedUsername = localStorage.getItem('username');

function showAlert() {
  const newName = prompt('Please enter your name:') || storedUsername;
  
  if (newName) {
    invisibleSpan.textContent = newName;
    localStorage.setItem('username', newName);
    socket.emit('updateName', newName);
  } else if (storedUsername) {
    invisibleSpan.textContent = storedUsername;
    socket.emit('updateName', storedUsername);
  }
}

// Check if the username is stored in local storage
if (storedUsername) {
  invisibleSpan.textContent = storedUsername;
  socket.emit('updateName', storedUsername);
} 
else {
  showAlert();
}

changeNameButton.addEventListener('click', showAlert);

chat.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  const username = invisibleSpan.textContent;

  if (message !== '') {
    // Store the username in local storage
    localStorage.setItem('username', username);

    socket.emit('chat message', { username, message });
    messageInput.value = '';
  };
});

// Open/close chat window with "Z" key
document.addEventListener('keyup', (e) => {
  if (e.key === 'z' || e.key === 'Z') {
    chatWindow.classList.add('show');
  }
});

closeButton.addEventListener('click', () => {
  chatWindow.classList.remove('show');
});

resizeCanvas();
requestAnimationFrame(redrawCanvas);