const app = require('express')();
const httpServer = require('http').createServer(app);

const io = require('socket.io')(httpServer, {
  cors: { origin: '*' }
});

const port =3000;
const users = {};

//listen incoming events
io.on('connection', function (socket) {
  socket.on('new-user-joined', (name) => {

   // console.log("new user", name);
    users[socket.id] = name;

    socket.broadcast.emit('user-joined', name)
  })
  socket.on('send', message => {
    socket.broadcast.emit('recieve', { message: message, name: users[socket.id] })
  })
  socket.on('disconnect', message => {
    socket.broadcast.emit('left', users[socket.id] );
    delete users[socket.id]
  })
})

// io.on('connection', (socket) => {
//   console.log('a user connected');

//   socket.on('message', (message) => {
//     console.log(message);
//     io.emit('message', `${socket.id.substr(0, 2)} said ${message}`);
//   });

//   socket.on('disconnect', () => {
//     console.log('a user disconnected!');
//   });
// });

httpServer.listen(port, () => console.log(`listening on port ${port}`));