const randomId = require("./handleId");

const roomList = {};
const playerList = {};
const masterList = {};

const authSoccerRoom = (roomId, password) => {
    if(roomList[roomId]) {
        if(roomList[roomId].password && roomList[roomId].password !== password) {
            return {type: "error", message: "Wrong Password"};
        } else {
            if(roomList[roomId].countBlue + roomList[roomId].countRed === 12) {
                return {type: "error", message: "Room was enough people"};
            } else if(roomList[roomId].isPlayed){
                return {type: "error", message: "The game has already started"}
            } else {
                return {type: "success"};
            }
        }
    } else {
        return {type: "error", message: "Room does not exist"};
    }
}

const handleSoccerSocket = (soccerIo) => {
    soccerIo.on('connection', async (socket) => {
        const {type, roomId, name, password, avatar} = socket.handshake.query;
        if(type === 'join') {
            const {type, messsage} = authSoccerRoom(roomId, password);
            if(type === 'error') {
                socket.emit('join', {type, messsage});
            } else {
                socket.join(roomId);
                playerList[socket.id] = {roomId: roomId};
                if(roomList[roomId].countBlue <= roomList[roomId].countRed) {
                    socket.emit('join', {type: 'success', team: 'blue'});
                    const currentPlayer = {socketId: socket.id, name: name, avatar: avatar, team:'blue'};
                    soccerIo.to(roomList[roomId].masterId).emit("join", currentPlayer);
                    roomList[roomId].playerList.push(currentPlayer);
                    playerList[socket.id]["obj"] = currentPlayer;
                    ++roomList[roomId].countBlue;
                } else {
                    socket.emit('join', {type: 'success', team: 'red'});
                    const currentPlayer = {socketId: socket.id, name: name, avatar: avatar, team:'red'};
                    soccerIo.to(roomList[roomId].masterId).emit("join", currentPlayer); 
                    roomList[roomId].playerList.push(currentPlayer);
                    playerList[socket.id]["obj"] = currentPlayer;
                    ++roomList[roomId].countRed;
                }
            }
        }
    
        if(type === 'create') {
            const roomId = randomId(roomList).toString();
            roomList[ roomId] = {masterId: socket.id, playerList: [], countBlue: 0, countRed: 0, isPlayed: false};
            socket.emit('create', {roomId: roomId});
            masterList[socket.id] =roomId;
        }
    
        socket.on('move', (args) => {   
            soccerIo.to(roomList[playerList[socket.id].roomId].masterId).emit("move", {socketId: socket.id, move: args});
        })
    
        socket.on('shoot', () => {
            soccerIo.to(roomList[playerList[socket.id].roomId].masterId).emit('shoot', {socketId: socket.id})
        })
    
        socket.on('changeteam', (args) => {
            const roomId = playerList[socket.id].roomId;
            if(playerList[socket.id].obj.team === 'blue') {
                ++roomList[roomId].countRed;
                --roomList[roomId].countBlue;
                playerList[socket.id].obj.team = 'red';
            } else {
                ++roomList[roomId].countBlue;
                --roomList[roomId].countRed;
                playerList[socket.id].obj.team = 'blue';
            }
            soccerIo.to(roomList[roomId].masterId).emit("changeteam", playerList[socket.id].obj);
        })
    
        socket.on('startgame', () => {
            soccerIo.to(masterList[socket.id]).emit('startgame');
            roomList[masterList[socket.id]].isPlayed = true;
        })
    
        socket.on('endgame', () => {
            soccerIo.to(masterList[socket.id]).emit('endgame');
            roomList[masterList[socket.id]].isPlayed = false;
        })
    
        socket.on('disconnect', () => {
            if(masterList[socket.id]) {
                soccerIo.to(masterList[socket.id]).emit('status', {type: 'error', message: 'The owner has left the room'});
                delete roomList[masterList[socket.id]];
                delete masterList[socket.id];
            } 
    
            if(playerList[socket.id]) {
                if(!roomList[playerList[socket.id].roomId]) return;
                soccerIo.to(roomList[playerList[socket.id].roomId].masterId).emit('status', {type: 'leave', socketId: socket.id});
                roomList[playerList[socket.id].roomId].playerList = roomList[playerList[socket.id].roomId].playerList.filter((player) => player.socketId !== socket.id);
                if(playerList[socket.id].obj.team === 'blue') {
                    --roomList[playerList[socket.id].roomId].countBlue;
                } else {
                    --roomList[playerList[socket.id].roomId].countRed;
                }
                delete playerList[socket.id];
            }
        })
    })
}

module.exports = {handleSoccerSocket, authSoccerRoom}