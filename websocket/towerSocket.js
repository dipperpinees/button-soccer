const randomId = require("./handleId");

const roomList = {};
const playerList = {};
const masterList= {};

module.exports = (towerIo) => {
    towerIo.on('connection', async (socket) => {
        const {type, roomId, name, avatar} = socket.handshake.query;
        if(type === 'create') {
            const roomId = randomId(roomList).toString();
            roomList[roomId] = {masterId: socket.id, listPlayer: [], isPlayed: false};
            socket.emit('create', {roomId: roomId});
            masterList[socket.id] = roomId;
        }
    
        if(type === 'join') {
            if(!roomList[roomId]) {
                socket.emit("error", "Don't exist this room")
            } else if(roomList[roomId].isPlayer) {
                socket.emit("error", "This room has played");
            } else {
                socket.join(roomId);
                const newPlayer = {roomId: roomId, name: name, avatar: avatar, socketId: socket.id}
                towerIo.to(roomList[roomId].masterId).emit("join", newPlayer);
                playerList[socket.id] = newPlayer;
                if(roomList[roomId].listPlayer.length === 0) {
                    socket.emit("showstart");
                }
                roomList[roomId].listPlayer.push(newPlayer);
            }
        }
    
        socket.on("play", () => {
            if(masterList[socket.id]) {
                roomList[masterList[socket.id]].isPlayed = true;
            }
            towerIo.to(roomList[playerList[socket.id].roomId].masterId).emit("play")
        })

        socket.on("newturn", (args) => {
            towerIo.to(masterList[socket.id]).emit("newturn", args)
        })

        socket.on("touch", () => {
            towerIo.to(roomList[playerList[socket.id].roomId].masterId).emit("touch")
        })

        socket.on("endgame", () => {
            roomList[masterList[socket.id]].isPlayed = false;
            towerIo.to(roomList[masterList[socket.id]].listPlayer[0].socketId).emit("showstart");
        })

        socket.on('disconnect', () => {
            if(masterList[socket.id]) {
                towerIo.to(masterList[socket.id]).emit("error", "The owner has left the room");
                delete roomList[masterList[socket.id]];
                delete masterList[socket.id];
            } 

            if(playerList[socket.id]) {
                const roomId = playerList[socket.id].roomId;
                delete playerList[socket.id];
                if(!roomList[roomId]) return;
                towerIo.to(roomList[roomId].masterId).emit('status', {type: 'leave', socketId: socket.id});
                roomList[roomId].listPlayer = roomList[roomId].listPlayer.filter((player) => player.socketId !== socket.id);
            }
        })
    })
}