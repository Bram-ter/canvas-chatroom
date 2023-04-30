const players = {};
const colors = ['red', 'blue', 'green', 'yellow'];

let nextPlayerIndex = 0;

// Listen for player movement events from the clients
export function initPlayers (socket) {
  // Assign a player index to the new player
  const playerIndex = nextPlayerIndex;
  nextPlayerIndex++;

  // If there are already 4 players, don't allow any more
  if (nextPlayerIndex > 4) {
    console.log('lobby zit vol')
    socket.disconnect();
    return;
  }

  // Assign a color to the new player based on their index
  const color = colors[playerIndex];
  console.log(`User ${color} connected`); 

  socket.emit('playerIndex', playerIndex);

  console.log(playerIndex)

  // Add the new player to the players object
  players[socket.id] = { x: 0, y: 0 };

  // Send the positions of all players to the new player
  socket.emit('allPlayers', players);

  // Broadcast the new player to all other players
  socket.broadcast.emit('newPlayer', socket.id);

  // Emit the player index and color to the new player
  socket.emit('playerIndex', playerIndex);
  socket.emit('playerColor', color);

  socket.on('playerMoved', ({ x, y }) => {
    players[socket.id] = { x, y };
    socket.broadcast.emit('playerMoved', { id: socket.id, x, y });
    
    // Emit the playerMoved event back to the local player
    socket.emit('playerMoved', { id: socket.id, x, y });
  });

  // Listen for disconnect events
  socket.on('disconnect', () => {
    console.log(`User ${color} disconnected`);
    nextPlayerIndex--;
    delete players[socket.id];
    socket.broadcast.emit('playerDisconnected', socket.id);
  });
};

export default initPlayers;