import resizeCanvas from "./modules/canvasResizing.js";

const socket = io();
const canvas = document.querySelector('canvas');
let players = {};
let chatHistory = [];

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

    const message = player.message;
    if (message) {
      const messageWidth = ctx.measureText(message).width;
      const messageX = player.x + (30 - messageWidth) / 2;
      const messageY = player.y - 25;
      const bubblePadding = 5;
      const bubbleWidth = messageWidth + bubblePadding * 2;
      const bubbleHeight = 20;
      const tailHeight = 10;
      const tailWidth = 10;
      const tailBaseX = player.x + 15;
      const tailBaseY = player.y - 15;

      // Draw the chat bubble background
      ctx.fillStyle = 'white';
      ctx.fillRect(messageX - bubblePadding, messageY - bubbleHeight, bubbleWidth, bubbleHeight);

      // Draw the chat bubble border
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.strokeRect(messageX - bubblePadding, messageY - bubbleHeight, bubbleWidth, bubbleHeight);

      // Draw the speech bubble tail
      ctx.beginPath();
      ctx.moveTo(tailBaseX, tailBaseY);
      ctx.lineTo(tailBaseX - tailWidth / 2, tailBaseY - tailHeight);
      ctx.lineTo(tailBaseX + tailWidth / 2, tailBaseY - tailHeight);
      ctx.closePath();
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.stroke();

      // Display the message inside the chat bubble
      ctx.fillStyle = 'black';
      ctx.font = '12px Roboto';
      ctx.fillText(message, messageX, messageY - 5);
    }
  }
}

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

  socket.emit('getChatHistory');
});

socket.io.on("reconnect_attempt", () => {
  const reconnectMessage = document.querySelector('body > p');
  reconnectMessage.style.display = 'block';
  reconnectMessage.textContent = 'Attempting to reconnect...';
});

socket.on('playerDisconnected', (id) => {
  delete players[id];
});

socket.on('bubbleMessage', (msg) => {
  const bubbleDuration = 5000;
  const senderId = msg.senderId;
  if (players[senderId]) {
    players[senderId].message = msg.message;

    setTimeout(() => {
      players[senderId].message = null;
    }, bubbleDuration);
  }
});

socket.on('chatMessage', (msg) => {
  const messageElement = document.createElement('li');
  const messageHistory = document.getElementById('messageHistory');

  messageElement.textContent = `${msg.message}`;

  const beforeElement = document.createElement('span');
  beforeElement.classList.add('message-before');
  beforeElement.style.backgroundColor = msg.color;

  messageElement.prepend(beforeElement);
  messageHistory.appendChild(messageElement);

  if (msg.username === invisibleSpan.textContent) {
    messageElement.classList.add('my-message');
  }
});

socket.on('chat history', storedChatHistory => {
  chatHistory = storedChatHistory;

  const messageHistory = document.getElementById('messageHistory');
  messageHistory.innerHTML = '';

  for (const msg of chatHistory) {
    const messageElement = document.createElement('li');
    messageElement.textContent = `${msg.message}`;

    const beforeElement = document.createElement('span');
    beforeElement.classList.add('message-before');
    beforeElement.style.backgroundColor = msg.color;

    messageElement.prepend(beforeElement);

    if (msg.username === invisibleSpan.textContent) {
      messageElement.classList.add('my-message');
    }

    messageHistory.appendChild(messageElement);
  }
});

// ********** 
  // Chat functionality
// **********

const chat = document.querySelector('form');
const messageInput = document.getElementById('message');
const invisibleSpan = document.getElementById('username');
const changeNameButton = document.getElementById('change-name');
const closeButton = document.getElementById('close-button');
const chatWindow = document.querySelector('body main section');
const chatShortcut = document.querySelector('footer')

function showAlert() {
  const newName = prompt('Please enter your name:');
  if (newName && newName.trim() !== '') {
    invisibleSpan.textContent = newName;
    localStorage.setItem('username', newName);
    socket.emit('updateName', newName);
    chatShortcut.classList.add('show');
  } else {
    alert('Name cannot be blank. Please try again.');
    showAlert();
  }
}

chat.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  const username = invisibleSpan.textContent;

  if (message !== '') {
    localStorage.setItem('username', username);

    socket.emit('chatMessage', { username, message });
    socket.emit('bubbleMessage', { message });

    messageInput.value = '';
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'z' || e.key === 'Z') {
    chatWindow.classList.add('show');
    chatShortcut.classList.add('hidden');
  }
});

closeButton.addEventListener('click', () => {
  chatWindow.classList.remove('show');
});

changeNameButton.addEventListener('click', showAlert);

showAlert();
resizeCanvas();
requestAnimationFrame(redrawCanvas);