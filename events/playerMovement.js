// Store the positions of all players
const players = {};

// Keep track of the next player index to assign
let nextPlayerIndex = 0;

// Listen for player movement events from the clients
export function playerMovement (socket, io) {
  console.log(`User ${socket.id} connected`);

  // Assign a player index to the new player
  const playerIndex = nextPlayerIndex + 1;
  nextPlayerIndex++;
  socket.emit('playerIndex', playerIndex);

  console.log(playerIndex)

  // Add the new player to the players object
  players[socket.id] = { x: 0, y: 0 };

  // Send the positions of all players to the new player
  socket.emit('allPlayers', players);

  // Broadcast the new player to all other players
  socket.broadcast.emit('newPlayer', socket.id);

  socket.on('playerMoved', ({ x, y }) => {
    players[socket.id] = { x, y };
    socket.broadcast.emit('playerMoved', { id: socket.id, x, y });
    
    // Emit the playerMoved event back to the local player
    socket.emit('playerMoved', { id: socket.id, x, y });
  });

  // Listen for disconnect events
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
    delete players[socket.id];
    socket.broadcast.emit('playerDisconnected', socket.id);
  });
};

export default playerMovement;