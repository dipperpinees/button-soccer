const express = require('express');
const ejs = require('ejs');
const app = express();
const {cloudinaryConfig, storage} = require("./cloudinary");
const cloudinary =  require("cloudinary").v2;
const multer = require("multer");
const cookieParser = require('cookie-parser');
const {handleSoccerSocket, authSoccerRoom} = require("./websocket/soccerSocket");
const handleTowerSocket = require("./websocket/towerSocket");
const server = require("http").Server(app);

const soccerIo = require("socket.io")(server, {
    path: "/bssocket",
    cors: {
      origin: '*',
    }
});

const towerIo = require("socket.io")(server, {
    path: "/towersocket",
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
app.use(cookieParser());

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/bs", (req, res) => {
    res.render("bs/home")
})

app.get("/bs/play", (req, res) => {
    res.render("bs/game");
})

app.get("/bs/join", (req, res) => {
    const {roomId} = req.query;

    res.render("bs/join", {avatar: req.cookies.avatar, roomId: roomId});
})

app.get("/bs/remote", (req, res) => {
    const {name} = req.query;
    res.render("bs/remote", {avatar: req.cookies.avatar, name: name});
})

app.post("/bs/room", (req, res) => {
    const {roomId, password} = req.query;
    const {type, message} = authSoccerRoom(roomId, password);
    if(type === "error") {
        res.status(400).json({type, message});
    } else {
        res.json({type: 'success'});
    }
})

app.post("/avatar", upload.single('avatar'),  (req, res) => {
    const avatar = handleAvatar(req?.file?.path);
    // res.cookie("avatar", avatar);
    res.json({avatar: avatar});
})

app.get("/tower", (req, res) => {
    res.render("tower/home")
})

app.get("/tower/game", (req, res) => {
    res.render("tower/game");
})

app.get("/tower/join", (req, res) => {
    res.render("tower/join");
})

app.get("/tower/remote", (req, res) => {
    res.render("tower/remote");
})

//404 not found
app.get('*', function(req, res){
    res.status(404).render('404');
});

handleSoccerSocket(soccerIo);
handleTowerSocket(towerIo);

const handleAvatar = (url) => {
    const newAvatar = url.substring(0, url.lastIndexOf(".")) + ".png"
    return newAvatar.replace("upload/", `upload/w_100,h_100,c_fill,r_max/`);
}
