
var express = require('express');
var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost:27017/demo';
var bodyParser = require('body-parser')
const  ObjectID = require('mongodb').ObjectId;
mongoose.connect(dbUrl)
pschema = mongoose.Schema({ roomId: String,from:Number,count:Number,chats:[{
    user:String,
    message:String,
    phone:String
}] });
pModel = mongoose.model("pModel", pschema, "test");

userschema = mongoose.Schema({ id: Number,
  name: String,
  phone: String,
  image: String,
  roomId: {
    type:Number,
    of: Number
},
countData:[{id:String,count:Number}]
});
userModel = mongoose.model("userModel", userschema, "users");

const app = require('express')();
const httpServer = require('http').createServer(app);
const cors = require('cors');
app.use(cors({
  origin: '*'
}));
const io = require('socket.io')(httpServer, {
  cors: { origin: '*' }
});

const port = 3000;
const users = {};
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname));
//listen incoming events
io.on('connection', function (socket) {


  socket.on('new-user-joined', (user) => {

     console.log("new user", user.name);
    users[socket.id] = user.name;

    socket.broadcast.emit('user-joined', user)
  })
  socket.on('join', (data) => {
    socket.join(data.room);
    socket.broadcast.to(data.room).emit('user joined');
  });

  socket.on('message', (data) => {
    io.in(data.room).emit('new message', { user: data.user, message: data.message });
  });
  // socket.on('send', data => {
  //   socket.broadcast.emit('recieve', { user: data.user, message: data.message })
  // })

  socket.on('send', selectedUserRoomId => {
    socket.broadcast.emit('recieve', { roomId: selectedUserRoomId })
  })
  socket.on('disconnect', data => {
    socket.broadcast.emit('left', data);
    // delete users[socket.id]
  })
})

app.get('/messages', async (req, res) => {
  let data = await pModel.find(req.phone)
  res.send(data)
  console.log(data)
})

app.post('/messages', async (req, res) => {
  console.log(req.body)
  var message = new pModel(req.body);

  let result = await message.save();
  //io.emit('message', req.body);
  if (result) {
    console.log(result)
    res.send(result)
  }
})
app.put('/messages', async (req, res) => {
  console.log(req.body)
  var result = await pModel.updateOne({_id:new  
    ObjectID(req.body._id)}, { $set: req.body });
  //io.emit('message', req.body);
  if (result) {
    console.log(result)
    res.send(result)
  }
})

app.put('/count',async(req,res)=>{
  var result = await pModel.updateOne(
    {roomId:req.body.roomId}, { $set: {count:req.body.count} });
  //io.emit('message', req.body);
  if (result) {
    console.log(result)
    res.send(result)
  }
})
app.get('/count/:roomId/:from', async (req, res) => {
  let data = await pModel.find({roomId:req.params.roomId, from:req.params.from})
  res.send(data.count)
  console.log(data)
})

app.get('/users/:id',async(req,res)=>{
  let data= await userModel.find({user:req.params.id})
  res.send(data)
  console.log(data)
})
app.post('/users', async (req, res) => {
  console.log(req.body)
  var data = new userModel(req.body);

  let result = await data.save();
  //io.emit('message', req.body);
  if (result) {
    console.log(result)
    res.send(result)
  }
})
httpServer.listen(port, () => console.log(`listening on port ${port}`));