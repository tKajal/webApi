var express = require('express')

var app = express();
var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost:27017/demo';
var bodyParser = require('body-parser')
var http = require('http').Server(app);
var io = require('socket.io')(http)
mongoose.connect(dbUrl)
pschema = mongoose.Schema({ name: String, message: String });
pModel = mongoose.model("pModel", pschema, "test");
//var Message = new mongoose.model('Message', { name: String, message: String })

io.on('connection', function (socket) {
    console.log('a user connected')
    socket.on('disconnect', function () {
        console.log('a user disconnected')
    })
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname));

app.get('/messages', async (req, res) => {
    let data = await pModel.find()
    res.send(data)
    console.log(data)
})

app.post('/messages', async (req, res) => {
    var message = new pModel(req.body);

    let result = await message.save();
    io.emit('message', req.body);
    if (result) {
        console.log(result)
        res.send(result)
    }
})
var server = http.listen(3000, () => {
    console.log('server is running on port', server.address().port);
});