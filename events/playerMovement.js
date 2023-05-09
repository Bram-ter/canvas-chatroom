const players = {};
const playerColors = [];

function initPlayers(socket, io) {
  const color = getRandomColor();
  console.log(`User ${color} with id: ${socket.id} connected`);

  players[socket.id] = { x: 0, y: 0, color };

  socket.emit('allPlayers', players);
  socket.broadcast.emit('newPlayer', socket.id);
  io.emit('playerColor', color, socket.id);

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

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  playerColors.push(color); // Add the generated color to the array
  return color;
}

export default initPlayers;