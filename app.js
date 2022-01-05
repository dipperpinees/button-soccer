const express = require('express');
const ejs = require('ejs');
const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server, {
    cors: {
      origin: '*',
    }
});

server.listen(process.env.PORT || 8001);

//register view engine
app.set('view engine', 'ejs');

//middleware & static files
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const roomList = {'100001': {password: '100001'}};
let maxRoomId = 99999;

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/play", (req, res) => {
    res.render("game");
})

app.get("/join", (req, res) => {
    res.render("join");
})

app.get("/remote", (req, res) => {
    res.render("remote");
})

app.post("/room", (req, res) => {
    const {roomId, password} = req.query;
    const {type, message} = auth(roomId, password);
    if(type === "error") {
        res.status(400).json({type, message});
    } else {
        res.status(400).json({type: 'succcess'});
    }
})

io.on('connection', async (socket) => {
    console.log('new user connected')
    const {type, roomId, name, password} = socket.handshake.query;
    if(type === 'join') {
        if(auth(roomId, password).type === 'error') {
            socket.emit('join', 'error');
        } else {
            socket.emit('join', 'success');
            io.to(roomList[roomId].masterId).emit("join", {name})
        }
    }

    if(type === 'create') {
        console.log('create');
        roomList[++maxRoomId] = {masterId: socket.id, listPlayer: []};
        socket.emit('create', {roomId: maxRoomId});
    }

    socket.on('move', (args) => {
        io.emit('move', args)
    })
})

const auth = (roomId, password) => {
    if(roomList[roomId]) {
        if(roomList[roomId].password) {
            if(roomList[roomId].password === password) {
                return {type: "success"};
            } else {
                return {type: "error", message: "Mật khẩu không chính xác"};
            }
        } else {
            return {type: "success"};
        }
    } else {
        return {type: "error", message: "Phòng không tồn tại"};
    }
}

