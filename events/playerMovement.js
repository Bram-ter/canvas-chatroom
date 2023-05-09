const players = {};
const colors = ['red', 'blue', 'green', 'yellow'];

let nextPlayerIndex = 0;

export function initPlayers(socket) {
  const playerIndex = nextPlayerIndex;
  nextPlayerIndex++;

  if (nextPlayerIndex > 4) {
    console.log('lobby zit vol');
    socket.disconnect();
    return;
  }

  const color = colors[playerIndex];
  console.log(`User ${color} with id:${socket.id} connected`);

  players[socket.id] = { x: 0, y: 0 };

  console.log(playerIndex);

  socket.emit('allPlayers', players);

  socket.broadcast.emit('newPlayer', socket.id);

  socket.emit('playerIndex', playerIndex);
  socket.emit('playerColor', color);

  socket.on('playerMoved', ({ x, y }) => {
    players[socket.id] = { x, y };
    socket.broadcast.emit('playerMoved', { id: socket.id, x, y });
    
    // Emit the playerMoved event back to the local player
    socket.emit('playerMoved', { id: socket.id, x, y });
  });

  socket.on('disconnect', () => {
    console.log(`User ${color} disconnected`);

    socket.broadcast.emit('playerDisconnected', socket.id);
    socket.broadcast.emit('playerColor', color);

    delete players[socket.id];

    nextPlayerIndex--;
  });
}

export default initPlayers;