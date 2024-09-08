require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dbUrl = process.env.MONGO_URL;
const bodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectId;

mongoose.connect(dbUrl);

const pschema = mongoose.Schema({
  roomId: String,
  from: Number,
  count: Number,
  chats: [
    {
      user: String,
      message: String,
      phone: String,
    },
  ],
});

const pModel = mongoose.model('pModel', pschema, 'test');

const userschema = mongoose.Schema({
  id: Number,
  name: String,
  phone: String,
  image: String,
  roomId: {
    type: Number,
    of: Number,
  },
  countData: [{ id: String, count: Number }],
});

const userModel = mongoose.model('userModel', userschema, 'users');

const app = express();
const httpServer = require('http').createServer(app);
app.use(cors({ origin: '*' }));
const io = require('socket.io')(httpServer, {
  cors: { origin: '*' },
});
const port = process.env.port;
const users = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

io.on('connection', function (socket) {
  socket.on('new-user-joined', (user) => {
    console.log('new user', user.name);
    users[socket.id] = user.name;
    socket.broadcast.emit('user-joined', user);
  });

  socket.on('join', (data) => {
    socket.join(data.room);
    socket.broadcast.to(data.room).emit('user joined');
  });

  socket.on('message', (data) => {
    io.in(data.room).emit('new message', { user: data.user, message: data.message });
  });

  socket.on('send', (selectedUserRoomId) => {
    socket.broadcast.emit('recieve', { roomId: selectedUserRoomId });
  });

  socket.on('disconnect', (data) => {
    socket.broadcast.emit('left', data);
  });
});

app.get('/messages', async (req, res) => {
  let data = await pModel.find(req.phone);
  res.send(data);
  console.log(data);
});

app.post('/messages', async (req, res) => {
  console.log(req.body);
  var message = new pModel(req.body);
  let result = await message.save();
  if (result) {
    console.log(result);
    res.send(result);
  }
});

app.put('/messages', async (req, res) => {
  console.log(req.body);
  var result = await pModel.updateOne(
    { _id: new ObjectID(req.body._id) },
    { $set: req.body }
  );
  if (result) {
    console.log(result);
    res.send(result);
  }
});

app.get('/count/:roomId/:from', async (req, res) => {
  let data = await pModel.find({ roomId: req.params.roomId, from: req.params.from });
  res.send(data.count);
  console.log(data);
});

app.get('/users/:id', async (req, res) => {
  let data = await userModel.find({ user: req.params.id });
  res.send(data);
  console.log(data);
});

app.get('/test', async (req, res) => {
  res.send({ test: 'iuri' });
  res.end();
});

app.post('/users', async (req, res) => {
  console.log(req.body);
  var data = new userModel(req.body);
  let result = await data.save();
  if (result) {
    console.log(result);
    res.send(result);
  }
});

httpServer.listen(port, () => console.log(`listening on port ${port}`));

// Export the app for Vercel
module.exports = app;
