const socket = io();

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
const usernameInput = document.getElementById('username');

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  const username = usernameInput.value;
  socket.emit('chat message', { username, message });
  messageInput.value = '';
});

socket.on('chat message', (msg) => {
  const messageElement = document.createElement('li');
  messageElement.textContent = `${msg.username}: ${msg.message}`;
  messages.appendChild(messageElement);
});

document.addEventListener('keyup', (e) => {
  if (e.key === '32') {
    messageInput.focus();
  }
});

messageInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    messageForm.submit();
  }
});


document.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    const chatWindow = document.querySelector('body main section');
    chatWindow.classList.toggle('show');
    messageInput.focus();
  }
});