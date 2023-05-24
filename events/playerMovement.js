import getRandomColor from "./getRandomColor.js"

const players = {};

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

  socket.on('chat message', (msg) => {
    const playerId = socket.id;
    const playerName = players[playerId].name;
    const message = `${playerName}: ${msg.message}`;
  
    players[playerId].message = message;

    io.emit('playerMoved', { id: playerId, x: 0, y: 0, message });
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