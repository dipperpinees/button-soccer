const express = require('express');
const ejs = require('ejs');
const app = express();
const {cloudinaryConfig, storage} = require("./cloudinary");
const cloudinary =  require("cloudinary").v2;
const multer = require("multer");

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

const upload = multer({ storage: storage });

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
        res.json({type: 'succcess'});
    }
})

app.post("/avatar", upload.single('avatar'),  (req, res) => {
    const avatar = req?.file?.path;
    res.json({avatar});
})

const roomList = {};
let maxRoomId = 99999;
const listPlayer = {};
const listMaster = {};

io.on('connection', async (socket) => {
    console.log('new user connected');
    const {type, roomId, name, password, avatar} = socket.handshake.query;
    if(type === 'join') {
        const {type, messsage} = auth(roomId, password);
        if(type === 'error') {
            socket.emit('join', {type, messsage});
        } else {
            socket.join(roomId);
            listPlayer[socket.id] = {roomId: roomId};
            if(roomList[roomId].countBlue <= roomList[roomId].countRed) {
                socket.emit('join', {type: 'success', team: 'blue'});
                const currentPlayer = {socketId: socket.id, name: name, avatar: avatar, team:'blue'};
                io.to(roomList[roomId].masterId).emit("join", currentPlayer);
                roomList[roomId].listPlayer.push(currentPlayer);
                listPlayer[socket.id]["obj"] = currentPlayer;
                ++roomList[roomId].countBlue;
            } else {
                socket.emit('join', {type: 'success', team: 'red'});
                const currentPlayer = {socketId: socket.id, name: name, avatar: avatar, team:'red'};
                io.to(roomList[roomId].masterId).emit("join", currentPlayer); 
                roomList[roomId].listPlayer.push(currentPlayer);
                listPlayer[socket.id]["obj"] = currentPlayer;
                ++roomList[roomId].countRed;
            }
        }
    }

    if(type === 'create') {
        roomList[ (++maxRoomId).toString()] = {masterId: socket.id, listPlayer: [], countBlue: 0, countRed: 0, isPlayed: false};
        socket.emit('create', {roomId: maxRoomId.toString()});
        listMaster[socket.id] = maxRoomId.toString();
    }

    socket.on('move', (args) => {   
        io.to(roomList[listPlayer[socket.id].roomId].masterId).emit("move", {socketId: socket.id, move: args});
    })

    // socket.on('player', (args) => {
    //     io.to(roomList[listPlayer[socket.id].roomId].masterId).emit("player", {socketId: socket.id, player: args, team: listPlayer[socket.id].obj.team});
    //     listPlayer[socket.id].obj.player = args;
    // } )

    socket.on('changeteam', (args) => {
        const roomId = listPlayer[socket.id].roomId;
        if(listPlayer[socket.id].obj.team === 'blue') {
            ++roomList[roomId].countRed;
            --roomList[roomId].countBlue;
            listPlayer[socket.id].obj.team = 'red';
        } else {
            ++roomList[roomId].countBlue;
            --roomList[roomId].countRed;
            listPlayer[socket.id].obj.team = 'blue';
        }
        io.to(roomList[roomId].masterId).emit("changeteam", listPlayer[socket.id].obj);
    })

    socket.on('startgame', () => {
        io.to(listMaster[socket.id]).emit('startgame');
        roomList[listMaster[socket.id]].isPlayed = true;
    })

    socket.on('endgame', () => {
        io.to(listMaster[socket.id]).emit('endgame');
        roomList[listMaster[socket.id]].isPlayed = false;
    })

    socket.on('test', (args) => {
        console.log(args);
    })

    socket.on('disconnect', () => {
        if(listMaster[socket.id]) {
            io.to(listMaster[socket.id]).emit('status', {type: 'error', message: 'The owner has left the room'});
            delete listMaster[socket.id];
            delete roomList[listMaster[socket.id]];
        } 

        if(listPlayer[socket.id]) {
            io.to(roomList[listPlayer[socket.id].roomId].masterId).emit('status', {type: 'leave', socketId: socket.id});
            roomList[listPlayer[socket.id].roomId].listPlayer = roomList[listPlayer[socket.id].roomId].listPlayer.filter((player) => player.socketId !== socket.id);
            if(listPlayer[socket.id].obj.team === 'blue') {
                --roomList[listPlayer[socket.id].roomId].countBlue;
            } else {
                --roomList[listPlayer[socket.id].roomId].countRed;
            }
            delete listPlayer[socket.id];
        }
    })
})

const auth = (roomId, password) => {
    if(roomList[roomId]) {

        if(roomList[roomId].password && roomList[roomId].password !== password) {
            return {type: "error", message: "Mật khẩu không chính xác"};
        } else {
            if(roomList[roomId].countBlue + roomList[roomId].countRed === 12) {
                return {type: "error", message: "Phòng đã đủ người"};
            } else if(roomList[roomId].isPlayed){
                return {type: "error", message: "Game đã bắt đầu"}
            } else {
                return {type: "success"};
            }
        }
    } else {
        return {type: "error", message: "Phòng không tồn tại"};
    }
}

