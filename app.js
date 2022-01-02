const { Socket } = require('dgram');
const express = require('express');

const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server, {
    cors: {
      origin: '*',
    }
});

server.listen(process.env.PORT || 8001);

io.on('connection', async (socket) => {
    socket.on('move', (args) => {
        console.log(args)
        io.emit('move', args)
    })

})
