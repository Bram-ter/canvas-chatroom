import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import routes from "./routes/routes.js";
import initPlayers from "./events/playerMovement.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 4200;

app.use(express.static("./public"));

/* Set template engine */
app.set('view engine', 'ejs');

app.use(routes)

io.on('connection', (socket) => {
  initPlayers(socket, io);

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(port, () => console.info(`App listening on port ${port}`));