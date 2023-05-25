import getRandomColor from "./getRandomColor.js"

const players = {};
let chatHistory = [];

function initPlayers(socket, io) {
  const color = getRandomColor();
  console.log(`User ${color} with id: ${socket.id} connected`);

  players[socket.id] = { 
    x: 0,
    y: 0, 
    color,
    name: ''
  };

  socket.emit('allPlayers', players);
  socket.broadcast.emit('newPlayer', socket.id);
  io.emit('playerColor', color, socket.id, players[socket.id].name);

  socket.on('updateName', (name) => {
    const playerId = socket.id;
    players[playerId].name = name;
    io.emit('playerNameUpdated', { playerId, name });
  });

  socket.on('bubbleMessage', (msg) => {
    const playerId = socket.id;
    const playerName = players[playerId].name;
    const message = `${msg.message}`;
  
    io.emit('bubbleMessage', { senderId: playerId, username: playerName, message });
  });

  socket.on('chatMessage', (msg) => {
    const playerId = socket.id;
    const playerName = players[playerId].name;
    const message = `${playerName}: ${msg.message}`;

    chatHistory.push({ username: playerName, color: players[playerId].color, message });

    if (chatHistory.length > 50) {
      chatHistory.shift();
    }
  
    io.emit('chatMessage', { username: playerName, color: players[playerId].color, message });
  });

  socket.on('getChatHistory', () => {
    socket.emit('chat history', chatHistory);
  });

  socket.on('playerMoved', ({ x, y }) => {
    players[socket.id].x = x;
    players[socket.id].y = y;
    socket.broadcast.emit('playerMoved', { id: socket.id, x, y });
    socket.emit('playerMoved', { id: socket.id, x, y });
  });

  socket.on('disconnect', () => {
    console.log(`User ${color} disconnected`);
    socket.broadcast.emit('playerDisconnected', socket.id);
    delete players[socket.id];
  });
}

export default initPlayers;